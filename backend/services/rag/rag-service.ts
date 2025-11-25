import { searchVectors, QueryResult } from './vector-service';
import { performBM25Search } from './bm25-service';
import { fuseSearchResults, getRecommendedConfig, HybridFusionConfig } from './hybrid-fusion';
import { rerankChunks, RerankConfig } from './rerank-service';
import { DocumentChunk } from '../../models/DocumentChunk.model';
import { Document } from '../../models/Document.model';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';

export interface RAGQueryInput {
  query: string;
  userId: string;
  documentIds?: string[];
  topK?: number;
  minScore?: number;
  /**
   * Enable hybrid search (BM25 + semantic)
   * Default: true (recommended for best results)
   */
  useHybridSearch?: boolean;
  /**
   * Hybrid search configuration
   * If not provided, uses smart defaults based on query
   */
  hybridConfig?: HybridFusionConfig;
  /**
   * Enable re-ranking for improved precision
   * Default: true (highly recommended)
   * Retrieves more candidates (topK * 3-4), then re-ranks to select best
   */
  useReranking?: boolean;
  /**
   * Re-ranking model to use
   * - 'llm': OpenAI-based scoring (default, no extra cost)
   * - 'cohere': Cohere Rerank API (requires API key, best quality)
   */
  rerankModel?: 'llm' | 'cohere';
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
 * Uses hybrid search (BM25 + semantic) by default for better accuracy
 */
export const performRAGQuery = async (input: RAGQueryInput): Promise<RAGContext> => {
  const {
    query,
    userId,
    documentIds,
    topK = 5,
    minScore = 0.5,
    useHybridSearch = true, // Default to hybrid search
    hybridConfig,
    useReranking = true, // Default to re-ranking (highly recommended)
    rerankModel = 'llm'
  } = input;

  // Calculate how many candidates to retrieve for re-ranking
  const retrievalK = useReranking ? topK * 4 : topK * 2;

  logger.info('Performing RAG query', {
    userId,
    query: query.substring(0, 100),
    documentIds,
    topK,
    retrievalK,
    minScore,
    useHybridSearch,
    useReranking,
    rerankModel
  });

  try {
    let searchResults: QueryResult[];

    if (useHybridSearch) {
      // **HYBRID SEARCH**: Combine BM25 keyword + semantic search
      logger.info('Using hybrid search (BM25 + semantic)');

      // Build filter for Pinecone query
      const filter: Record<string, any> = {
        userId: { $eq: userId }
      };

      if (documentIds && documentIds.length > 0) {
        filter.documentId = { $in: documentIds };
      }

      // Run BM25 and semantic search in parallel
      const [bm25Results, semanticResults] = await Promise.all([
        performBM25Search({
          query,
          userId,
          documentIds,
          topK: retrievalK // Get more candidates for fusion + reranking
        }),
        searchVectors({
          query,
          topK: retrievalK,
          filter,
          minScore: minScore * 0.5 // Lower threshold for hybrid
        })
      ]);

      logger.info('Parallel search completed', {
        bm25Count: bm25Results.length,
        semanticCount: semanticResults.length
      });

      // Fuse results using recommended config or provided config
      const fusionConfig = hybridConfig || getRecommendedConfig(query);
      const fusedResults = fuseSearchResults(bm25Results, semanticResults, fusionConfig);

      // Convert fused results back to QueryResult format
      searchResults = fusedResults.slice(0, retrievalK).map((fusedResult) => {
        // Find the original semantic result if it exists
        const semanticResult = semanticResults.find((r) => r.id === fusedResult.chunkId);

        return {
          id: fusedResult.chunkId,
          score: fusedResult.fusedScore,
          metadata: {
            documentId: fusedResult.documentId,
            userId,
            chunkIndex: fusedResult.chunkIndex,
            fileName: semanticResult?.metadata.fileName || '',
            fileType: semanticResult?.metadata.fileType || '',
            createdAt: semanticResult?.metadata.createdAt || new Date().toISOString()
          },
          text: '' // Will be fetched from MongoDB later
        };
      });
    } else {
      // **SEMANTIC-ONLY SEARCH**: Original behavior
      logger.info('Using semantic-only search');

      const filter: Record<string, any> = {
        userId: { $eq: userId }
      };

      if (documentIds && documentIds.length > 0) {
        filter.documentId = { $in: documentIds };
      }

      searchResults = await searchVectors({
        query,
        topK: retrievalK,
        filter,
        minScore
      });
    }

    logger.info('Initial retrieval completed', {
      resultsFound: searchResults.length,
      topScore: searchResults[0]?.score,
      allScores: searchResults.map(r => r.score).slice(0, 5),
      documentIds: [...new Set(searchResults.map(r => r.metadata.documentId))]
    });

    // **RE-RANKING STAGE**: Improve precision by re-scoring candidates
    if (useReranking && searchResults.length > topK) {
      logger.info('Starting re-ranking', {
        candidatesCount: searchResults.length,
        targetCount: topK,
        model: rerankModel
      });

      const chunkIds = searchResults.map((r) => r.id);

      // Prepare re-ranking config
      const rerankConfig: RerankConfig = {
        cohereApiKey: process.env.COHERE_API_KEY
      };

      // Re-rank chunks
      const rerankedResults = await rerankChunks(
        {
          query,
          chunkIds,
          topK,
          model: rerankModel
        },
        rerankConfig
      );

      // Map re-ranked IDs back to original search results
      const rerankedMap = new Map(rerankedResults.map((r) => [r.chunkId, r.rerankScore]));
      searchResults = rerankedResults.map((reranked) => {
        const original = searchResults.find((r) => r.id === reranked.chunkId)!;
        return {
          ...original,
          score: reranked.rerankScore // Use re-rank score
        };
      });

      logger.info('Re-ranking completed', {
        finalCount: searchResults.length,
        topRerankScore: searchResults[0]?.score.toFixed(3)
      });
    } else if (searchResults.length > topK) {
      // No re-ranking: just take top K
      searchResults = searchResults.slice(0, topK);
    }

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
