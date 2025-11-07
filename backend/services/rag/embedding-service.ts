import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

export interface BatchEmbeddingResult {
  embeddings: number[][];
  model: string;
  totalTokens: number;
}

// OpenAI embedding models
export enum EmbeddingModel {
  TEXT_EMBEDDING_3_SMALL = 'text-embedding-3-small', // 1536 dimensions, best cost/performance
  TEXT_EMBEDDING_3_LARGE = 'text-embedding-3-large', // 3072 dimensions, highest quality
  TEXT_EMBEDDING_ADA_002 = 'text-embedding-ada-002'  // 1536 dimensions, legacy
}

const DEFAULT_MODEL = EmbeddingModel.TEXT_EMBEDDING_3_SMALL;

/**
 * Generate embedding for a single text
 */
export const generateEmbedding = async (
  text: string,
  model: EmbeddingModel = DEFAULT_MODEL
): Promise<EmbeddingResult> => {
  try {
    logger.debug('Generating embedding', {
      textLength: text.length,
      model
    });

    const response = await openai.embeddings.create({
      model,
      input: text,
      encoding_format: 'float'
    });

    const embedding = response.data[0].embedding;
    const tokens = response.usage.total_tokens;

    logger.debug('Embedding generated successfully', {
      dimensions: embedding.length,
      tokens
    });

    return {
      embedding,
      model,
      tokens
    };
  } catch (error: any) {
    logger.error('Failed to generate embedding', {
      error: error.message,
      model,
      textLength: text.length
    });
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};

/**
 * Generate embeddings for multiple texts in batch
 * OpenAI allows up to 2048 texts per batch
 */
export const generateBatchEmbeddings = async (
  texts: string[],
  model: EmbeddingModel = DEFAULT_MODEL,
  batchSize: number = 100
): Promise<BatchEmbeddingResult> => {
  try {
    if (texts.length === 0) {
      return {
        embeddings: [],
        model,
        totalTokens: 0
      };
    }

    logger.info('Generating batch embeddings', {
      textCount: texts.length,
      model,
      batchSize
    });

    const allEmbeddings: number[][] = [];
    let totalTokens = 0;

    // Process in batches to avoid rate limits and memory issues
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, Math.min(i + batchSize, texts.length));

      logger.debug('Processing batch', {
        batchIndex: Math.floor(i / batchSize) + 1,
        batchSize: batch.length
      });

      const response = await openai.embeddings.create({
        model,
        input: batch,
        encoding_format: 'float'
      });

      // Extract embeddings in order
      const batchEmbeddings = response.data
        .sort((a, b) => a.index - b.index)
        .map(item => item.embedding);

      allEmbeddings.push(...batchEmbeddings);
      totalTokens += response.usage.total_tokens;

      logger.debug('Batch processed', {
        embeddingsGenerated: batchEmbeddings.length,
        tokensUsed: response.usage.total_tokens
      });
    }

    logger.info('Batch embeddings generated successfully', {
      totalEmbeddings: allEmbeddings.length,
      totalTokens,
      avgTokensPerText: Math.round(totalTokens / texts.length)
    });

    return {
      embeddings: allEmbeddings,
      model,
      totalTokens
    };
  } catch (error: any) {
    logger.error('Failed to generate batch embeddings', {
      error: error.message,
      model,
      textCount: texts.length
    });
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
};

/**
 * Calculate cosine similarity between two embeddings
 * Returns a value between -1 and 1 (higher is more similar)
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Get embedding dimensions for a specific model
 */
export const getEmbeddingDimensions = (model: EmbeddingModel): number => {
  switch (model) {
    case EmbeddingModel.TEXT_EMBEDDING_3_SMALL:
    case EmbeddingModel.TEXT_EMBEDDING_ADA_002:
      return 1536;
    case EmbeddingModel.TEXT_EMBEDDING_3_LARGE:
      return 3072;
    default:
      return 1536;
  }
};
