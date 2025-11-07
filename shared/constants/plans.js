"use strict";
/**
 * Subscription Plans Configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canDowngrade = exports.canUpgrade = exports.getMaxFileSize = exports.getDocumentsLimit = exports.getQuestionsLimit = exports.getPlanFeatures = exports.PLANS = void 0;
const user_types_1 = require("../types/user.types");
exports.PLANS = {
    [user_types_1.SubscriptionPlan.FREE]: {
        plan: user_types_1.SubscriptionPlan.FREE,
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
    [user_types_1.SubscriptionPlan.BASIC]: {
        plan: user_types_1.SubscriptionPlan.BASIC,
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
    [user_types_1.SubscriptionPlan.PRO]: {
        plan: user_types_1.SubscriptionPlan.PRO,
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
const getPlanFeatures = (plan) => {
    return exports.PLANS[plan];
};
exports.getPlanFeatures = getPlanFeatures;
const getQuestionsLimit = (plan) => {
    return exports.PLANS[plan].features.questionsPerMonth;
};
exports.getQuestionsLimit = getQuestionsLimit;
const getDocumentsLimit = (plan) => {
    return exports.PLANS[plan].features.documentsLimit;
};
exports.getDocumentsLimit = getDocumentsLimit;
const getMaxFileSize = (plan) => {
    return exports.PLANS[plan].features.maxFileSize;
};
exports.getMaxFileSize = getMaxFileSize;
const canUpgrade = (currentPlan, targetPlan) => {
    const planOrder = [user_types_1.SubscriptionPlan.FREE, user_types_1.SubscriptionPlan.BASIC, user_types_1.SubscriptionPlan.PRO];
    return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
};
exports.canUpgrade = canUpgrade;
const canDowngrade = (currentPlan, targetPlan) => {
    const planOrder = [user_types_1.SubscriptionPlan.FREE, user_types_1.SubscriptionPlan.BASIC, user_types_1.SubscriptionPlan.PRO];
    return planOrder.indexOf(targetPlan) < planOrder.indexOf(currentPlan);
};
exports.canDowngrade = canDowngrade;
//# sourceMappingURL=plans.js.map