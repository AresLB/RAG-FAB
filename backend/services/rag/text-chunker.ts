import { logger } from '../../utils/logger';

export interface ChunkConfig {
  chunkSize: number;      // Number of characters per chunk
  chunkOverlap: number;   // Number of overlapping characters
  minChunkSize: number;   // Minimum chunk size to avoid tiny chunks
}

export interface TextChunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
  metadata?: Record<string, any>;
}

export interface ChunkResult {
  chunks: TextChunk[];
  totalChunks: number;
  totalCharacters: number;
}

// Default configuration: ~500-1000 chars per chunk with 100-200 overlap
const DEFAULT_CONFIG: ChunkConfig = {
  chunkSize: 800,
  chunkOverlap: 150,
  minChunkSize: 100
};

/**
 * Splits text into sentences using common punctuation marks
 */
const splitIntoSentences = (text: string): string[] => {
  // Split on periods, exclamation marks, question marks followed by space or end
  const sentencePattern = /[.!?]+[\s\n]+|[.!?]+$/g;
  const sentences: string[] = [];

  let lastIndex = 0;
  let match;

  while ((match = sentencePattern.exec(text)) !== null) {
    const sentence = text.substring(lastIndex, match.index + match[0].length).trim();
    if (sentence.length > 0) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text if any
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex).trim();
    if (remaining.length > 0) {
      sentences.push(remaining);
    }
  }

  return sentences;
};

/**
 * Chunks text by trying to respect sentence boundaries
 */
export const chunkText = (
  text: string,
  config: Partial<ChunkConfig> = {},
  metadata?: Record<string, any>
): ChunkResult => {
  const finalConfig: ChunkConfig = { ...DEFAULT_CONFIG, ...config };
  const { chunkSize, chunkOverlap, minChunkSize } = finalConfig;

  logger.debug('Chunking text', {
    textLength: text.length,
    config: finalConfig
  });

  // Handle empty or very short text
  if (!text || text.trim().length === 0) {
    return {
      chunks: [],
      totalChunks: 0,
      totalCharacters: 0
    };
  }

  if (text.length <= chunkSize) {
    return {
      chunks: [{
        text: text.trim(),
        index: 0,
        startChar: 0,
        endChar: text.length,
        metadata
      }],
      totalChunks: 1,
      totalCharacters: text.length
    };
  }

  const sentences = splitIntoSentences(text);
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let currentStartChar = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const potentialChunk = currentChunk + (currentChunk ? ' ' : '') + sentence;

    // If adding this sentence would exceed chunk size
    if (potentialChunk.length > chunkSize && currentChunk.length >= minChunkSize) {
      // Save current chunk
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        startChar: currentStartChar,
        endChar: currentStartChar + currentChunk.length,
        metadata
      });

      chunkIndex++;

      // Start new chunk with overlap
      // Try to include overlap from the end of previous chunk
      const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
      const overlapText = currentChunk.substring(overlapStart);

      currentStartChar += overlapStart;
      currentChunk = overlapText + ' ' + sentence;
    } else {
      // Add sentence to current chunk
      currentChunk = potentialChunk;
    }
  }

  // Add final chunk if it has content
  if (currentChunk.trim().length >= minChunkSize) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      startChar: currentStartChar,
      endChar: currentStartChar + currentChunk.length,
      metadata
    });
  } else if (chunks.length > 0) {
    // If final chunk is too small, append it to the last chunk
    const lastChunk = chunks[chunks.length - 1];
    lastChunk.text += ' ' + currentChunk.trim();
    lastChunk.endChar += currentChunk.length;
  }

  logger.info('Text chunked successfully', {
    totalChunks: chunks.length,
    totalCharacters: text.length,
    avgChunkSize: Math.round(text.length / chunks.length)
  });

  return {
    chunks,
    totalChunks: chunks.length,
    totalCharacters: text.length
  };
};

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

/**
 * Chunk text with token-based sizing
 */
export const chunkTextByTokens = (
  text: string,
  maxTokens: number = 200,
  overlapTokens: number = 40,
  metadata?: Record<string, any>
): ChunkResult => {
  const chunkSize = maxTokens * 4; // Convert tokens to characters
  const chunkOverlap = overlapTokens * 4;

  return chunkText(text, { chunkSize, chunkOverlap, minChunkSize: 50 }, metadata);
};
