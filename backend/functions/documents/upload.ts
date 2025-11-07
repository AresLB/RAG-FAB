import { Request, Response } from 'express';
import path from 'path';
import { User } from '../../models/User.model';
import { Document } from '../../models/Document.model';
import { UsageRecord } from '../../models/UsageRecord.model';
import { validateUploadedFile, getFileSizeLimit } from '../../middleware/upload.middleware';
import { processDocumentWithRAG } from '../../services/documents/document-processor';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { IDocumentUploadResponse } from '../../../shared/types/document.types';
import { AppError, SubscriptionLimitError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

/**
 * Upload document
 * @route POST /api/v1/documents/upload
 * @access Private
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  // Validate file was uploaded
  validateUploadedFile(req.file);
  const file = req.file!;

  logger.info(`Document upload attempt by user: ${userId}, file: ${file.originalname}`);

  // Get user with subscription info
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(ApiErrorCode.USER_NOT_FOUND, 'User not found', HttpStatus.NOT_FOUND);
  }

  // Check if user can upload more documents
  if (!user.canUploadDocument()) {
    throw new SubscriptionLimitError('documents');
  }

  // Check file size against user's subscription limit
  const maxSize = getFileSizeLimit(user.subscription.plan);
  if (file.size > maxSize) {
    throw new AppError(
      ApiErrorCode.FILE_TOO_LARGE,
      `File size exceeds limit. Maximum allowed: ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
      HttpStatus.BAD_REQUEST
    );
  }

  // Get count of user's current documents
  const currentDocCount = await Document.countDocuments({ userId });

  // Process document
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, file.filename);

    const result = await processDocumentWithRAG({
      userId,
      filename: file.filename,
      originalName: file.originalname,
      filePath,
      fileSize: file.size
    });

    // Update user's document count
    user.subscription.documentsUsed = currentDocCount + 1;
    await user.save();

    // Create usage record
    await UsageRecord.create({
      userId,
      type: 'document_upload',
      metadata: {
        documentId: result.documentId,
        fileName: file.originalname,
        fileSize: file.size
      }
    });

    logger.info(`Document uploaded successfully: ${result.documentId}`);

    // Prepare response
    const uploadResponse: IDocumentUploadResponse = {
      documentId: result.documentId,
      fileName: file.originalname,
      status: result.status,
      message: 'Document uploaded and processed successfully'
    };

    const response: IApiResponse<IDocumentUploadResponse> = {
      success: true,
      data: uploadResponse,
      message: 'Document uploaded successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.CREATED).json(response);
  } catch (error) {
    logger.error('Document upload failed:', error);
    throw new AppError(
      ApiErrorCode.DOCUMENT_UPLOAD_FAILED,
      `Failed to process document: ${error}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});
