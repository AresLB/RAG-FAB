/**
 * Document Types - Shared between Frontend and Backend
 */

export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt'
}

export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  CHUNKING = 'chunking',
  EMBEDDING = 'embedding',
  READY = 'ready',
  FAILED = 'failed'
}

export interface IDocument {
  _id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileType: DocumentType;
  fileSize: number;
  status: DocumentStatus;
  s3Key?: string;
  s3Url?: string;
  textExtracted?: string;
  chunkCount: number;
  vectorized: boolean;
  pineconeNamespace?: string;
  metadata?: IDocumentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocumentMetadata {
  author?: string;
  title?: string;
  pageCount?: number;
  language?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface IDocumentUpload {
  file: File | Buffer;
  originalName: string;
  fileType: DocumentType;
  userId: string;
}

export interface IDocumentChunk {
  _id: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  vectorId?: string;
  metadata?: {
    pageNumber?: number;
    section?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface IDocumentUploadResponse {
  documentId: string;
  fileName: string;
  status: DocumentStatus;
  message: string;
}

export interface IDocumentListQuery {
  userId: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}
