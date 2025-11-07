import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import { IConversation, ConversationStatus } from '../../shared/types/chat.types';

export interface IConversationModel extends Omit<IConversation, '_id'>, MongooseDocument {}

const conversationSchema = new Schema<IConversationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    documentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Document'
      }
    ],
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    status: {
      type: String,
      enum: Object.values(ConversationStatus),
      default: ConversationStatus.ACTIVE
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
conversationSchema.index({ userId: 1, status: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ documentIds: 1 });

// Method to increment message count
conversationSchema.methods.incrementMessageCount = function () {
  this.messageCount += 1;
  this.lastMessageAt = new Date();
  return this.save();
};

// Method to archive conversation
conversationSchema.methods.archive = function () {
  this.status = ConversationStatus.ARCHIVED;
  return this.save();
};

// Method to delete conversation
conversationSchema.methods.softDelete = function () {
  this.status = ConversationStatus.DELETED;
  return this.save();
};

export const Conversation = mongoose.model<IConversationModel>('Conversation', conversationSchema);
