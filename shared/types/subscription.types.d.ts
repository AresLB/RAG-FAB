/**
 * Subscription & Payment Types - Shared between Frontend and Backend
 */
import { SubscriptionPlan } from './user.types';
export interface IPlanFeatures {
    plan: SubscriptionPlan;
    name: string;
    price: number;
    currency: 'EUR' | 'USD';
    interval: 'month' | 'year';
    features: {
        questionsPerMonth: number | 'unlimited';
        documentsLimit: number | 'unlimited';
        maxFileSize: number;
        prioritySupport: boolean;
        advancedAnalytics: boolean;
        apiAccess: boolean;
        customIntegrations: boolean;
    };
    stripePriceId?: string;
}
export interface IPaymentIntent {
    _id: string;
    userId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
    plan: SubscriptionPlan;
    stripePaymentIntentId: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUsageRecord {
    _id: string;
    userId: string;
    type: 'question' | 'document_upload' | 'api_call';
    timestamp: Date;
    metadata?: {
        conversationId?: string;
        documentId?: string;
        tokensUsed?: number;
        [key: string]: any;
    };
}
export interface IUsageStats {
    userId: string;
    period: {
        start: Date;
        end: Date;
    };
    questionsUsed: number;
    questionsLimit: number | 'unlimited';
    documentsUsed: number;
    documentsLimit: number | 'unlimited';
    totalTokensUsed?: number;
}
export interface ISubscriptionChangeRequest {
    userId: string;
    newPlan: SubscriptionPlan;
    paymentMethodId?: string;
}
export interface ISubscriptionChangeResponse {
    success: boolean;
    subscription: {
        plan: SubscriptionPlan;
        status: string;
        startDate: Date;
        endDate?: Date;
    };
    clientSecret?: string;
    message: string;
}
//# sourceMappingURL=subscription.types.d.ts.map