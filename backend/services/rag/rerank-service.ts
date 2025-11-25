import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { DocumentChunk } from '../../models/DocumentChunk.model';

/**
 * Re-ranking Service
 *
 * Re-ranks initial retrieval results using more sophisticated relevance models.
 * Two strategies supported:
 * 1. Cohere Rerank API (if API key available) - Best quality
 * 2. LLM-based scoring (fallback) - Good quality, works with OpenAI only
 *
 * Re-ranking significantly improves precision by:
 * - Using cross-attention between query and document
 * - Better understanding of semantic relevance
 * - Filtering out false positives from initial retrieval
 *
 * Typical workflow:
 * - Initial retrieval: Get top 20-50 candidates (high recall)
 * - Re-ranking: Score and select best 5-10 (high precision)
 */

export interface RerankInput {
  query: string;
  chunkIds: string[]; // IDs of chunks to re-rank
  topK?: number; // How many to return after re-ranking
  model?: 'cohere' | 'llm'; // Which re-ranking model to use
}

export interface RerankResult {
  chunkId: string;
  rerankScore: number;
  originalScore?: number; // Original retrieval score
  rank: number;
}

export interface RerankConfig {
  cohereApiKey?: string;
  cohereModel?: string; // e.g., 'rerank-english-v3.0', 'rerank-multilingual-v3.0'
  maxChunksPerRequest?: number; // Cohere limit
}

// Initialize OpenAI for LLM-based re-ranking
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

/**
 * Re-rank using Cohere Rerank API
 * Best quality but requires Cohere API key
 */
async function rerankWithCohere(
  query: string,
  chunks: Array<{ id: string; content: string }>,
  config: RerankConfig
): Promise<RerankResult[]> {
  const { cohereApiKey, cohereModel = 'rerank-multilingual-v3.0' } = config;

  if (!cohereApiKey) {
    throw new Error('Cohere API key not provided');
  }

  logger.info('Re-ranking with Cohere API', {
    model: cohereModel,
    chunksCount: chunks.length
  });

  try {
    // Call Cohere Rerank API
    const response = await fetch('https://api.cohere.ai/v1/rerank', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: cohereModel,
        query,
        documents: chunks.map((c) => c.content),
        top_n: chunks.length, // Get scores for all
        return_documents: false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    // Map results back to chunk IDs
    const results: RerankResult[] = data.results.map((result: any, index: number) => ({
      chunkId: chunks[result.index].id,
      rerankScore: result.relevance_score, // 0-1 scale
      rank: index + 1
    }));

    logger.info('Cohere re-ranking completed', {
      resultsCount: results.length,
      topScore: results[0]?.rerankScore.toFixed(3)
    });

    return results;
  } catch (error: any) {
    logger.error('Cohere re-ranking failed', {
      error: error.message
    });
    throw new Error(`Cohere re-ranking failed: ${error.message}`);
  }
}

/**
 * Re-rank using LLM-based relevance scoring
 * Uses OpenAI to score relevance of each chunk to query
 * Fallback method when Cohere is not available
 */
async function rerankWithLLM(
  query: string,
  chunks: Array<{ id: string; content: string }>
): Promise<RerankResult[]> {
  logger.info('Re-ranking with LLM', {
    chunksCount: chunks.length
  });

  try {
    // Batch score chunks (process multiple at once for efficiency)
    const batchSize = 5;
    const results: RerankResult[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));

      // Create relevance scoring prompt
      const scoringPrompt = `Rate the relevance of each document chunk to the query on a scale of 0-100.

Query: "${query}"

Documents:
${batch.map((chunk, idx) => `${idx + 1}. ${chunk.content.substring(0, 500)}...`).join('\n\n')}

Respond ONLY with a JSON array of relevance scores (0-100), one for each document.
Example: [85, 42, 91, 15, 67]

Scores:`;

      const response = await openai.chat.completions.create({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a relevance scoring system. Score how relevant each document is to the query. Higher scores mean more relevant.'
          },
          {
            role: 'user',
            content: scoringPrompt
          }
        ],
        temperature: 0.0, // Deterministic scoring
        max_tokens: 100
      });

      const scoresText = response.choices[0]?.message?.content || '[]';

      // Parse scores
      let scores: number[];
      try {
        scores = JSON.parse(scoresText);
      } catch {
        // Fallback: try to extract numbers from text
        scores = scoresText.match(/\d+/g)?.map(Number) || [];
      }

      // Add to results
      batch.forEach((chunk, idx) => {
        results.push({
          chunkId: chunk.id,
          rerankScore: (scores[idx] || 0) / 100, // Normalize to 0-1
          rank: 0 // Will be set after sorting
        });
      });
    }

    // Sort by score and assign ranks
    results.sort((a, b) => b.rerankScore - a.rerankScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    logger.info('LLM re-ranking completed', {
      resultsCount: results.length,
      topScore: results[0]?.rerankScore.toFixed(3)
    });

    return results;
  } catch (error: any) {
    logger.error('LLM re-ranking failed', {
      error: error.message
    });
    throw new Error(`LLM re-ranking failed: ${error.message}`);
  }
}

