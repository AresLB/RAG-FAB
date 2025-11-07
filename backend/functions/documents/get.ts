import { Request, Response } from 'express';
import { getDocumentById } from '../../services/documents/document-processor';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';

/**
 * Get document by ID
 * @route GET /api/v1/documents/:id
 * @access Private
 */
export const getDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;
  const documentId = req.params.id;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  if (!documentId) {
    throw new AppError(ApiErrorCode.VALIDATION_ERROR, 'Document ID is required', HttpStatus.BAD_REQUEST);
  }

  try {
    const document = await getDocumentById(documentId, userId);

    const response: IApiResponse = {
      success: true,
      data: document,
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
});
