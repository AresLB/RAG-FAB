import { DocumentChunk } from '../../models/DocumentChunk.model';
import { logger } from '../../utils/logger';

/**
 * BM25 (Best Matching 25) Search Service
 * Implements keyword-based relevance scoring for text retrieval
 *
 * BM25 is a probabilistic ranking function that scores documents based on:
 * - Term frequency (how often query terms appear in doc)
 * - Inverse document frequency (rarity of terms across all docs)
 * - Document length normalization (prevents bias toward long docs)
 */

export interface BM25SearchInput {
  query: string;
  userId: string;
  documentIds?: string[];
  topK?: number;
}

export interface BM25Result {
  chunkId: string;
  score: number;
  documentId: string;
  chunkIndex: number;
}

// BM25 parameters (tuned for optimal performance)
const K1 = 1.5; // Term frequency saturation parameter (1.2-2.0 typical)
const B = 0.75; // Length normalization parameter (0.5-0.8 typical)

/**
 * Tokenize text into searchable terms
 * - Converts to lowercase
 * - Removes punctuation
 * - Filters out very short terms
 * - Handles German and English text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\säöüß]/g, ' ') // Keep letters, numbers, spaces, German umlauts
    .split(/\s+/)
    .filter((term) => term.length > 2); // Filter very short terms
}

/**
 * Calculate term frequency in a document
 */
function termFrequency(term: string, tokens: string[]): number {
  return tokens.filter((t) => t === term).length;
}

/**
 * Calculate inverse document frequency
 * IDF(t) = log((N - n(t) + 0.5) / (n(t) + 0.5) + 1)
 * Where N = total docs, n(t) = docs containing term t
 */
function calculateIDF(term: string, documentTokens: string[][], totalDocs: number): number {
  const docsWithTerm = documentTokens.filter((tokens) => tokens.includes(term)).length;

  // Avoid division by zero and negative values
  if (docsWithTerm === 0) return 0;

  return Math.log(
    ((totalDocs - docsWithTerm + 0.5) / (docsWithTerm + 0.5)) + 1
  );
}

/**
 * Calculate BM25 score for a document given a query
 *
 * BM25(D,Q) = Σ IDF(qi) * (f(qi,D) * (k1 + 1)) / (f(qi,D) + k1 * (1 - b + b * |D| / avgdl))
 */
function calculateBM25Score(
  queryTerms: string[],
  docTokens: string[],
  allDocTokens: string[][],
  avgDocLength: number
): number {
  const docLength = docTokens.length;
  const totalDocs = allDocTokens.length;

  let score = 0;

  for (const term of queryTerms) {
    const tf = termFrequency(term, docTokens);
    const idf = calculateIDF(term, allDocTokens, totalDocs);

    // BM25 formula
    const numerator = tf * (K1 + 1);
    const denominator = tf + K1 * (1 - B + B * (docLength / avgDocLength));

    score += idf * (numerator / denominator);
  }

  return score;
}

/**
 * Perform BM25 keyword search on document chunks
 * Returns chunks ranked by BM25 relevance score
 */
export async function performBM25Search(input: BM25SearchInput): Promise<BM25Result[]> {
  const { query, userId, documentIds, topK = 20 } = input;

  logger.info('Performing BM25 keyword search', {
    userId,
    query: query.substring(0, 100),
    documentIds,
    topK
  });

  try {
    // Step 1: Build MongoDB filter
    const filter: any = { userId };
    if (documentIds && documentIds.length > 0) {
      filter.documentId = { $in: documentIds };
    }

    // Step 2: Fetch all candidate chunks from MongoDB
    const chunks = await DocumentChunk.find(filter)
      .select('content documentId chunkIndex')
      .lean();

    if (chunks.length === 0) {
      logger.warn('No chunks found for BM25 search', { userId, documentIds });
      return [];
    }

    logger.debug('Fetched chunks for BM25', { count: chunks.length });

    // Step 3: Tokenize query and all documents
    const queryTerms = tokenize(query);
    const allDocTokens = chunks.map((chunk) => tokenize(chunk.content));

    // Calculate average document length
    const avgDocLength =
      allDocTokens.reduce((sum, tokens) => sum + tokens.length, 0) / allDocTokens.length;

    logger.debug('BM25 preprocessing complete', {
      queryTerms: queryTerms.length,
      avgDocLength: Math.round(avgDocLength)
    });

    // Step 4: Calculate BM25 score for each chunk
    const results: BM25Result[] = chunks
      .map((chunk, index) => {
        const score = calculateBM25Score(
          queryTerms,
          allDocTokens[index],
          allDocTokens,
          avgDocLength
        );

        return {
          chunkId: chunk._id.toString(),
          score,
          documentId: chunk.documentId.toString(),
          chunkIndex: chunk.chunkIndex
        };
      })
      .filter((result) => result.score > 0) // Filter out zero scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, topK); // Take top K

    logger.info('BM25 search completed', {
      resultsFound: results.length,
      topScore: results[0]?.score.toFixed(3),
      avgScore: results.length > 0
        ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(3)
        : 0
    });

    return results;
  } catch (error: any) {
    logger.error('BM25 search failed', {
      error: error.message,
      query: query.substring(0, 100)
    });
    throw new Error(`BM25 search failed: ${error.message}`);
  }
}

/**
 * Normalize BM25 scores to 0-1 range for fusion with other ranking methods
 * Uses min-max normalization
 */
export function normalizeBM25Scores(results: BM25Result[]): BM25Result[] {
  if (results.length === 0) return results;

  const scores = results.map((r) => r.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Avoid division by zero
  if (maxScore === minScore) {
    return results.map((r) => ({ ...r, score: 1.0 }));
  }

  return results.map((r) => ({
    ...r,
    score: (r.score - minScore) / (maxScore - minScore)
  }));
}
