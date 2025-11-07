import { Request, Response, NextFunction } from 'express';
import { AppError, isOperationalError } from '../utils/errors';
import { ApiErrorCode, HttpStatus, IApiResponse } from '../../shared/types/api.types';
import { logger } from '../utils/logger';
import { isDevelopment } from '../config/env';

/**
 * Error handler middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.userId,
    ip: req.ip
  });

  // Handle AppError (operational errors)
  if (error instanceof AppError) {
    const response: IApiResponse = {
      success: false,
      error: error.toJSON(),
      message: error.message,
      timestamp: new Date().toISOString()
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const response: IApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
        details: error.message
      },
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.BAD_REQUEST).json(response);
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    const response: IApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Invalid ID format',
        statusCode: HttpStatus.BAD_REQUEST
      },
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.BAD_REQUEST).json(response);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    const response: IApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.USER_ALREADY_EXISTS,
        message: `${field} already exists`,
        statusCode: HttpStatus.CONFLICT
      },
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.CONFLICT).json(response);
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    const response: IApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.TOKEN_INVALID,
        message: 'Invalid token',
        statusCode: HttpStatus.UNAUTHORIZED
      },
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.UNAUTHORIZED).json(response);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    const response: IApiResponse = {
      success: false,
      error: {
        code: ApiErrorCode.TOKEN_EXPIRED,
        message: 'Token expired',
        statusCode: HttpStatus.UNAUTHORIZED
      },
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.UNAUTHORIZED).json(response);
    return;
  }

  // Handle all other errors (programming errors)
  const response: IApiResponse = {
    success: false,
    error: {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: isDevelopment ? error.message : 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      details: isDevelopment ? error.stack : undefined
    },
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: IApiResponse = {
    success: false,
    error: {
      code: ApiErrorCode.DOCUMENT_NOT_FOUND,
      message: `Route ${req.originalUrl} not found`,
      statusCode: HttpStatus.NOT_FOUND
    },
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.NOT_FOUND).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
