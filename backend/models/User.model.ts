import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, SubscriptionPlan } from '../../shared/types/user.types';

export interface IUserDocument extends Omit<IUser, '_id'>, MongooseDocument {
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isSubscriptionActive(): boolean;
  canAskQuestion(): boolean;
  canUploadDocument(): boolean;
}

const subscriptionSchema = new Schema({
  plan: {
    type: String,
    enum: Object.values(SubscriptionPlan),
    default: SubscriptionPlan.FREE
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  questionsUsed: {
    type: Number,
    default: 0
  },
  questionsLimit: {
    type: Number,
    default: 3 // Free plan default
  },
  documentsUsed: {
    type: Number,
    default: 0
  },
  documentsLimit: {
    type: Number,
    default: 1 // Free plan default
  },
  stripeCustomerId: {
    type: String
  },
  stripeSubscriptionId: {
    type: String
  }
});

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // Don't return password by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    subscription: {
      type: subscriptionSchema,
      default: () => ({
        plan: SubscriptionPlan.FREE,
        status: 'active',
        questionsUsed: 0,
        questionsLimit: 3,
        documentsUsed: 0,
        documentsLimit: 1
      })
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if subscription is active
userSchema.methods.isSubscriptionActive = function (): boolean {
  if (this.subscription.status !== 'active') return false;
  if (this.subscription.plan === SubscriptionPlan.FREE) return true;
  if (!this.subscription.endDate) return false;
  return new Date() < this.subscription.endDate;
};

// Check if user can ask a question
userSchema.methods.canAskQuestion = function (): boolean {
  if (!this.isSubscriptionActive()) return false;
  if (this.subscription.plan === SubscriptionPlan.PRO) return true; // Unlimited
  return this.subscription.questionsUsed < this.subscription.questionsLimit;
};

// Check if user can upload a document
userSchema.methods.canUploadDocument = function (): boolean {
  if (!this.isSubscriptionActive()) return false;
  if (this.subscription.plan === SubscriptionPlan.PRO) return true; // Unlimited
  return this.subscription.documentsUsed < this.subscription.documentsLimit;
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
