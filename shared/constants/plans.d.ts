/**
 * Subscription Plans Configuration
 */
import { SubscriptionPlan } from '../types/user.types';
import { IPlanFeatures } from '../types/subscription.types';
export declare const PLANS: Record<SubscriptionPlan, IPlanFeatures>;
export declare const getPlanFeatures: (plan: SubscriptionPlan) => IPlanFeatures;
export declare const getQuestionsLimit: (plan: SubscriptionPlan) => number | "unlimited";
export declare const getDocumentsLimit: (plan: SubscriptionPlan) => number | "unlimited";
export declare const getMaxFileSize: (plan: SubscriptionPlan) => number;
export declare const canUpgrade: (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan) => boolean;
export declare const canDowngrade: (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan) => boolean;
//# sourceMappingURL=plans.d.ts.map