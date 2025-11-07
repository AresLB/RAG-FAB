import path from 'path';
import fs from 'fs/promises';
import { Document } from '../../models/Document.model';
import { DocumentChunk } from '../../models/DocumentChunk.model';
import { DocumentStatus, DocumentType } from '../../../shared/types/document.types';
import { extractText, getDocumentType, cleanText } from '../ocr/text-extractor';
import { chunkText } from '../rag/text-chunker';
import { batchUpsertVectors, deleteDocumentVectors } from '../rag/vector-service';
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
 * Process document with full RAG pipeline
 * - Extract text
 * - Chunk text
 * - Generate embeddings
 * - Store in Pinecone
 * - Save chunks to database
 */
export const processDocumentWithRAG = async (
  input: ProcessDocumentInput
): Promise<ProcessDocumentResult> => {
  const { userId, filename, originalName, filePath, fileSize } = input;

  logger.info(`Processing document with RAG: ${originalName} for user: ${userId}`);

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

    // Step 1: Extract text
    const extractionResult = await extractText(filePath, fileType);
    const cleanedText = cleanText(extractionResult.text);

    document.textExtracted = cleanedText;
    document.metadata = extractionResult.metadata;
    await document.save();

    logger.info(`Text extraction successful for document: ${document.id}`);

    // Step 2: Chunk text
    document.status = DocumentStatus.CHUNKING;
    await document.save();

    const chunkResult = chunkText(cleanedText, {}, {
      fileName: originalName,
      fileType
    });

    logger.info(`Text chunked into ${chunkResult.totalChunks} chunks`);

    // Step 3: Prepare chunks for database and Pinecone
    document.status = DocumentStatus.EMBEDDING;
    await document.save();

    const chunks = chunkResult.chunks.map((chunk) => ({
      documentId: document.id,
      userId,
      chunkIndex: chunk.index,
      content: chunk.text,
      metadata: chunk.metadata
    }));

    // Save chunks to MongoDB
    const savedChunks = await DocumentChunk.insertMany(chunks);

    logger.info(`Saved ${savedChunks.length} chunks to database`);

    // Step 4: Prepare vectors for Pinecone
    const vectors = savedChunks.map((chunk) => ({
      id: chunk.id, // Use MongoDB _id as Pinecone vector ID
      text: chunk.content,
      metadata: {
        documentId: document.id,
        userId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.content,
        fileName: originalName,
        fileType,
        createdAt: chunk.createdAt.toISOString()
      }
    }));

    // Step 5: Upsert to Pinecone
    await batchUpsertVectors({ vectors });

    logger.info(`Upserted ${vectors.length} vectors to Pinecone`);

    // Step 6: Update chunks with vector IDs
    const updatePromises = savedChunks.map((chunk) =>
      DocumentChunk.updateOne({ _id: chunk.id }, { vectorId: chunk.id })
    );
    await Promise.all(updatePromises);

    // Step 7: Mark document as ready and vectorized
    document.status = DocumentStatus.READY;
    document.vectorized = true;
    document.chunkCount = savedChunks.length;
    await document.save();

    logger.info(`Document processing with RAG completed: ${document.id}`);

    return {
      documentId: document.id,
      status: DocumentStatus.READY,
      textExtracted: cleanedText,
      metadata: {
        ...extractionResult.metadata,
        chunkCount: savedChunks.length,
        vectorized: true
      }
    };
  } catch (error: any) {
    logger.error('Document RAG processing failed:', error);

    // Try to find and mark document as failed
    try {
      const document = await Document.findOne({ fileName: filename, userId });
      if (document) {
        document.status = DocumentStatus.FAILED;
        if (document.metadata) {
          document.metadata.error = error.message;
        } else {
          document.metadata = { error: error.message };
        }
        await document.save();
      }
    } catch (updateError) {
      logger.error('Failed to update document status:', updateError);
    }

    throw new Error(`Document RAG processing failed: ${error.message}`);
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

  // Delete vectors from Pinecone if document was vectorized
  if (document.vectorized) {
    try {
      await deleteDocumentVectors(documentId);
      logger.info(`Vectors deleted from Pinecone for document: ${documentId}`);
    } catch (vectorError) {
      logger.warn(`Failed to delete vectors from Pinecone: ${vectorError}`);
      // Continue even if vector deletion fails
    }
  }

  // Delete chunks from database
  try {
    const deletedChunks = await DocumentChunk.deleteMany({ documentId });
    logger.info(`Deleted ${deletedChunks.deletedCount} chunks for document: ${documentId}`);
  } catch (chunkError) {
    logger.warn(`Failed to delete chunks: ${chunkError}`);
    // Continue even if chunk deletion fails
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
