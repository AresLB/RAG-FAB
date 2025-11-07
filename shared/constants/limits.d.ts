/**
 * System Limits and Constraints
 */
export declare const FILE_LIMITS: {
    FREE_MAX_SIZE: number;
    BASIC_MAX_SIZE: number;
    PRO_MAX_SIZE: number;
    ALLOWED_MIME_TYPES: string[];
    ALLOWED_EXTENSIONS: string[];
};
export declare const RATE_LIMITS: {
    FREE_PLAN: {
        WINDOW_MS: number;
        MAX_REQUESTS: number;
    };
    BASIC_PLAN: {
        WINDOW_MS: number;
        MAX_REQUESTS: number;
    };
    PRO_PLAN: {
        WINDOW_MS: number;
        MAX_REQUESTS: number;
    };
    AUTH: {
        WINDOW_MS: number;
        MAX_ATTEMPTS: number;
    };
};
export declare const DOCUMENT_LIMITS: {
    MAX_CHUNK_SIZE: number;
    CHUNK_OVERLAP: number;
    MAX_CHUNKS_PER_DOCUMENT: number;
    MIN_CHUNK_SIZE: number;
};
export declare const CHAT_LIMITS: {
    MAX_MESSAGE_LENGTH: number;
    MAX_CONTEXT_MESSAGES: number;
    MAX_SOURCES_RETURNED: number;
    MIN_SIMILARITY_SCORE: number;
    MAX_TOKENS_PER_REQUEST: number;
};
export declare const DB_LIMITS: {
    MAX_DOCUMENTS_PER_QUERY: number;
    MAX_MESSAGES_PER_QUERY: number;
    DEFAULT_PAGE_SIZE: number;
};
export declare const TOKEN_LIMITS: {
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
    PASSWORD_RESET_TOKEN_EXPIRY: string;
};
export declare const VALIDATION: {
    EMAIL_MAX_LENGTH: number;
    PASSWORD_MIN_LENGTH: number;
    PASSWORD_MAX_LENGTH: number;
    NAME_MIN_LENGTH: number;
    NAME_MAX_LENGTH: number;
    DOCUMENT_NAME_MAX_LENGTH: number;
};
export declare const CLEANUP: {
    DELETE_FAILED_UPLOADS_AFTER_HOURS: number;
    ARCHIVE_OLD_CONVERSATIONS_AFTER_DAYS: number;
    DELETE_INACTIVE_USERS_AFTER_DAYS: number;
};
//# sourceMappingURL=limits.d.ts.map