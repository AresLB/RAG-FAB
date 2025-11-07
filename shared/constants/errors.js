"use strict";
/**
 * Error Messages and Codes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorDefinition = exports.ERROR_MESSAGES = void 0;
const api_types_1 = require("../types/api.types");
exports.ERROR_MESSAGES = {
    // Authentication Errors
    [api_types_1.ApiErrorCode.INVALID_CREDENTIALS]: {
        code: api_types_1.ApiErrorCode.INVALID_CREDENTIALS,
        message: 'Invalid email or password',
        statusCode: api_types_1.HttpStatus.UNAUTHORIZED
    },
    [api_types_1.ApiErrorCode.TOKEN_EXPIRED]: {
        code: api_types_1.ApiErrorCode.TOKEN_EXPIRED,
        message: 'Your session has expired. Please login again',
        statusCode: api_types_1.HttpStatus.UNAUTHORIZED
    },
    [api_types_1.ApiErrorCode.TOKEN_INVALID]: {
        code: api_types_1.ApiErrorCode.TOKEN_INVALID,
        message: 'Invalid or malformed token',
        statusCode: api_types_1.HttpStatus.UNAUTHORIZED
    },
    [api_types_1.ApiErrorCode.UNAUTHORIZED]: {
        code: api_types_1.ApiErrorCode.UNAUTHORIZED,
        message: 'You are not authorized to perform this action',
        statusCode: api_types_1.HttpStatus.FORBIDDEN
    },
    // User Errors
    [api_types_1.ApiErrorCode.USER_NOT_FOUND]: {
        code: api_types_1.ApiErrorCode.USER_NOT_FOUND,
        message: 'User not found',
        statusCode: api_types_1.HttpStatus.NOT_FOUND
    },
    [api_types_1.ApiErrorCode.USER_ALREADY_EXISTS]: {
        code: api_types_1.ApiErrorCode.USER_ALREADY_EXISTS,
        message: 'A user with this email already exists',
        statusCode: api_types_1.HttpStatus.CONFLICT
    },
    // Document Errors
    [api_types_1.ApiErrorCode.DOCUMENT_NOT_FOUND]: {
        code: api_types_1.ApiErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
        statusCode: api_types_1.HttpStatus.NOT_FOUND
    },
    [api_types_1.ApiErrorCode.DOCUMENT_UPLOAD_FAILED]: {
        code: api_types_1.ApiErrorCode.DOCUMENT_UPLOAD_FAILED,
        message: 'Failed to upload document. Please try again',
        statusCode: api_types_1.HttpStatus.INTERNAL_SERVER_ERROR
    },
    [api_types_1.ApiErrorCode.DOCUMENT_PROCESSING_FAILED]: {
        code: api_types_1.ApiErrorCode.DOCUMENT_PROCESSING_FAILED,
        message: 'Failed to process document. The file may be corrupted',
        statusCode: api_types_1.HttpStatus.UNPROCESSABLE_ENTITY
    },
    [api_types_1.ApiErrorCode.INVALID_FILE_TYPE]: {
        code: api_types_1.ApiErrorCode.INVALID_FILE_TYPE,
        message: 'Invalid file type. Only PDF, DOCX, and TXT files are supported',
        statusCode: api_types_1.HttpStatus.BAD_REQUEST
    },
    [api_types_1.ApiErrorCode.FILE_TOO_LARGE]: {
        code: api_types_1.ApiErrorCode.FILE_TOO_LARGE,
        message: 'File size exceeds the limit for your subscription plan',
        statusCode: api_types_1.HttpStatus.BAD_REQUEST
    },
    // Subscription Errors
    [api_types_1.ApiErrorCode.SUBSCRIPTION_LIMIT_REACHED]: {
        code: api_types_1.ApiErrorCode.SUBSCRIPTION_LIMIT_REACHED,
        message: 'You have reached your subscription limit. Please upgrade your plan',
        statusCode: api_types_1.HttpStatus.FORBIDDEN
    },
    [api_types_1.ApiErrorCode.QUESTIONS_LIMIT_REACHED]: {
        code: api_types_1.ApiErrorCode.QUESTIONS_LIMIT_REACHED,
        message: 'You have reached your monthly question limit. Please upgrade your plan',
        statusCode: api_types_1.HttpStatus.FORBIDDEN
    },
    [api_types_1.ApiErrorCode.DOCUMENTS_LIMIT_REACHED]: {
        code: api_types_1.ApiErrorCode.DOCUMENTS_LIMIT_REACHED,
        message: 'You have reached your document limit. Please upgrade your plan or delete old documents',
        statusCode: api_types_1.HttpStatus.FORBIDDEN
    },
    [api_types_1.ApiErrorCode.PAYMENT_REQUIRED]: {
        code: api_types_1.ApiErrorCode.PAYMENT_REQUIRED,
        message: 'Payment required to access this feature',
        statusCode: api_types_1.HttpStatus.FORBIDDEN
    },
    // General Errors
    [api_types_1.ApiErrorCode.VALIDATION_ERROR]: {
        code: api_types_1.ApiErrorCode.VALIDATION_ERROR,
        message: 'Validation failed. Please check your input',
        statusCode: api_types_1.HttpStatus.BAD_REQUEST
    },
    [api_types_1.ApiErrorCode.INTERNAL_ERROR]: {
        code: api_types_1.ApiErrorCode.INTERNAL_ERROR,
        message: 'An internal error occurred. Please try again later',
        statusCode: api_types_1.HttpStatus.INTERNAL_SERVER_ERROR
    },
    [api_types_1.ApiErrorCode.SERVICE_UNAVAILABLE]: {
        code: api_types_1.ApiErrorCode.SERVICE_UNAVAILABLE,
        message: 'Service temporarily unavailable. Please try again later',
        statusCode: api_types_1.HttpStatus.SERVICE_UNAVAILABLE
    },
    [api_types_1.ApiErrorCode.RATE_LIMIT_EXCEEDED]: {
        code: api_types_1.ApiErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests. Please slow down',
        statusCode: api_types_1.HttpStatus.TOO_MANY_REQUESTS
    }
};
// Helper function to get error definition
const getErrorDefinition = (code) => {
    return exports.ERROR_MESSAGES[code];
};
exports.getErrorDefinition = getErrorDefinition;
//# sourceMappingURL=errors.js.map