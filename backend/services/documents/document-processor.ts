import path from 'path';
import fs from 'fs/promises';
import { Document } from '../../models/Document.model';
import { DocumentStatus, DocumentType } from '../../../shared/types/document.types';
import { extractText, getDocumentType, cleanText } from '../ocr/text-extractor';
import { logger } from '../../utils/logger';

export interface ProcessDocumentInput {
  userId: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
}

export interface ProcessDocumentResult {
  documentId: string;
  status: DocumentStatus;
  textExtracted?: string;
  metadata?: any;
}

/**
 * Process uploaded document
 * - Create database entry
 * - Extract text
 * - Update status
 */
export const processDocument = async (
  input: ProcessDocumentInput
): Promise<ProcessDocumentResult> => {
  const { userId, filename, originalName, filePath, fileSize } = input;

  logger.info(`Processing document: ${originalName} for user: ${userId}`);

  try {
    // Get file type
    const fileType = getDocumentType(originalName);

    // Create document entry in database
    const document = await Document.create({
      userId,
      fileName: filename,
      originalName,
      fileType,
      fileSize,
      status: DocumentStatus.PROCESSING,
      chunkCount: 0,
      vectorized: false
    });

    logger.info(`Document created in DB: ${document.id}`);

    // Extract text
    try {
      const extractionResult = await extractText(filePath, fileType);
      const cleanedText = cleanText(extractionResult.text);

      // Update document with extracted text
      document.textExtracted = cleanedText;
      document.status = DocumentStatus.READY;
      document.metadata = extractionResult.metadata;

      await document.save();

      logger.info(`Text extraction successful for document: ${document.id}`);

      return {
        documentId: document.id,
        status: DocumentStatus.READY,
        textExtracted: cleanedText,
        metadata: extractionResult.metadata
      };
    } catch (extractionError) {
      logger.error('Text extraction failed:', extractionError);

      // Mark document as failed
      document.status = DocumentStatus.FAILED;
      if (document.metadata) {
        document.metadata.error = String(extractionError);
      } else {
        document.metadata = { error: String(extractionError) };
      }
      await document.save();

      throw new Error(`Text extraction failed: ${extractionError}`);
    }
  } catch (error) {
    logger.error('Document processing failed:', error);
    throw error;
  }
};

/**
 * Delete document and its file
 */
export const deleteDocument = async (documentId: string, userId: string): Promise<void> => {
  logger.info(`Deleting document: ${documentId} for user: ${userId}`);

  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    throw new Error('Document not found or unauthorized');
  }

  // Delete file from disk
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, document.fileName);
    await fs.unlink(filePath);
    logger.info(`File deleted: ${filePath}`);
  } catch (fileError) {
    logger.warn(`Failed to delete file: ${fileError}`);
    // Continue even if file deletion fails
  }

  // Delete from database
  await Document.deleteOne({ _id: documentId });
  logger.info(`Document deleted from DB: ${documentId}`);
};

/**
 * Get document by ID
 */
export const getDocumentById = async (documentId: string, userId: string) => {
  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    throw new Error('Document not found or unauthorized');
  }

  return document;
};

/**
 * List user's documents
 */
export const listUserDocuments = async (
  userId: string,
  options: {
    status?: DocumentStatus;
    limit?: number;
    offset?: number;
  } = {}
) => {
  const { status, limit = 20, offset = 0 } = options;

  const filter: any = { userId };
  if (status) {
    filter.status = status;
  }

  const documents = await Document.find(filter)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  const total = await Document.countDocuments(filter);

  return {
    documents,
    total,
    limit,
    offset
  };
};
