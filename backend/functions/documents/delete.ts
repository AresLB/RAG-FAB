import { Request, Response } from 'express';
import { deleteDocument } from '../../services/documents/document-processor';
import { User } from '../../models/User.model';
import { Document } from '../../models/Document.model';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

/**
 * Delete document
 * @route DELETE /api/v1/documents/:id
 * @access Private
 */
export const deleteDocumentEndpoint = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    const documentId = req.params.id;

    if (!userId) {
      throw new AppError(
        ApiErrorCode.UNAUTHORIZED,
        'User not authenticated',
        HttpStatus.UNAUTHORIZED
      );
    }

    if (!documentId) {
      throw new AppError(
        ApiErrorCode.VALIDATION_ERROR,
        'Document ID is required',
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      // Delete document
      await deleteDocument(documentId, userId);

      // Update user's document count
      const user = await User.findById(userId);
      if (user && user.subscription.documentsUsed > 0) {
        user.subscription.documentsUsed -= 1;
        await user.save();
      }

      logger.info(`Document deleted: ${documentId} by user: ${userId}`);

      const response: IApiResponse = {
        success: true,
        message: 'Document deleted successfully',
        timestamp: new Date().toISOString()
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      throw new AppError(
        ApiErrorCode.DOCUMENT_NOT_FOUND,
        'Document not found',
        HttpStatus.NOT_FOUND
      );
    }
  }
);
