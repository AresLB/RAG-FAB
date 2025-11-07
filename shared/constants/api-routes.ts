/**
 * API Routes Constants
 */

const API_VERSION = '/api/v1';

export const API_ROUTES = {
  // Base
  BASE: API_VERSION,

  // Health
  HEALTH: `${API_VERSION}/health`,

  // Authentication
  AUTH: {
    BASE: `${API_VERSION}/auth`,
    REGISTER: `${API_VERSION}/auth/register`,
    LOGIN: `${API_VERSION}/auth/login`,
    LOGOUT: `${API_VERSION}/auth/logout`,
    REFRESH: `${API_VERSION}/auth/refresh`,
    ME: `${API_VERSION}/auth/me`,
    FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password`,
    RESET_PASSWORD: `${API_VERSION}/auth/reset-password`,
    VERIFY_EMAIL: `${API_VERSION}/auth/verify-email`
  },

  // Users
  USERS: {
    BASE: `${API_VERSION}/users`,
    PROFILE: `${API_VERSION}/users/profile`,
    UPDATE_PROFILE: `${API_VERSION}/users/profile`,
    CHANGE_PASSWORD: `${API_VERSION}/users/change-password`,
    DELETE_ACCOUNT: `${API_VERSION}/users/account`
  },

  // Documents
  DOCUMENTS: {
    BASE: `${API_VERSION}/documents`,
    UPLOAD: `${API_VERSION}/documents/upload`,
    LIST: `${API_VERSION}/documents`,
    GET_BY_ID: (id: string) => `${API_VERSION}/documents/${id}`,
    UPDATE: (id: string) => `${API_VERSION}/documents/${id}`,
    DELETE: (id: string) => `${API_VERSION}/documents/${id}`,
    DOWNLOAD: (id: string) => `${API_VERSION}/documents/${id}/download`,
    STATUS: (id: string) => `${API_VERSION}/documents/${id}/status`
  },

  // Chat
  CHAT: {
    BASE: `${API_VERSION}/chat`,
    SEND_MESSAGE: `${API_VERSION}/chat/message`,
    CONVERSATIONS: `${API_VERSION}/chat/conversations`,
    GET_CONVERSATION: (id: string) => `${API_VERSION}/chat/conversations/${id}`,
    GET_MESSAGES: (id: string) => `${API_VERSION}/chat/conversations/${id}/messages`,
    DELETE_CONVERSATION: (id: string) => `${API_VERSION}/chat/conversations/${id}`,
    ARCHIVE_CONVERSATION: (id: string) => `${API_VERSION}/chat/conversations/${id}/archive`
  },

  // Subscription & Payment
  SUBSCRIPTION: {
    BASE: `${API_VERSION}/subscription`,
    PLANS: `${API_VERSION}/subscription/plans`,
    CURRENT: `${API_VERSION}/subscription/current`,
    UPGRADE: `${API_VERSION}/subscription/upgrade`,
    DOWNGRADE: `${API_VERSION}/subscription/downgrade`,
    CANCEL: `${API_VERSION}/subscription/cancel`,
    USAGE: `${API_VERSION}/subscription/usage`,
    PAYMENT_METHODS: `${API_VERSION}/subscription/payment-methods`,
    INVOICES: `${API_VERSION}/subscription/invoices`
  },

  // Webhooks
  WEBHOOKS: {
    STRIPE: `${API_VERSION}/webhooks/stripe`
  }
};

// Helper function to build query strings
export const buildQueryString = (params: Record<string, any>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString();
};

// Helper function to build URL with params
export const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params) return baseUrl;
  const query = buildQueryString(params);
  return query ? `${baseUrl}?${query}` : baseUrl;
};
