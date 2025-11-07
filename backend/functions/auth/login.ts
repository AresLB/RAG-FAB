import { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../../models/User.model';
import { generateTokenPair } from '../../utils/jwt';
import { IAuthResponse } from '../../../shared/types/user.types';
import { IApiResponse, HttpStatus } from '../../../shared/types/api.types';
import { AuthenticationError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required')
];

/**
 * Login user
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  logger.info(`Login attempt for email: ${email}`);

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    logger.warn(`Login failed: User not found - ${email}`);
    throw new AuthenticationError('Invalid email or password');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    logger.warn(`Login failed: Invalid password - ${email}`);
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if subscription is active
  if (!user.isSubscriptionActive()) {
    logger.warn(`Login failed: Subscription inactive - ${email}`);
    throw new AuthenticationError('Your subscription is inactive. Please contact support.');
  }

  logger.info(`User logged in successfully: ${user.id}`);

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  // Prepare response (exclude password)
  const authResponse: IAuthResponse = {
    user: {
      _id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscription: user.subscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };

  const response: IApiResponse<IAuthResponse> = {
    success: true,
    data: authResponse,
    message: 'Login successful',
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.OK).json(response);
});
