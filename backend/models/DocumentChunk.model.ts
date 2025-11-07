import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import { IDocumentChunk } from '../../shared/types/document.types';

export interface IDocumentChunkModel extends Omit<IDocumentChunk, '_id'>, MongooseDocument {}

const chunkMetadataSchema = new Schema(
  {
    pageNumber: Number,
    section: String
  },
  { _id: false, strict: false } // Allow additional fields
);

const documentChunkSchema = new Schema<IDocumentChunkModel>(
  {
    // @ts-expect-error - Mongoose ObjectId type compatibility issue
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true
    },
    // @ts-expect-error - Mongoose ObjectId type compatibility issue
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    chunkIndex: {
      type: Number,
      required: [true, 'Chunk index is required'],
      min: 0
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    embedding: {
      type: [Number],
      select: false // Don't return embeddings by default (large arrays)
    },
    vectorId: {
      type: String,
      trim: true
    },
    metadata: {
      type: chunkMetadataSchema,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
documentChunkSchema.index({ userId: 1, documentId: 1 });
documentChunkSchema.index({ vectorId: 1 });

// Method to check if chunk has embedding
documentChunkSchema.methods.hasEmbedding = function (): boolean {
  return Boolean(this.embedding && this.embedding.length > 0);
};

// Method to check if chunk is vectorized
documentChunkSchema.methods.isVectorized = function (): boolean {
  return Boolean(this.vectorId);
};

export const DocumentChunk = mongoose.model<IDocumentChunkModel>(
  'DocumentChunk',
  documentChunkSchema
);
