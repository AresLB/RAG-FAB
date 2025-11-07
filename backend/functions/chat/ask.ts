import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { validateDocumentAccess } from '../../services/rag/rag-service';
import { generateChatCompletion } from '../../services/chat/chat-service';
import {
  getOrCreateConversation,
  addMessage
} from '../../services/chat/conversation-service';
import { MessageRole } from '../../../shared/types/chat.types';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError, SubscriptionLimitError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';
import { UsageRecord } from '../../models/UsageRecord.model';

export interface AskQuestionRequest {
  question: string;
  documentIds?: string[];
  conversationId?: string;
  model?: string;
}

export interface AskQuestionResponse {
  answer: string;
  conversationId: string;
  messageId: string;
  sources: Array<{
    documentId: string;
    documentName: string;
    chunkIndex: number;
    content: string;
    score: number;
  }>;
  metadata: {
    tokensUsed: number;
    processingTime: number;
    model: string;
    relevantChunksFound: number;
  };
}

/**
 * Ask a question to the RAG system
 * @route POST /api/v1/chat/ask
 * @access Private
 */
export const askQuestion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  const { question, documentIds, conversationId, model }: AskQuestionRequest = req.body;

  // Validation
  if (!question || question.trim().length === 0) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      'Question is required',
      HttpStatus.BAD_REQUEST
    );
  }

  if (question.length > 1000) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      'Question cannot exceed 1000 characters',
      HttpStatus.BAD_REQUEST
    );
  }

  logger.info('Question asked', {
    userId,
    questionLength: question.length,
    documentIds,
    conversationId
  });

  // Get user with subscription info
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(ApiErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
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
        HttpStatus.FORBIDDEN
      );
    }
  }

  try {
    // Get or create conversation
    const conversation = await getOrCreateConversation({
      userId,
      title: question.substring(0, 100), // Use first 100 chars as title
      documentIds: documentIds || []
    });

    // Get conversation history for context (last 6 messages)
    const { Message } = await import('../../models/Message.model');
    const recentMessages = await Message.find({
      conversationId: conversation.id
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('role content');

    const conversationHistory = recentMessages
      .reverse()
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

    // Generate chat completion with RAG
    const completion = await generateChatCompletion({
      query: question,
      userId,
      documentIds,
      conversationHistory,
      model
    });

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

    logger.info('Question answered successfully', {
      userId,
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      tokensUsed: completion.tokensUsed,
      sourcesFound: completion.ragContext.relevantChunks.length
    });

    // Prepare response
    const askResponse: AskQuestionResponse = {
      answer: completion.answer,
      conversationId: conversation.id,
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
    };

    const response: IApiResponse<AskQuestionResponse> = {
      success: true,
      data: askResponse,
      message: 'Question answered successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to answer question', {
      error: error.message,
      userId,
      question: question.substring(0, 100)
    });
    throw new AppError(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to answer question: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});
