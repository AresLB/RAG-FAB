import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import { IMessage, MessageRole } from '../../shared/types/chat.types';

export interface IMessageModel extends Omit<IMessage, '_id'>, MongooseDocument {}

const messageSourceSchema = new Schema(
  {
    // @ts-expect-error - Mongoose ObjectId type compatibility issue
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    documentName: {
      type: String,
      required: true
    },
    chunkIndex: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    similarity: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    pageNumber: Number
  },
  { _id: false }
);

const messageMetadataSchema = new Schema(
  {
    tokensUsed: Number,
    processingTime: Number,
    model: String
  },
  { _id: false, strict: false } // Allow additional fields
);

const messageSchema = new Schema<IMessageModel>(
  {
    // @ts-expect-error - Mongoose ObjectId type compatibility issue
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true
    },
    role: {
      type: String,
      enum: Object.values(MessageRole),
      required: [true, 'Role is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters']
    },
    sources: [messageSourceSchema],
    metadata: {
      type: messageMetadataSchema,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, role: 1 });

// Method to check if message is from user
messageSchema.methods.isFromUser = function (): boolean {
  return this.role === MessageRole.USER;
};

// Method to check if message is from assistant
messageSchema.methods.isFromAssistant = function (): boolean {
  return this.role === MessageRole.ASSISTANT;
};

export const Message = mongoose.model<IMessageModel>('Message', messageSchema);
