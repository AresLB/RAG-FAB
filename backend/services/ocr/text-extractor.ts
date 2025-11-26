import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';
import { DocumentType } from '../../../shared/types/document.types';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';

// Initialize AWS Textract client
const textractClient = new TextractClient({
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export interface ExtractionResult {
  text: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    characterCount?: number;
    isScanned?: boolean;
    detectedBlocks?: number;
    detectedLines?: number;
  };
}

/**
 * Extract text from PDF file
 * Automatically detects scanned PDFs and uses OCR when needed
 */
export const extractTextFromPDF = async (filePath: string): Promise<ExtractionResult> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    // Check if PDF has extractable text (not a scanned PDF)
    const extractedText = data.text.trim();
    const hasText = extractedText.length > 50; // Threshold: at least 50 characters

    if (hasText) {
      // PDF has text layer - return normally extracted text
      logger.info('PDF has text layer - using standard extraction');
      return {
        text: data.text,
        metadata: {
          pageCount: data.numpages,
          wordCount: data.text.split(/\s+/).filter((word: string) => word.length > 0).length,
          characterCount: data.text.length
        }
      };
    } else {
      // Scanned PDF detected - use OCR
      logger.info('Scanned PDF detected (no text layer) - using AWS Textract OCR');

      const ocrResult = await extractTextFromImage(filePath);

      return {
        ...ocrResult,
        metadata: {
          ...ocrResult.metadata,
          pageCount: data.numpages,
          isScanned: true
        }
      };
    }
  } catch (error) {
    logger.error('PDF text extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error}`);
  }
};

/**
 * Extract text from DOCX file
 */
export const extractTextFromDOCX = async (filePath: string): Promise<ExtractionResult> => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });

    return {
      text: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).filter((word: string) => word.length > 0).length,
        characterCount: result.value.length
      }
    };
  } catch (error) {
    logger.error('DOCX text extraction failed:', error);
    throw new Error(`Failed to extract text from DOCX: ${error}`);
  }
};

/**
 * Extract text from TXT file
 */
export const extractTextFromTXT = async (filePath: string): Promise<ExtractionResult> => {
  try {
    const text = await fs.readFile(filePath, 'utf-8');

    return {
      text,
      metadata: {
        wordCount: text.split(/\s+/).filter((word: string) => word.length > 0).length,
        characterCount: text.length
      }
    };
  } catch (error) {
    logger.error('TXT text extraction failed:', error);
    throw new Error(`Failed to extract text from TXT: ${error}`);
  }
};

/**
 * Extract text from image using AWS Textract OCR
 * Supports: PNG, JPG, JPEG
 */
export const extractTextFromImage = async (filePath: string): Promise<ExtractionResult> => {
  try {
    logger.info(`Starting Textract OCR for image: ${filePath}`);

    // Read image file as buffer
    const imageBuffer = await fs.readFile(filePath);

    // Call AWS Textract
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: imageBuffer
      }
    });

    const response = await textractClient.send(command);

    // Extract text from Textract response
    // Textract returns blocks of different types: PAGE, LINE, WORD
    const textBlocks = response.Blocks?.filter((block) => block.BlockType === 'LINE') || [];

    // Combine all line texts with newlines
    const extractedText = textBlocks
      .map((block) => block.Text || '')
      .filter((text) => text.length > 0)
      .join('\n');

    if (!extractedText || extractedText.trim().length === 0) {
      logger.warn('No text found in image by Textract');
      throw new Error('No text detected in image. The image may not contain any readable text.');
    }

    logger.info(`Textract OCR completed successfully. Extracted ${extractedText.length} characters`);

    return {
      text: extractedText,
      metadata: {
        wordCount: extractedText.split(/\s+/).filter((word: string) => word.length > 0).length,
        characterCount: extractedText.length,
        detectedBlocks: response.Blocks?.length || 0,
        detectedLines: textBlocks.length
      }
    };
  } catch (error: any) {
    logger.error('Textract OCR failed:', error);

    // Provide helpful error messages
    if (error.name === 'ProvisionedThroughputExceededException') {
      throw new Error('AWS Textract rate limit exceeded. Please try again in a moment.');
    }
    if (error.name === 'InvalidParameterException') {
      throw new Error('Invalid image format or corrupted file.');
    }
    if (error.name === 'AccessDeniedException') {
      throw new Error('AWS Textract access denied. Please check your AWS credentials and permissions.');
    }

    throw new Error(`Failed to extract text from image using OCR: ${error.message}`);
  }
};

/**
 * Extract text from any supported file type
 */
export const extractText = async (
  filePath: string,
  fileType: DocumentType
): Promise<ExtractionResult> => {
  logger.info(`Extracting text from ${fileType} file: ${filePath}`);

  switch (fileType) {
    case DocumentType.PDF:
      return extractTextFromPDF(filePath);

    case DocumentType.DOCX:
      return extractTextFromDOCX(filePath);

    case DocumentType.TXT:
      return extractTextFromTXT(filePath);

    case DocumentType.PNG:
    case DocumentType.JPG:
    case DocumentType.JPEG:
      return extractTextFromImage(filePath);

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Get file type from extension
 */
export const getDocumentType = (filename: string): DocumentType => {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case '.pdf':
      return DocumentType.PDF;
    case '.docx':
      return DocumentType.DOCX;
    case '.txt':
      return DocumentType.TXT;
    case '.png':
      return DocumentType.PNG;
    case '.jpg':
      return DocumentType.JPG;
    case '.jpeg':
      return DocumentType.JPEG;
    default:
      throw new Error(`Unsupported file extension: ${ext}`);
  }
};

/**
 * Clean extracted text (remove extra whitespace, etc.)
 */
export const cleanText = (text: string): string => {
  return text
    .replace(/\r\n/g, '\n') // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/[ \t]{2,}/g, ' ') // Remove excessive spaces
    .trim();
};
