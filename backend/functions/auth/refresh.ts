import { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../../models/User.model';
import { verifyRefreshToken, generateTokenPair } from '../../utils/jwt';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

/**
 * Validation rules for token refresh
 */
export const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh
 * @access Public
 */
export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  logger.info('Token refresh attempt');

  // Verify refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    logger.warn('Token refresh failed: Invalid refresh token');
    throw new AppError(
      ApiErrorCode.TOKEN_INVALID,
      'Invalid refresh token',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Check if user still exists
  const user = await User.findById(decoded.userId);

  if (!user) {
    logger.warn(`Token refresh failed: User not found - ${decoded.userId}`);
    throw new AppError(
      ApiErrorCode.USER_NOT_FOUND,
      'User no longer exists',
      HttpStatus.UNAUTHORIZED
    );
  }

  // Check if subscription is active
  if (!user.isSubscriptionActive()) {
    logger.warn(`Token refresh failed: Subscription inactive - ${user.id}`);
    throw new AppError(
      ApiErrorCode.SUBSCRIPTION_LIMIT_REACHED,
      'Your subscription is inactive',
      HttpStatus.FORBIDDEN
    );
  }

  logger.info(`Token refreshed successfully for user: ${user.id}`);

  // Generate new tokens
  const tokens = generateTokenPair({
    userId: user.id.toString(),
    email: user.email,
    role: user.role
  });

  const response: IApiResponse = {
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    },
    message: 'Token refreshed successfully',
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.OK).json(response);
});
