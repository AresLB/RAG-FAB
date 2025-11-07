/**
 * Error Messages and Codes
 */

import { ApiErrorCode, HttpStatus } from '../types/api.types';

export interface ErrorDefinition {
  code: ApiErrorCode;
  message: string;
  statusCode: HttpStatus;
}

export const ERROR_MESSAGES: Record<ApiErrorCode, ErrorDefinition> = {
  // Authentication Errors
  [ApiErrorCode.INVALID_CREDENTIALS]: {
    code: ApiErrorCode.INVALID_CREDENTIALS,
    message: 'Invalid email or password',
    statusCode: HttpStatus.UNAUTHORIZED
  },
  [ApiErrorCode.TOKEN_EXPIRED]: {
    code: ApiErrorCode.TOKEN_EXPIRED,
    message: 'Your session has expired. Please login again',
    statusCode: HttpStatus.UNAUTHORIZED
  },
  [ApiErrorCode.TOKEN_INVALID]: {
    code: ApiErrorCode.TOKEN_INVALID,
    message: 'Invalid or malformed token',
    statusCode: HttpStatus.UNAUTHORIZED
  },
  [ApiErrorCode.UNAUTHORIZED]: {
    code: ApiErrorCode.UNAUTHORIZED,
    message: 'You are not authorized to perform this action',
    statusCode: HttpStatus.FORBIDDEN
  },

  // User Errors
  [ApiErrorCode.USER_NOT_FOUND]: {
    code: ApiErrorCode.USER_NOT_FOUND,
    message: 'User not found',
    statusCode: HttpStatus.NOT_FOUND
  },
  [ApiErrorCode.USER_ALREADY_EXISTS]: {
    code: ApiErrorCode.USER_ALREADY_EXISTS,
    message: 'A user with this email already exists',
    statusCode: HttpStatus.CONFLICT
  },

  // Document Errors
  [ApiErrorCode.DOCUMENT_NOT_FOUND]: {
    code: ApiErrorCode.DOCUMENT_NOT_FOUND,
    message: 'Document not found',
    statusCode: HttpStatus.NOT_FOUND
  },
  [ApiErrorCode.DOCUMENT_UPLOAD_FAILED]: {
    code: ApiErrorCode.DOCUMENT_UPLOAD_FAILED,
    message: 'Failed to upload document. Please try again',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR
  },
  [ApiErrorCode.DOCUMENT_PROCESSING_FAILED]: {
    code: ApiErrorCode.DOCUMENT_PROCESSING_FAILED,
    message: 'Failed to process document. The file may be corrupted',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY
  },
  [ApiErrorCode.INVALID_FILE_TYPE]: {
    code: ApiErrorCode.INVALID_FILE_TYPE,
    message: 'Invalid file type. Only PDF, DOCX, and TXT files are supported',
    statusCode: HttpStatus.BAD_REQUEST
  },
  [ApiErrorCode.FILE_TOO_LARGE]: {
    code: ApiErrorCode.FILE_TOO_LARGE,
    message: 'File size exceeds the limit for your subscription plan',
    statusCode: HttpStatus.BAD_REQUEST
  },

  // Subscription Errors
  [ApiErrorCode.SUBSCRIPTION_LIMIT_REACHED]: {
    code: ApiErrorCode.SUBSCRIPTION_LIMIT_REACHED,
    message: 'You have reached your subscription limit. Please upgrade your plan',
    statusCode: HttpStatus.FORBIDDEN
  },
  [ApiErrorCode.QUESTIONS_LIMIT_REACHED]: {
    code: ApiErrorCode.QUESTIONS_LIMIT_REACHED,
    message: 'You have reached your monthly question limit. Please upgrade your plan',
    statusCode: HttpStatus.FORBIDDEN
  },
  [ApiErrorCode.DOCUMENTS_LIMIT_REACHED]: {
    code: ApiErrorCode.DOCUMENTS_LIMIT_REACHED,
    message: 'You have reached your document limit. Please upgrade your plan or delete old documents',
    statusCode: HttpStatus.FORBIDDEN
  },
  [ApiErrorCode.PAYMENT_REQUIRED]: {
    code: ApiErrorCode.PAYMENT_REQUIRED,
    message: 'Payment required to access this feature',
    statusCode: HttpStatus.FORBIDDEN
  },

  // General Errors
  [ApiErrorCode.VALIDATION_ERROR]: {
    code: ApiErrorCode.VALIDATION_ERROR,
    message: 'Validation failed. Please check your input',
    statusCode: HttpStatus.BAD_REQUEST
  },
  [ApiErrorCode.INTERNAL_ERROR]: {
    code: ApiErrorCode.INTERNAL_ERROR,
    message: 'An internal error occurred. Please try again later',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR
  },
  [ApiErrorCode.SERVICE_UNAVAILABLE]: {
    code: ApiErrorCode.SERVICE_UNAVAILABLE,
    message: 'Service temporarily unavailable. Please try again later',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE
  },
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests. Please slow down',
    statusCode: HttpStatus.TOO_MANY_REQUESTS
  }
};

// Helper function to get error definition
export const getErrorDefinition = (code: ApiErrorCode): ErrorDefinition => {
  return ERROR_MESSAGES[code];
};
