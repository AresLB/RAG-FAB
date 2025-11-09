"use strict";
/**
 * System Limits and Constraints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLEANUP = exports.VALIDATION = exports.TOKEN_LIMITS = exports.DB_LIMITS = exports.CHAT_LIMITS = exports.DOCUMENT_LIMITS = exports.RATE_LIMITS = exports.FILE_LIMITS = void 0;
// File Upload Limits
exports.FILE_LIMITS = {
    FREE_MAX_SIZE: 5 * 1024 * 1024, // 5 MB in bytes
    BASIC_MAX_SIZE: 20 * 1024 * 1024, // 20 MB in bytes
    PRO_MAX_SIZE: 100 * 1024 * 1024, // 100 MB in bytes
    ALLOWED_MIME_TYPES: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt']
};
// Rate Limiting
exports.RATE_LIMITS = {
    // Requests per window
    FREE_PLAN: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 20
    },
    BASIC_PLAN: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    },
    PRO_PLAN: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 500
    },
    // API specific
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_ATTEMPTS: 5 // Max login attempts
    }
};
// Document Processing
exports.DOCUMENT_LIMITS = {
    MAX_CHUNK_SIZE: 1000, // characters per chunk
    CHUNK_OVERLAP: 200, // characters overlap between chunks
    MAX_CHUNKS_PER_DOCUMENT: 1000,
    MIN_CHUNK_SIZE: 100
};
// Chat & AI
exports.CHAT_LIMITS = {
    MAX_MESSAGE_LENGTH: 2000, // characters
    MAX_CONTEXT_MESSAGES: 10, // Previous messages to include
    MAX_SOURCES_RETURNED: 5, // Top K similar chunks
    MIN_SIMILARITY_SCORE: 0.7, // Minimum similarity for retrieval
    MAX_TOKENS_PER_REQUEST: 4000 // OpenAI tokens
};
// Database
exports.DB_LIMITS = {
    MAX_DOCUMENTS_PER_QUERY: 100,
    MAX_MESSAGES_PER_QUERY: 50,
    DEFAULT_PAGE_SIZE: 20
};
// Token & JWT
exports.TOKEN_LIMITS = {
    ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
    REFRESH_TOKEN_EXPIRY: '7d', // 7 days
    PASSWORD_RESET_TOKEN_EXPIRY: '1h' // 1 hour
};
// Validation
exports.VALIDATION = {
    EMAIL_MAX_LENGTH: 255,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    DOCUMENT_NAME_MAX_LENGTH: 255
};
// Cleanup & Maintenance
exports.CLEANUP = {
    DELETE_FAILED_UPLOADS_AFTER_HOURS: 24,
    ARCHIVE_OLD_CONVERSATIONS_AFTER_DAYS: 90,
    DELETE_INACTIVE_USERS_AFTER_DAYS: 365
};
//# sourceMappingURL=limits.js.map