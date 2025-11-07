import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { IApiResponse, HttpStatus } from '../../../shared/types/api.types';
import { AppError, NotFoundError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(
      'UNAUTHORIZED' as any,
      'User not authenticated',
      HttpStatus.UNAUTHORIZED
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  const response: IApiResponse = {
    success: true,
    data: {
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscription: user.subscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.OK).json(response);
});
