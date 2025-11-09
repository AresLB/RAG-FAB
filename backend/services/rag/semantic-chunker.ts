import { logger } from '../../utils/logger';

export interface SemanticChunkConfig {
  targetChunkSize: number;      // Target characters per chunk (flexible)
  minChunkSize: number;          // Minimum viable chunk size
  maxChunkSize: number;          // Maximum chunk size
  overlapSize: number;           // Overlap between chunks
  respectParagraphs: boolean;    // Try to keep paragraphs together
  respectSentences: boolean;     // Try to keep sentences together
}

export interface SemanticChunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
  metadata: {
    type: 'paragraph' | 'section' | 'mixed';
    hasHeading?: boolean;
    headingText?: string;
    wordCount: number;
    sentenceCount: number;
  };
}

export interface SemanticChunkResult {
  chunks: SemanticChunk[];
  totalChunks: number;
  avgChunkSize: number;
  metadata: {
    originalLength: number;
    paragraphsDetected: number;
    headingsDetected: number;
  };
}

// Default config optimized for high-quality RAG
const DEFAULT_CONFIG: SemanticChunkConfig = {
  targetChunkSize: 800,
  minChunkSize: 200,
  maxChunkSize: 1200,
  overlapSize: 150,
  respectParagraphs: true,
  respectSentences: true
};

/**
 * Detect document structure: headings, paragraphs, sections
 */
interface DocumentStructure {
  headings: Array<{ text: string; position: number; level: number }>;
  paragraphs: Array<{ text: string; start: number; end: number }>;
  sections: Array<{ heading?: string; content: string; start: number; end: number }>;
}

