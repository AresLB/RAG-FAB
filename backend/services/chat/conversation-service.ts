import { Conversation } from '../../models/Conversation.model';
import { Message } from '../../models/Message.model';
import { ConversationStatus, MessageRole } from '../../../shared/types/chat.types';
import { logger } from '../../utils/logger';
import { RelevantChunk } from '../rag/rag-service';

export interface CreateConversationInput {
  userId: string;
  title: string;
  documentIds?: string[];
}

export interface AddMessageInput {
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  sources?: RelevantChunk[];
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    model?: string;
  };
}

export interface GetConversationHistoryInput {
  conversationId: string;
  userId: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new conversation
 */
export const createConversation = async (input: CreateConversationInput) => {
  const { userId, title, documentIds = [] } = input;

  logger.info('Creating new conversation', { userId, title, documentIds });

  try {
    const conversation = await Conversation.create({
      userId,
      documentIds,
      title,
      status: ConversationStatus.ACTIVE,
      messageCount: 0
    });

    logger.info('Conversation created', { conversationId: conversation.id });

    return conversation;
  } catch (error: any) {
    logger.error('Failed to create conversation', { error: error.message, userId });
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
};

/**
 * Get or create a conversation
 */
export const getOrCreateConversation = async (input: CreateConversationInput) => {
  const { userId, title, documentIds } = input;

  try {
    // Check if there's an active conversation with same documents
    const existingConversation = await Conversation.findOne({
      userId,
      status: ConversationStatus.ACTIVE,
      documentIds: { $size: documentIds?.length || 0, $all: documentIds || [] }
    }).sort({ updatedAt: -1 });

    if (existingConversation) {
      logger.info('Using existing conversation', { conversationId: existingConversation.id });
      return existingConversation;
    }

    // Create new conversation
    return await createConversation(input);
  } catch (error: any) {
    logger.error('Failed to get or create conversation', { error: error.message });
    throw new Error(`Failed to get or create conversation: ${error.message}`);
  }
};

/**
 * Add a message to a conversation
 */
export const addMessage = async (input: AddMessageInput) => {
  const { conversationId, userId, role, content, sources, metadata } = input;

  logger.debug('Adding message to conversation', {
    conversationId,
    role,
    contentLength: content.length
  });

  try {
    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    // Format sources for storage
    const messageSources = sources?.map((source) => ({
      documentId: source.documentId,
      documentName: source.documentName,
      chunkIndex: source.chunkIndex,
      content: source.content,
      similarity: source.score,
      pageNumber: source.metadata?.pageNumber
    }));

    // Create message
    const message = await Message.create({
      conversationId,
      role,
      content,
      sources: messageSources || [],
      metadata: metadata || {}
    });

    // Update conversation
    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    logger.debug('Message added successfully', { messageId: message.id });

    return message;
  } catch (error: any) {
    logger.error('Failed to add message', {
      error: error.message,
      conversationId
    });
    throw new Error(`Failed to add message: ${error.message}`);
  }
};

/**
 * Get conversation history (messages)
 */
export const getConversationHistory = async (input: GetConversationHistoryInput) => {
  const { conversationId, userId, limit = 50, offset = 0 } = input;

  logger.debug('Getting conversation history', { conversationId, limit, offset });

  try {
    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }) // Chronological order
      .skip(offset)
      .limit(limit)
      .select('-__v');

    const total = await Message.countDocuments({ conversationId });

    return {
      conversation,
      messages,
      total,
      limit,
      offset
    };
  } catch (error: any) {
    logger.error('Failed to get conversation history', {
      error: error.message,
      conversationId
    });
    throw new Error(`Failed to get conversation history: ${error.message}`);
  }
};

/**
 * List user's conversations
 */
export const listUserConversations = async (
  userId: string,
  options: {
    status?: ConversationStatus;
    limit?: number;
    offset?: number;
  } = {}
) => {
  const { status, limit = 20, offset = 0 } = options;

  logger.debug('Listing user conversations', { userId, limit, offset });

  try {
    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .select('-__v');

    const total = await Conversation.countDocuments(filter);

    return {
      conversations,
      total,
      limit,
      offset
    };
  } catch (error: any) {
    logger.error('Failed to list conversations', { error: error.message, userId });
    throw new Error(`Failed to list conversations: ${error.message}`);
  }
};

/**
 * Delete a conversation and all its messages
 */
export const deleteConversation = async (conversationId: string, userId: string) => {
  logger.info('Deleting conversation', { conversationId, userId });

  try {
    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    // Delete all messages
    const deletedMessages = await Message.deleteMany({ conversationId });

    // Delete conversation
    await Conversation.deleteOne({ _id: conversationId });

    logger.info('Conversation deleted successfully', {
      conversationId,
      messagesDeleted: deletedMessages.deletedCount
    });

    return {
      success: true,
      messagesDeleted: deletedMessages.deletedCount
    };
  } catch (error: any) {
    logger.error('Failed to delete conversation', {
      error: error.message,
      conversationId
    });
    throw new Error(`Failed to delete conversation: ${error.message}`);
  }
};

/**
 * Update conversation title
 */
export const updateConversationTitle = async (
  conversationId: string,
  userId: string,
  title: string
) => {
  try {
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      { title },
      { new: true }
    );

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }

    logger.info('Conversation title updated', { conversationId, title });

    return conversation;
  } catch (error: any) {
    logger.error('Failed to update conversation title', {
      error: error.message,
      conversationId
    });
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }
};
