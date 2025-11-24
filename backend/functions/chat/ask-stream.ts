import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { validateDocumentAccess } from '../../services/rag/rag-service';
import { streamChatCompletion } from '../../services/chat/chat-service';
import {
  getOrCreateConversation,
  addMessage
} from '../../services/chat/conversation-service';
import { MessageRole } from '../../../shared/types/chat.types';
import { ApiErrorCode } from '../../../shared/types/api.types';
import { AppError, SubscriptionLimitError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { UsageRecord } from '../../models/UsageRecord.model';

export interface AskQuestionStreamRequest {
  question: string;
  documentIds?: string[];
  conversationId?: string;
  model?: string;
}

/**
 * Ask a question to the RAG system with streaming response
 * @route POST /api/v1/chat/ask/stream
 * @access Private
 */
export const askQuestionStream = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', 401);
    }

    const { question, documentIds, conversationId, model }: AskQuestionStreamRequest =
      req.body;

    // Validation
    if (!question || question.trim().length === 0) {
      throw new AppError(ApiErrorCode.VALIDATION_ERROR, 'Question is required', 400);
    }

    if (question.length > 1000) {
      throw new AppError(
        ApiErrorCode.VALIDATION_ERROR,
        'Question cannot exceed 1000 characters',
        400
      );
    }

    logger.info('Streaming question asked', {
      userId,
      questionLength: question.length,
      documentIds,
      conversationId
    });

    // Get user with subscription info
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(ApiErrorCode.USER_NOT_FOUND, 'User not found', 404);
    }

    // Check if user can ask more questions
    if (!user.canAskQuestion()) {
      throw new SubscriptionLimitError('questions');
    }

    // Validate document access if specific documents are requested
    if (documentIds && documentIds.length > 0) {
      const hasAccess = await validateDocumentAccess(userId, documentIds);
      if (!hasAccess) {
        throw new AppError(
          ApiErrorCode.UNAUTHORIZED,
          'You do not have access to one or more of the requested documents',
          403
        );
      }
    }

    // Set up SSE (Server-Sent Events) headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in nginx

    try {
      // Get or create conversation
      const conversation = await getOrCreateConversation({
        userId,
        title: question.substring(0, 100),
        documentIds: documentIds || []
      });

      // Get conversation history for context
      const { Message } = await import('../../models/Message.model');
      const recentMessages = await Message.find({
        conversationId: conversation.id
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('role content');

      const conversationHistory = recentMessages.reverse().map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Send initial metadata
      res.write(
        `data: ${JSON.stringify({
          type: 'metadata',
          conversationId: conversation.id
        })}\n\n`
      );

      // Stream chat completion with RAG
      const completion = await streamChatCompletion(
        {
          query: question,
          userId,
          documentIds,
          conversationHistory,
          model
        },
        // Chunk callback - send each chunk as SSE
        (chunk: string) => {
          res.write(
            `data: ${JSON.stringify({
              type: 'chunk',
              content: chunk
            })}\n\n`
          );
        },
        // Complete callback
        () => {
          logger.debug('Streaming completed, preparing final data');
        }
      );

      // Save user question to conversation
      await addMessage({
        conversationId: conversation.id,
        userId,
        role: MessageRole.USER,
        content: question
      });

      // Save assistant answer to conversation
      const assistantMessage = await addMessage({
        conversationId: conversation.id,
        userId,
        role: MessageRole.ASSISTANT,
        content: completion.answer,
        sources: completion.ragContext.relevantChunks,
        metadata: {
          tokensUsed: completion.tokensUsed,
          processingTime: completion.processingTime,
          model: completion.model
        }
      });

      // Update user's question count
      user.subscription.questionsUsed += 1;
      await user.save();

      // Create usage record
      await UsageRecord.create({
        userId,
        type: 'question',
        metadata: {
          conversationId: conversation.id,
          messageId: assistantMessage.id,
          tokensUsed: completion.tokensUsed,
          model: completion.model
        }
      });

      // Send final metadata with sources
      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          messageId: assistantMessage.id,
          sources: completion.ragContext.relevantChunks.map((chunk) => ({
            documentId: chunk.documentId,
            documentName: chunk.documentName,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            score: chunk.score
          })),
          metadata: {
            tokensUsed: completion.tokensUsed,
            processingTime: completion.processingTime,
            model: completion.model,
            relevantChunksFound: completion.ragContext.relevantChunks.length
          }
        })}\n\n`
      );

      logger.info('Streaming question answered successfully', {
        userId,
        conversationId: conversation.id,
        messageId: assistantMessage.id,
        tokensUsed: completion.tokensUsed,
        sourcesFound: completion.ragContext.relevantChunks.length
      });

      // Close the stream
      res.end();
    } catch (error: any) {
      logger.error('Failed to answer streaming question', {
        error: error.message,
        userId,
        question: question.substring(0, 100)
      });

      // Send error event
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: error.message
        })}\n\n`
      );

      res.end();
    }
  }
);