function analyzeDocumentStructure(text: string): DocumentStructure {
  const structure: DocumentStructure = {
    headings: [],
    paragraphs: [],
    sections: []
  };

  // Detect headings (lines that are short, end without punctuation, possibly capitalized)
  const lines = text.split('\n');
  let currentPos = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.length > 0) {
      // Heading detection heuristics
      const isShort = trimmedLine.length < 100;
      const isCapitalized = /^[A-ZÄÖÜ]/.test(trimmedLine);
      const endsWithoutPunctuation = !/[.!?,;:]$/.test(trimmedLine);
      const isAllCaps = trimmedLine === trimmedLine.toUpperCase() && /[A-ZÄÖÜ]/.test(trimmedLine);
      const hasNumbering = /^(\d+\.|\d+\)|\([a-z]\)|[A-Z]\.)/.test(trimmedLine);

      if ((isShort && isCapitalized && endsWithoutPunctuation) || isAllCaps || hasNumbering) {
        structure.headings.push({
          text: trimmedLine,
          position: currentPos,
          level: isAllCaps ? 1 : 2
        });
      }
    }

    currentPos += line.length + 1; // +1 for newline
  });

  // Detect paragraphs (text blocks separated by blank lines)
  const paragraphRegex = /(.+?)(?:\n\s*\n|\n*$)/gs;
  let match;

  while ((match = paragraphRegex.exec(text)) !== null) {
    const paragraphText = match[1].trim();
    if (paragraphText.length > 0) {
      structure.paragraphs.push({
        text: paragraphText,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  }

  logger.debug('Document structure analyzed', {
    headings: structure.headings.length,
    paragraphs: structure.paragraphs.length
  });

  return structure;
}

/**
 * Split text into sentences (improved algorithm)
 */
function splitIntoSentences(text: string): string[] {
  // Handle abbreviations and special cases
  const protectedText = text
    .replace(/Dr\./g, 'Dr<DOT>')
    .replace(/Mr\./g, 'Mr<DOT>')
    .replace(/Mrs\./g, 'Mrs<DOT>')
    .replace(/Ms\./g, 'Ms<DOT>')
    .replace(/Prof\./g, 'Prof<DOT>')
    .replace(/z\.B\./g, 'z<DOT>B<DOT>')
    .replace(/u\.a\./g, 'u<DOT>a<DOT>')
    .replace(/etc\./g, 'etc<DOT>')
    .replace(/bzw\./g, 'bzw<DOT>')
    .replace(/(\d+)\./g, '$1<DOT>'); // Numbers with dots

  // Split on sentence boundaries
  const sentencePattern = /[.!?]+(?:\s+|$)/g;
  const sentences: string[] = [];
  let lastIndex = 0;

  let match;
  while ((match = sentencePattern.exec(protectedText)) !== null) {
    const sentence = protectedText
      .substring(lastIndex, match.index + match[0].length)
      .trim()
      .replace(/<DOT>/g, '.');

    if (sentence.length > 0) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < protectedText.length) {
    const remaining = protectedText.substring(lastIndex).trim().replace(/<DOT>/g, '.');
    if (remaining.length > 0) {
      sentences.push(remaining);
    }
  }

  return sentences;
}

/**
 * Create semantic chunks from document structure
 */
export function createSemanticChunks(
  text: string,
  config: Partial<SemanticChunkConfig> = {}
): SemanticChunkResult {
  const finalConfig: SemanticChunkConfig = { ...DEFAULT_CONFIG, ...config };
  const structure = analyzeDocumentStructure(text);

  logger.info('Creating semantic chunks', {
    textLength: text.length,
    config: finalConfig,
    paragraphs: structure.paragraphs.length,
    headings: structure.headings.length
  });

  const chunks: SemanticChunk[] = [];
  let currentChunk = '';
  let currentStartChar = 0;
  let chunkIndex = 0;
  let currentHeading: string | undefined;
  let sentencesInChunk = 0;

  // Process paragraphs as semantic units
  for (let i = 0; i < structure.paragraphs.length; i++) {
    const paragraph = structure.paragraphs[i];

    // Check if there's a heading before this paragraph
    const headingBefore = structure.headings.find(
      (h) => h.position >= currentStartChar && h.position < paragraph.start
    );
    if (headingBefore) {
      currentHeading = headingBefore.text;
    }

    // Split paragraph into sentences
    const sentences = splitIntoSentences(paragraph.text);
    sentencesInChunk += sentences.length;

    // Try to add paragraph to current chunk
    const paragraphWithHeading = currentHeading
      ? `${currentHeading}\n\n${paragraph.text}`
      : paragraph.text;

    const potentialChunk = currentChunk
      ? `${currentChunk}\n\n${paragraphWithHeading}`
      : paragraphWithHeading;

    // Decision: Start new chunk or continue?
    const shouldStartNewChunk =
      currentChunk.length > 0 &&
      (potentialChunk.length > finalConfig.maxChunkSize ||
        (potentialChunk.length > finalConfig.targetChunkSize &&
          currentChunk.length >= finalConfig.minChunkSize));

    if (shouldStartNewChunk) {
      // Save current chunk
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        startChar: currentStartChar,
        endChar: currentStartChar + currentChunk.length,
        metadata: {
          type: 'paragraph',
          hasHeading: !!currentHeading,
          headingText: currentHeading,
          wordCount: currentChunk.split(/\s+/).length,
          sentenceCount: sentencesInChunk
        }
      });

      chunkIndex++;

      // Create overlap from end of previous chunk
      const overlapText = getOverlapText(currentChunk, finalConfig.overlapSize);
      currentStartChar += currentChunk.length - overlapText.length;
      currentChunk = overlapText ? `${overlapText}\n\n${paragraphWithHeading}` : paragraphWithHeading;
      sentencesInChunk = sentences.length;
    } else {
      // Add to current chunk
      currentChunk = potentialChunk;
    }
  }

  // Add final chunk
  if (currentChunk.trim().length >= finalConfig.minChunkSize) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      startChar: currentStartChar,
      endChar: currentStartChar + currentChunk.length,
      metadata: {
        type: 'paragraph',
        hasHeading: !!currentHeading,
        headingText: currentHeading,
        wordCount: currentChunk.split(/\s+/).length,
        sentenceCount: sentencesInChunk
      }
    });
  } else if (chunks.length > 0) {
    // Merge small final chunk with previous chunk
    const lastChunk = chunks[chunks.length - 1];
    lastChunk.text += '\n\n' + currentChunk.trim();
    lastChunk.endChar += currentChunk.length;
  }

  const avgChunkSize = chunks.reduce((sum, c) => sum + c.text.length, 0) / chunks.length;

  logger.info('Semantic chunks created', {
    totalChunks: chunks.length,
    avgChunkSize: Math.round(avgChunkSize),
    minChunkSize: Math.min(...chunks.map((c) => c.text.length)),
    maxChunkSize: Math.max(...chunks.map((c) => c.text.length))
  });

  return {
    chunks,
    totalChunks: chunks.length,
    avgChunkSize,
    metadata: {
      originalLength: text.length,
      paragraphsDetected: structure.paragraphs.length,
      headingsDetected: structure.headings.length
    }
  };
}

/**
 * Get overlap text from end of chunk (by sentences)
 */
function getOverlapText(text: string, targetOverlapSize: number): string {
  const sentences = splitIntoSentences(text);
  let overlapText = '';

  // Take sentences from the end until we reach target overlap size
  for (let i = sentences.length - 1; i >= 0; i--) {
    const sentence = sentences[i];
    if (overlapText.length + sentence.length > targetOverlapSize * 1.5) {
      break;
    }
    overlapText = sentence + ' ' + overlapText;
  }

  return overlapText.trim();
}

/**
 * Estimate tokens (more accurate than simple char/4)
 */
export function estimateTokenCount(text: string): number {
  // More accurate token estimation
  // Roughly: 1 token = 0.75 words for English, 0.6 for German
  const words = text.split(/\s+/).length;
  return Math.ceil(words * 0.65);
}
