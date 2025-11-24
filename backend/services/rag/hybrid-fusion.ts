import { logger } from '../../utils/logger';
import { BM25Result } from './bm25-service';
import { QueryResult } from './vector-service';

/**
 * Hybrid Search Fusion Service
 *
 * Combines results from multiple retrieval methods (BM25 keyword + semantic vector search)
 * using Reciprocal Rank Fusion (RRF) - a proven, effective fusion method
 */

export interface FusedResult {
  chunkId: string;
  fusedScore: number;
  bm25Score?: number;
  semanticScore?: number;
  rank: number;
  documentId: string;
  chunkIndex: number;
}

export interface HybridFusionConfig {
  /**
   * Weight for BM25 keyword search (0-1)
   * Higher = more emphasis on exact keyword matching
   * Default: 0.5 (equal weight)
   */
  bm25Weight?: number;

  /**
   * Weight for semantic search (0-1)
   * Higher = more emphasis on semantic meaning
   * Default: 0.5 (equal weight)
   */
  semanticWeight?: number;

  /**
   * Fusion method to use
   * - 'rrf': Reciprocal Rank Fusion (default, recommended)
   * - 'weighted': Weighted linear combination of normalized scores
   */
  fusionMethod?: 'rrf' | 'weighted';

  /**
   * RRF constant (k parameter)
   * Controls the influence of rank position
   * Typical values: 60 (default), range 10-100
   * Higher k = less emphasis on top rankings
   */
  rrfK?: number;
}

/**
 * Reciprocal Rank Fusion (RRF)
 *
 * RRF combines multiple ranked lists by assigning scores based on rank position
 * Formula: RRF(d) = Σ 1/(k + rank(d))
 *
 * Benefits:
 * - No score normalization needed
 * - Robust to outliers
 * - Works well even when score distributions differ greatly
 * - Well-tested in information retrieval research
 */
function reciprocalRankFusion(
  bm25Results: BM25Result[],
  semanticResults: QueryResult[],
  config: HybridFusionConfig
): FusedResult[] {
  const k = config.rrfK || 60;
  const bm25Weight = config.bm25Weight || 0.5;
  const semanticWeight = config.semanticWeight || 0.5;

  // Create maps for quick lookup
  const bm25Map = new Map(bm25Results.map((r, index) => [r.chunkId, { ...r, rank: index + 1 }]));
  const semanticMap = new Map(
    semanticResults.map((r, index) => [r.id, { ...r, rank: index + 1 }])
  );

  // Get all unique chunk IDs from both result sets
  const allChunkIds = new Set([...bm25Map.keys(), ...semanticMap.keys()]);

  // Calculate RRF score for each chunk
  const fusedResults: FusedResult[] = [];

  for (const chunkId of allChunkIds) {
    const bm25Result = bm25Map.get(chunkId);
    const semanticResult = semanticMap.get(chunkId);

    // Calculate RRF scores
    const bm25RRF = bm25Result ? 1 / (k + bm25Result.rank) : 0;
    const semanticRRF = semanticResult ? 1 / (k + semanticResult.rank) : 0;

    // Weighted combination
    const fusedScore = bm25Weight * bm25RRF + semanticWeight * semanticRRF;

    // Get metadata from whichever result exists
    const result = bm25Result || semanticResult;
    if (!result) continue;

    fusedResults.push({
      chunkId,
      fusedScore,
      bm25Score: bm25Result?.score,
      semanticScore: semanticResult?.score,
      rank: 0, // Will be set after sorting
      documentId: bm25Result?.documentId || semanticResult!.metadata.documentId,
      chunkIndex: bm25Result?.chunkIndex || semanticResult!.metadata.chunkIndex
    });
  }

  // Sort by fused score and assign ranks
  fusedResults.sort((a, b) => b.fusedScore - a.fusedScore);
  fusedResults.forEach((result, index) => {
    result.rank = index + 1;
  });

  return fusedResults;
}

/**
 * Weighted Linear Combination
 *
 * Combines normalized scores using weighted average
 * Requires score normalization to 0-1 range
 */
