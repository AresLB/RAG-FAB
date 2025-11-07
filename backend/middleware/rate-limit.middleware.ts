import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { ApiErrorCode, HttpStatus, IApiResponse } from '../../shared/types/api.types';
import { RATE_LIMITS } from '../../shared/constants/limits';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later',
      statusCode: HttpStatus.TOO_MANY_REQUESTS
    },
    timestamp: new Date().toISOString()
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth endpoints rate limiter (stricter)
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_ATTEMPTS,
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: {
      code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many login attempts, please try again later',
      statusCode: HttpStatus.TOO_MANY_REQUESTS
    },
    timestamp: new Date().toISOString()
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Document upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    error: {
      code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many upload requests, please try again later',
      statusCode: HttpStatus.TOO_MANY_REQUESTS
    },
    timestamp: new Date().toISOString()
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Chat rate limiter
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    success: false,
    error: {
      code: ApiErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many messages, please slow down',
      statusCode: HttpStatus.TOO_MANY_REQUESTS
    },
    timestamp: new Date().toISOString()
  } as IApiResponse,
  standardHeaders: true,
  legacyHeaders: false
});
