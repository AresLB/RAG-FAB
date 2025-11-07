import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import { IDocument, DocumentType, DocumentStatus } from '../../shared/types/document.types';

export interface IDocumentModel extends Omit<IDocument, '_id'>, MongooseDocument {}

const documentMetadataSchema = new Schema(
  {
    author: String,
    title: String,
    pageCount: Number,
    language: String,
    keywords: [String]
  },
  { _id: false, strict: false } // Allow additional fields
);

const documentSchema = new Schema<IDocumentModel>(
  {
    // @ts-expect-error - Mongoose ObjectId type compatibility issue
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Original name is required'],
      trim: true
    },
    fileType: {
      type: String,
      enum: Object.values(DocumentType),
      required: [true, 'File type is required']
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be positive']
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.UPLOADING
    },
    s3Key: {
      type: String,
      trim: true
    },
    s3Url: {
      type: String,
      trim: true
    },
    textExtracted: {
      type: String
    },
    chunkCount: {
      type: Number,
      default: 0,
      min: 0
    },
    vectorized: {
      type: Boolean,
      default: false
    },
    pineconeNamespace: {
      type: String,
      trim: true
    },
    metadata: {
      type: documentMetadataSchema,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ status: 1 });
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ vectorized: 1 });

// Virtual for document name display
documentSchema.virtual('displayName').get(function () {
  // @ts-expect-error - Mongoose virtual this context
  return this.originalName || this.fileName;
});

// Method to check if document is ready for queries
documentSchema.methods.isReady = function (): boolean {
  return this.status === DocumentStatus.READY && this.vectorized;
};

// Method to mark as failed
documentSchema.methods.markAsFailed = function (errorMessage?: string) {
  this.status = DocumentStatus.FAILED;
  if (errorMessage && this.metadata) {
    this.metadata.error = errorMessage;
  }
  return this.save();
};

export const Document = mongoose.model<IDocumentModel>('Document', documentSchema);
