import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { DocumentType } from '../../../shared/types/document.types';
import { logger } from '../../utils/logger';

export interface ExtractionResult {
  text: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    characterCount?: number;
  };
}

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (filePath: string): Promise<ExtractionResult> => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).filter((word) => word.length > 0).length,
        characterCount: data.text.length
      }
    };
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
        wordCount: result.value.split(/\s+/).filter((word) => word.length > 0).length,
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
        wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
        characterCount: text.length
      }
    };
  } catch (error) {
    logger.error('TXT text extraction failed:', error);
    throw new Error(`Failed to extract text from TXT: ${error}`);
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
