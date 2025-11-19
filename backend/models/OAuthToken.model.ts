import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IOAuthToken {
  _id: string;
  userId: string;
  provider: 'google' | 'microsoft';
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scope: string[];
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOAuthTokenDocument extends Omit<IOAuthToken, '_id'>, MongooseDocument {
  isExpired(): boolean;
  needsRefresh(): boolean;
}

const oauthTokenSchema = new Schema<IOAuthTokenDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true
    },
    provider: {
      type: String,
      enum: ['google', 'microsoft'],
      required: [true, 'Provider is required']
    },
    accessToken: {
      type: String,
      required: [true, 'Access token is required'],
      select: false // Don't return by default for security
    },
    refreshToken: {
      type: String,
      select: false // Don't return by default for security
    },
    expiresAt: {
      type: Date,
      required: [true, 'Token expiry date is required']
    },
    scope: {
      type: [String],
      default: []
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast lookups
oauthTokenSchema.index({ userId: 1, provider: 1 }, { unique: true });
oauthTokenSchema.index({ email: 1, provider: 1 });
oauthTokenSchema.index({ expiresAt: 1 }); // For cleanup of expired tokens

// Method to check if token is expired
oauthTokenSchema.methods.isExpired = function (): boolean {
  return new Date() >= this.expiresAt;
};

// Method to check if token needs refresh (expires in < 5 minutes)
oauthTokenSchema.methods.needsRefresh = function (): boolean {
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  return fiveMinutesFromNow >= this.expiresAt;
};

export const OAuthToken = mongoose.model<IOAuthTokenDocument>('OAuthToken', oauthTokenSchema);
