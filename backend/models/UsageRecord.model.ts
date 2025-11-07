import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import { IUsageRecord } from '../../shared/types/subscription.types';

export interface IUsageRecordModel extends Omit<IUsageRecord, '_id'>, MongooseDocument {}

const usageRecordSchema = new Schema<IUsageRecordModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['question', 'document_upload', 'api_call'],
      required: [true, 'Type is required'],
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: false // Using timestamp field instead
  }
);

// Compound indexes for efficient queries
usageRecordSchema.index({ userId: 1, timestamp: -1 });
usageRecordSchema.index({ userId: 1, type: 1, timestamp: -1 });

// Static method to count usage for a period
usageRecordSchema.statics.countUsage = async function (
  userId: string,
  type: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  return this.countDocuments({
    userId,
    type,
    timestamp: { $gte: startDate, $lte: endDate }
  });
};

// Static method to get usage stats
usageRecordSchema.statics.getUsageStats = async function (
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalTokens: { $sum: '$metadata.tokensUsed' }
      }
    }
  ]);
};

export const UsageRecord = mongoose.model<IUsageRecordModel>('UsageRecord', usageRecordSchema);
