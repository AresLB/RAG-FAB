import { Request, Response } from 'express';
import { listUserDocuments } from '../../services/documents/document-processor';
import { IApiResponse, HttpStatus, IPaginatedResponse, ApiErrorCode } from '../../../shared/types/api.types';
import { DocumentStatus } from '../../../shared/types/document.types';
import { AppError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';

/**
 * List user's documents
 * @route GET /api/v1/documents
 * @access Private
 */
export const listDocuments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  // Parse query parameters
  const status = req.query.status as DocumentStatus | undefined;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;

  // Get documents
  const result = await listUserDocuments(userId, { status, limit, offset });

  // Prepare paginated response
  const response: IPaginatedResponse<any> = {
    success: true,
    data: result.documents,
    pagination: {
      total: result.total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(result.total / limit),
      hasMore: offset + limit < result.total
    },
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.OK).json(response);
});
