import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt';
import { User } from '../models/User.model';
import { ITokenPayload, UserRole } from '../../shared/types/user.types';
import { ApiErrorCode, HttpStatus } from '../../shared/types/api.types';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
      userId?: string;
    }
  }
}

/**
 * Authenticate middleware - Verifies JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new AppError(
        ApiErrorCode.UNAUTHORIZED,
        'No token provided',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError(
        ApiErrorCode.USER_NOT_FOUND,
        'User no longer exists',
        HttpStatus.UNAUTHORIZED
      );
    }

    // Check if subscription is active
    if (!user.isSubscriptionActive()) {
      throw new AppError(
        ApiErrorCode.SUBSCRIPTION_LIMIT_REACHED,
        'Your subscription is inactive',
        HttpStatus.FORBIDDEN
      );
    }

    // Attach user info to request
    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Authorize middleware - Checks user role
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(
          ApiErrorCode.UNAUTHORIZED,
          'User not authenticated',
          HttpStatus.UNAUTHORIZED
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          ApiErrorCode.UNAUTHORIZED,
          'You do not have permission to perform this action',
          HttpStatus.FORBIDDEN
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authenticate - Authenticates if token present, continues if not
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user) {
        req.user = decoded;
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (error) {
    // If optional auth fails, just continue without user
    logger.debug('Optional authentication failed:', error);
    next();
  }
};
