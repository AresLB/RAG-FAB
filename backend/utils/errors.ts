import { ApiErrorCode, HttpStatus, IApiError } from '../../shared/types/api.types';
import { ERROR_MESSAGES, ErrorDefinition } from '../../shared/constants/errors';

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: HttpStatus;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ApiErrorCode,
    message?: string,
    statusCode?: HttpStatus,
    details?: any,
    isOperational: boolean = true
  ) {
    const errorDef: ErrorDefinition = ERROR_MESSAGES[code];

    super(message || errorDef.message);

    this.code = code;
    this.statusCode = statusCode || errorDef.statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON(): IApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details
    };
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(ApiErrorCode.VALIDATION_ERROR, message, HttpStatus.BAD_REQUEST, details);
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message?: string) {
    super(
      ApiErrorCode.INVALID_CREDENTIALS,
      message || 'Invalid credentials',
      HttpStatus.UNAUTHORIZED
    );
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message?: string) {
    super(
      ApiErrorCode.UNAUTHORIZED,
      message || 'Unauthorized access',
      HttpStatus.FORBIDDEN
    );
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      ApiErrorCode.DOCUMENT_NOT_FOUND, // Generic, will be more specific based on resource
      `${resource} not found`,
      HttpStatus.NOT_FOUND
    );
  }
}

/**
 * Subscription Limit Error
 */
export class SubscriptionLimitError extends AppError {
  constructor(limitType: 'questions' | 'documents') {
    const code =
      limitType === 'questions'
        ? ApiErrorCode.QUESTIONS_LIMIT_REACHED
        : ApiErrorCode.DOCUMENTS_LIMIT_REACHED;

    super(code, undefined, HttpStatus.FORBIDDEN);
  }
}

/**
 * Check if error is operational (expected)
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};
