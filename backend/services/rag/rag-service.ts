import { searchVectors, QueryResult } from './vector-service';
import { DocumentChunk } from '../../models/DocumentChunk.model';
import { Document } from '../../models/Document.model';
import { logger } from '../../utils/logger';

export interface RAGQueryInput {
  query: string;
  userId: string;
  documentIds?: string[];
  topK?: number;
  minScore?: number;
}

export interface RAGContext {
  query: string;
  relevantChunks: RelevantChunk[];
  totalChunks: number;
  contextText: string;
}

export interface RelevantChunk {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  score: number;
  metadata?: {
    pageNumber?: number;
    section?: string;
  };
}

/**
 * Perform RAG query: Search for relevant document chunks
 */
export const performRAGQuery = async (input: RAGQueryInput): Promise<RAGContext> => {
  const { query, userId, documentIds, topK = 5, minScore = 0.5 } = input;

  logger.info('Performing RAG query', {
    userId,
    query: query.substring(0, 100),
    documentIds,
    topK,
    minScore
  });

  try {
    // Build filter for Pinecone query
    const filter: Record<string, any> = {
      userId: { $eq: userId }
    };

    // If specific documents are requested, filter by them
    if (documentIds && documentIds.length > 0) {
      filter.documentId = { $in: documentIds };
    }

    // Search vectors in Pinecone
    logger.info('Starting vector search', {
      query: query.substring(0, 100),
      filter: JSON.stringify(filter),
      topK: topK * 2,
      minScore
    });

    const searchResults = await searchVectors({
      query,
      topK: topK * 2, // Get more results for filtering
      filter,
      minScore
    });

    logger.info('Vector search completed', {
      resultsFound: searchResults.length,
      topScore: searchResults[0]?.score,
      allScores: searchResults.map(r => r.score).slice(0, 5),
      documentIds: [...new Set(searchResults.map(r => r.metadata.documentId))]
    });

    // If no results found
    if (searchResults.length === 0) {
      logger.warn('No relevant chunks found for query', { query: query.substring(0, 50) });
      return {
        query,
        relevantChunks: [],
        totalChunks: 0,
        contextText: ''
      };
    }

    // Get top K results
    const topResults = searchResults.slice(0, topK);

    // Fetch chunk IDs from top results (Pinecone vector IDs match MongoDB _ids)
    const chunkIds = topResults.map((r) => r.id);

    // Fetch actual chunks from MongoDB to get text content
    // This is more efficient than storing large text in Pinecone metadata
    const chunks = await DocumentChunk.find({ _id: { $in: chunkIds } }).select(
      'content documentId chunkIndex'
    );

    // Create chunk map for quick lookup
    const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk]));

    // Get document information for each chunk
    const documentIds_unique = [...new Set(searchResults.map((r) => r.metadata.documentId))];
    const documents = await Document.find({ _id: { $in: documentIds_unique } }).select(
      'originalName fileName'
    );

    const documentMap = new Map(
      documents.map((doc) => [doc.id, doc.originalName || doc.fileName])
    );

    // Build relevant chunks with document context
    // Text is now fetched from MongoDB instead of Pinecone metadata
    const relevantChunks: RelevantChunk[] = topResults
      .map((result) => {
        const chunk = chunkMap.get(result.id);
        if (!chunk) {
          logger.warn('Chunk not found in MongoDB', { vectorId: result.id });
          return null;
        }

        return {
          documentId: result.metadata.documentId,
          documentName: documentMap.get(result.metadata.documentId) || 'Unknown',
          chunkIndex: result.metadata.chunkIndex,
          content: chunk.content, // Fetched from MongoDB, not Pinecone metadata
          score: result.score,
          metadata: {
            pageNumber: result.metadata.pageNumber as number | undefined,
            section: result.metadata.section as string | undefined
          }
        };
      })
      .filter((chunk): chunk is RelevantChunk => chunk !== null);

    // Build context text from relevant chunks
    const contextText = relevantChunks
      .map(
        (chunk, index) =>
          `[Document: ${chunk.documentName}, Chunk ${chunk.chunkIndex + 1}, Relevance: ${(chunk.score * 100).toFixed(1)}%]\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    logger.info('RAG context built successfully', {
      relevantChunks: relevantChunks.length,
      contextLength: contextText.length,
      avgScore: (
        relevantChunks.reduce((sum, c) => sum + c.score, 0) / relevantChunks.length
      ).toFixed(3)
    });

    return {
      query,
      relevantChunks,
      totalChunks: searchResults.length,
      contextText
    };
  } catch (error: any) {
    logger.error('RAG query failed', {
      error: error.message,
      query: query.substring(0, 100)
    });
    throw new Error(`RAG query failed: ${error.message}`);
  }
};

/**
 * Get available documents for a user
 */
export const getAvailableDocuments = async (userId: string) => {
  try {
    const documents = await Document.find({
      userId,
      vectorized: true
    })
      .select('originalName fileName fileType chunkCount createdAt')
      .sort({ createdAt: -1 });

    return documents.map((doc) => ({
      id: doc.id,
      name: doc.originalName || doc.fileName,
      fileType: doc.fileType,
      chunkCount: doc.chunkCount,
      createdAt: doc.createdAt
    }));
  } catch (error: any) {
    logger.error('Failed to get available documents', {
      error: error.message,
      userId
    });
    throw new Error(`Failed to get available documents: ${error.message}`);
  }
};

/**
 * Validate that user has access to documents
 */
export const validateDocumentAccess = async (
  userId: string,
  documentIds: string[]
): Promise<boolean> => {
  try {
    const count = await Document.countDocuments({
      _id: { $in: documentIds },
      userId,
      vectorized: true
    });

    return count === documentIds.length;
  } catch (error) {
    logger.error('Failed to validate document access', { error, userId, documentIds });
    return false;
  }
};
