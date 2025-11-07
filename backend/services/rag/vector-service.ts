import { Index, RecordMetadata } from '@pinecone-database/pinecone';
import { getOrCreateIndex } from '../../config/pinecone';
import { logger } from '../../utils/logger';
import { generateEmbedding, generateBatchEmbeddings } from './embedding-service';

export interface VectorMetadata {
  documentId: string;
  userId: string;
  chunkIndex: number;
  text: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  [key: string]: string | number | boolean | string[];
}

export interface UpsertVectorInput {
  id: string;
  text: string;
  metadata: VectorMetadata;
}

export interface BatchUpsertInput {
  vectors: UpsertVectorInput[];
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
  text: string;
}

export interface SearchInput {
  query: string;
  topK?: number;
  filter?: Record<string, any>;
  minScore?: number;
}

let indexInstance: Index | null = null;

/**
 * Get Pinecone index instance
 */
const getIndex = async (): Promise<Index> => {
  if (!indexInstance) {
    indexInstance = await getOrCreateIndex();
  }
  return indexInstance;
};

/**
 * Upsert a single vector to Pinecone
 */
export const upsertVector = async (input: UpsertVectorInput): Promise<void> => {
  try {
    const { id, text, metadata } = input;

    logger.debug('Upserting vector to Pinecone', {
      id,
      textLength: text.length
    });

    // Generate embedding for the text
    const { embedding } = await generateEmbedding(text);

    // Get index and upsert
    const index = await getIndex();
    await index.upsert([
      {
        id,
        values: embedding,
        metadata: metadata as Record<string, any>
      }
    ]);

    logger.debug('Vector upserted successfully', { id });
  } catch (error: any) {
    logger.error('Failed to upsert vector', {
      error: error.message,
      id: input.id
    });
    throw new Error(`Failed to upsert vector: ${error.message}`);
  }
};

/**
 * Upsert multiple vectors in batch
 * Pinecone recommends batches of 100 vectors
 */
export const batchUpsertVectors = async (input: BatchUpsertInput): Promise<void> => {
  try {
    const { vectors } = input;

    if (vectors.length === 0) {
      logger.warn('No vectors to upsert');
      return;
    }

    logger.info('Batch upserting vectors to Pinecone', {
      vectorCount: vectors.length
    });

    // Generate embeddings for all texts in batch
    const texts = vectors.map((v) => v.text);
    const { embeddings } = await generateBatchEmbeddings(texts);

    // Prepare vectors for Pinecone
    const pineconeVectors = vectors.map((vector, index) => ({
      id: vector.id,
      values: embeddings[index],
      metadata: vector.metadata as Record<string, any>
    }));

    // Upsert in batches of 100
    const index = await getIndex();
    const batchSize = 100;

    for (let i = 0; i < pineconeVectors.length; i += batchSize) {
      const batch = pineconeVectors.slice(i, Math.min(i + batchSize, pineconeVectors.length));

      logger.debug('Upserting batch to Pinecone', {
        batchIndex: Math.floor(i / batchSize) + 1,
        batchSize: batch.length
      });

      await index.upsert(batch);
    }

    logger.info('Batch upsert completed successfully', {
      totalVectors: vectors.length
    });
  } catch (error: any) {
    logger.error('Failed to batch upsert vectors', {
      error: error.message,
      vectorCount: input.vectors.length
    });
    throw new Error(`Failed to batch upsert vectors: ${error.message}`);
  }
};

/**
 * Search for similar vectors
 */
export const searchVectors = async (input: SearchInput): Promise<QueryResult[]> => {
  try {
    const { query, topK = 5, filter, minScore = 0.0 } = input;

    logger.debug('Searching vectors in Pinecone', {
      queryLength: query.length,
      topK,
      filter
    });

    // Generate embedding for the query
    const { embedding } = await generateEmbedding(query);

    // Query Pinecone
    const index = await getIndex();
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      filter,
      includeMetadata: true
    });

    // Process results
    const results: QueryResult[] = (queryResponse.matches || [])
      .filter((match) => match.score !== undefined && match.score >= minScore)
      .map((match) => ({
        id: match.id,
        score: match.score!,
        metadata: match.metadata as VectorMetadata,
        text: (match.metadata as VectorMetadata)?.text || ''
      }));

    logger.info('Vector search completed', {
      resultsFound: results.length,
      topScore: results[0]?.score
    });

    return results;
  } catch (error: any) {
    logger.error('Failed to search vectors', {
      error: error.message,
      query: input.query.substring(0, 100)
    });
    throw new Error(`Failed to search vectors: ${error.message}`);
  }
};

/**
 * Delete vectors by IDs
 */
export const deleteVectors = async (ids: string[]): Promise<void> => {
  try {
    if (ids.length === 0) {
      logger.warn('No vector IDs provided for deletion');
      return;
    }

    logger.info('Deleting vectors from Pinecone', {
      vectorCount: ids.length
    });

    const index = await getIndex();
    await index.deleteMany(ids);

    logger.info('Vectors deleted successfully', {
      deletedCount: ids.length
    });
  } catch (error: any) {
    logger.error('Failed to delete vectors', {
      error: error.message,
      vectorCount: ids.length
    });
    throw new Error(`Failed to delete vectors: ${error.message}`);
  }
};

/**
 * Delete all vectors for a document
 */
export const deleteDocumentVectors = async (documentId: string): Promise<void> => {
  try {
    logger.info('Deleting all vectors for document', { documentId });

    const index = await getIndex();

    // Delete by metadata filter
    await index.deleteMany({
      documentId: { $eq: documentId }
    });

    logger.info('Document vectors deleted successfully', { documentId });
  } catch (error: any) {
    logger.error('Failed to delete document vectors', {
      error: error.message,
      documentId
    });
    throw new Error(`Failed to delete document vectors: ${error.message}`);
  }
};

/**
 * Delete all vectors for a user
 */
export const deleteUserVectors = async (userId: string): Promise<void> => {
  try {
    logger.info('Deleting all vectors for user', { userId });

    const index = await getIndex();

    // Delete by metadata filter
    await index.deleteMany({
      userId: { $eq: userId }
    });

    logger.info('User vectors deleted successfully', { userId });
  } catch (error: any) {
    logger.error('Failed to delete user vectors', {
      error: error.message,
      userId
    });
    throw new Error(`Failed to delete user vectors: ${error.message}`);
  }
};

/**
 * Get index statistics
 */
export const getIndexStats = async () => {
  try {
    const index = await getIndex();
    const stats = await index.describeIndexStats();

    logger.debug('Retrieved index stats', stats);

    return stats;
  } catch (error: any) {
    logger.error('Failed to get index stats', {
      error: error.message
    });
    throw new Error(`Failed to get index stats: ${error.message}`);
  }
};
