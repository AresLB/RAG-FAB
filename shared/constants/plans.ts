/**
 * Subscription Plans Configuration
 */

import { SubscriptionPlan } from '../types/user.types';
import { IPlanFeatures } from '../types/subscription.types';

export const PLANS: Record<SubscriptionPlan, IPlanFeatures> = {
  [SubscriptionPlan.FREE]: {
    plan: SubscriptionPlan.FREE,
    name: 'Free',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    features: {
      questionsPerMonth: 3,
      documentsLimit: 1,
      maxFileSize: 5, // 5 MB
      prioritySupport: false,
      advancedAnalytics: false,
      apiAccess: false,
      customIntegrations: false
    }
  },
  [SubscriptionPlan.BASIC]: {
    plan: SubscriptionPlan.BASIC,
    name: 'Basic',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    features: {
      questionsPerMonth: 50,
      documentsLimit: 5,
      maxFileSize: 20, // 20 MB
      prioritySupport: false,
      advancedAnalytics: true,
      apiAccess: false,
      customIntegrations: false
    },
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID
  },
  [SubscriptionPlan.PRO]: {
    plan: SubscriptionPlan.PRO,
    name: 'Pro',
    price: 29.99,
    currency: 'EUR',
    interval: 'month',
    features: {
      questionsPerMonth: 'unlimited',
      documentsLimit: 'unlimited',
      maxFileSize: 100, // 100 MB
      prioritySupport: true,
      advancedAnalytics: true,
      apiAccess: true,
      customIntegrations: true
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID
  }
};

// Helper functions
export const getPlanFeatures = (plan: SubscriptionPlan): IPlanFeatures => {
  return PLANS[plan];
};

export const getQuestionsLimit = (plan: SubscriptionPlan): number | 'unlimited' => {
  return PLANS[plan].features.questionsPerMonth;
};

export const getDocumentsLimit = (plan: SubscriptionPlan): number | 'unlimited' => {
  return PLANS[plan].features.documentsLimit;
};

export const getMaxFileSize = (plan: SubscriptionPlan): number => {
  return PLANS[plan].features.maxFileSize;
};

export const canUpgrade = (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean => {
  const planOrder = [SubscriptionPlan.FREE, SubscriptionPlan.BASIC, SubscriptionPlan.PRO];
  return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
};

export const canDowngrade = (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): boolean => {
  const planOrder = [SubscriptionPlan.FREE, SubscriptionPlan.BASIC, SubscriptionPlan.PRO];
  return planOrder.indexOf(targetPlan) < planOrder.indexOf(currentPlan);
};