function weightedCombination(
  bm25Results: BM25Result[],
  semanticResults: QueryResult[],
  config: HybridFusionConfig
): FusedResult[] {
  const bm25Weight = config.bm25Weight || 0.5;
  const semanticWeight = config.semanticWeight || 0.5;

  // Normalize BM25 scores (0-1)
  const bm25Scores = bm25Results.map((r) => r.score);
  const bm25Min = Math.min(...bm25Scores);
  const bm25Max = Math.max(...bm25Scores);
  const bm25Range = bm25Max - bm25Min || 1; // Avoid division by zero

  // Semantic scores are already 0-1 (cosine similarity)

  // Create maps
  const bm25Map = new Map(
    bm25Results.map((r) => [
      r.chunkId,
      { ...r, normalizedScore: (r.score - bm25Min) / bm25Range }
    ])
  );
  const semanticMap = new Map(semanticResults.map((r) => [r.id, r]));

  // Get all unique chunk IDs
  const allChunkIds = new Set([...bm25Map.keys(), ...semanticMap.keys()]);

  // Calculate weighted scores
  const fusedResults: FusedResult[] = [];

  for (const chunkId of allChunkIds) {
    const bm25Result = bm25Map.get(chunkId);
    const semanticResult = semanticMap.get(chunkId);

    const bm25Score = bm25Result?.normalizedScore || 0;
    const semanticScore = semanticResult?.score || 0;

    // Weighted average
    const fusedScore = bm25Weight * bm25Score + semanticWeight * semanticScore;

    const result = bm25Result || semanticResult;
    if (!result) continue;

    fusedResults.push({
      chunkId,
      fusedScore,
      bm25Score: bm25Result?.score,
      semanticScore: semanticResult?.score,
      rank: 0,
      documentId: bm25Result?.documentId || semanticResult!.metadata.documentId,
      chunkIndex: bm25Result?.chunkIndex || semanticResult!.metadata.chunkIndex
    });
  }

  // Sort and assign ranks
  fusedResults.sort((a, b) => b.fusedScore - a.fusedScore);
  fusedResults.forEach((result, index) => {
    result.rank = index + 1;
  });

  return fusedResults;
}

/**
 * Fuse BM25 and semantic search results
 *
 * @param bm25Results - Results from BM25 keyword search
 * @param semanticResults - Results from vector semantic search
 * @param config - Fusion configuration
 * @returns Fused and ranked results
 */
export function fuseSearchResults(
  bm25Results: BM25Result[],
  semanticResults: QueryResult[],
  config: HybridFusionConfig = {}
): FusedResult[] {
  const method = config.fusionMethod || 'rrf';

  logger.debug('Fusing search results', {
    method,
    bm25Count: bm25Results.length,
    semanticCount: semanticResults.length,
    bm25Weight: config.bm25Weight || 0.5,
    semanticWeight: config.semanticWeight || 0.5
  });

  let fusedResults: FusedResult[];

  if (method === 'rrf') {
    fusedResults = reciprocalRankFusion(bm25Results, semanticResults, config);
  } else {
    fusedResults = weightedCombination(bm25Results, semanticResults, config);
  }

  logger.info('Hybrid fusion completed', {
    method,
    fusedCount: fusedResults.length,
    topScore: fusedResults[0]?.fusedScore.toFixed(4),
    hasBothScores: fusedResults.filter((r) => r.bm25Score && r.semanticScore).length,
    bm25Only: fusedResults.filter((r) => r.bm25Score && !r.semanticScore).length,
    semanticOnly: fusedResults.filter((r) => !r.bm25Score && r.semanticScore).length
  });

  return fusedResults;
}

/**
 * Get recommended fusion config based on query characteristics
 * Automatically adjusts weights based on query type
 */
export function getRecommendedConfig(query: string): HybridFusionConfig {
  // If query contains exact terms in quotes, favor keyword search
  if (/"[^"]+"/g.test(query)) {
    return {
      bm25Weight: 0.7,
      semanticWeight: 0.3,
      fusionMethod: 'rrf'
    };
  }

  // If query contains special characters or codes, favor keyword search
  if (/[\d\-_.#]/g.test(query)) {
    return {
      bm25Weight: 0.6,
      semanticWeight: 0.4,
      fusionMethod: 'rrf'
    };
  }

  // Default: balanced hybrid search
  return {
    bm25Weight: 0.5,
    semanticWeight: 0.5,
    fusionMethod: 'rrf',
    rrfK: 60
  };
}