/**
 * Main re-ranking function
 * Fetches chunks from MongoDB and re-ranks them
 */
export async function rerankChunks(input: RerankInput, config: RerankConfig = {}): Promise<RerankResult[]> {
  const { query, chunkIds, topK = 5, model = 'llm' } = input;

  logger.info('Starting re-ranking', {
    query: query.substring(0, 100),
    chunksCount: chunkIds.length,
    topK,
    model
  });

  try {
    // Fetch chunk contents from MongoDB
    const chunks = await DocumentChunk.find({
      _id: { $in: chunkIds }
    }).select('content').lean();

    if (chunks.length === 0) {
      logger.warn('No chunks found for re-ranking');
      return [];
    }

    // Prepare chunks for re-ranking
    const chunksToRerank = chunks.map((chunk) => ({
      id: chunk._id.toString(),
      content: chunk.content
    }));

    // Re-rank using selected model
    let results: RerankResult[];

    if (model === 'cohere' && config.cohereApiKey) {
      results = await rerankWithCohere(query, chunksToRerank, config);
    } else {
      // Use LLM re-ranking as fallback
      if (model === 'cohere' && !config.cohereApiKey) {
        logger.warn('Cohere requested but no API key provided, falling back to LLM');
      }
      results = await rerankWithLLM(query, chunksToRerank);
    }

    // Return top K results
    const topResults = results.slice(0, topK);

    logger.info('Re-ranking completed', {
      totalResults: results.length,
      returnedResults: topResults.length,
      topScore: topResults[0]?.rerankScore.toFixed(3),
      avgScore: topResults.length > 0
        ? (topResults.reduce((sum, r) => sum + r.rerankScore, 0) / topResults.length).toFixed(3)
        : 0
    });

    return topResults;
  } catch (error: any) {
    logger.error('Re-ranking failed', {
      error: error.message,
      query: query.substring(0, 100)
    });
    throw new Error(`Re-ranking failed: ${error.message}`);
  }
}

/**
 * Helper: Merge original scores with rerank scores
 * Useful for combining initial retrieval confidence with re-ranking
 */
export function mergeScores(
  originalResults: Array<{ id: string; score: number }>,
  rerankResults: RerankResult[],
  alpha: number = 0.7 // Weight for rerank score (0-1)
): RerankResult[] {
  const originalScoreMap = new Map(originalResults.map((r) => [r.id, r.score]));

  return rerankResults.map((rerank) => ({
    ...rerank,
    originalScore: originalScoreMap.get(rerank.chunkId),
    rerankScore:
      alpha * rerank.rerankScore +
      (1 - alpha) * (originalScoreMap.get(rerank.chunkId) || 0)
  }));
}
