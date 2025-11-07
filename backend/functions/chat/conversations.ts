import { Request, Response } from 'express';
import {
  listUserConversations,
  getConversationHistory,
  deleteConversation,
  updateConversationTitle
} from '../../services/chat/conversation-service';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

/**
 * List user's conversations
 * @route GET /api/v1/chat/conversations
 * @access Private
 */
export const listConversations = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(
        ApiErrorCode.UNAUTHORIZED,
        'User not authenticated',
        HttpStatus.UNAUTHORIZED
      );
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;

    logger.debug('Listing conversations', { userId, limit, offset, status });

    const result = await listUserConversations(userId, {
      status: status as any,
      limit,
      offset
    });

    const response: IApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Conversations retrieved successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Get conversation history (messages)
 * @route GET /api/v1/chat/conversations/:id
 * @access Private
 */
export const getConversation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(
        ApiErrorCode.UNAUTHORIZED,
        'User not authenticated',
        HttpStatus.UNAUTHORIZED
      );
    }

    const conversationId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    logger.debug('Getting conversation history', { userId, conversationId, limit, offset });

    const result = await getConversationHistory({
      conversationId,
      userId,
      limit,
      offset
    });

    const response: IApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Conversation history retrieved successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Delete a conversation
 * @route DELETE /api/v1/chat/conversations/:id
 * @access Private
 */
export const deleteConversationEndpoint = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(
        ApiErrorCode.UNAUTHORIZED,
        'User not authenticated',
        HttpStatus.UNAUTHORIZED
      );
    }

    const conversationId = req.params.id;

    logger.info('Deleting conversation', { userId, conversationId });

    const result = await deleteConversation(conversationId, userId);

    const response: IApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Conversation deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  }
);

/**
 * Update conversation title
 * @route PATCH /api/v1/chat/conversations/:id
 * @access Private
 */
export const updateConversation = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError(
        ApiErrorCode.UNAUTHORIZED,
        'User not authenticated',
        HttpStatus.UNAUTHORIZED
      );
    }

    const conversationId = req.params.id;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      throw new AppError(
        ApiErrorCode.VALIDATION_ERROR,
        'Title is required',
        HttpStatus.BAD_REQUEST
      );
    }

    if (title.length > 200) {
      throw new AppError(
        ApiErrorCode.VALIDATION_ERROR,
        'Title cannot exceed 200 characters',
        HttpStatus.BAD_REQUEST
      );
    }

    logger.debug('Updating conversation title', { userId, conversationId, title });

    const conversation = await updateConversationTitle(conversationId, userId, title);

    const response: IApiResponse<typeof conversation> = {
      success: true,
      data: conversation,
      message: 'Conversation updated successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  }
);
