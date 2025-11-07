/**
 * API Types - Shared between Frontend and Backend
 */
export interface IApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: IApiError;
    message?: string;
    timestamp: string;
}
export interface IApiError {
    code: string;
    message: string;
    details?: any;
    statusCode: number;
}
export interface IPaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasMore: boolean;
    };
    timestamp: string;
}
export interface IQueryParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
}
export declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503
}
export declare enum ApiErrorCode {
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    UNAUTHORIZED = "UNAUTHORIZED",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
    DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
    DOCUMENT_UPLOAD_FAILED = "DOCUMENT_UPLOAD_FAILED",
    DOCUMENT_PROCESSING_FAILED = "DOCUMENT_PROCESSING_FAILED",
    INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    SUBSCRIPTION_LIMIT_REACHED = "SUBSCRIPTION_LIMIT_REACHED",
    QUESTIONS_LIMIT_REACHED = "QUESTIONS_LIMIT_REACHED",
    DOCUMENTS_LIMIT_REACHED = "DOCUMENTS_LIMIT_REACHED",
    PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
}
//# sourceMappingURL=api.types.d.ts.map