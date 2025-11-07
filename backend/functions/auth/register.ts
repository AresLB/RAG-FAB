import { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../../models/User.model';
import { generateTokenPair } from '../../utils/jwt';
import { IAuthResponse, UserRole, SubscriptionPlan } from '../../../shared/types/user.types';
import { IApiResponse, HttpStatus } from '../../../shared/types/api.types';
import { AppError, AuthenticationError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { VALIDATION } from '../../../shared/constants/limits';
import { PLANS, getQuestionsLimit, getDocumentsLimit } from '../../../shared/constants/plans';
import { logger } from '../../utils/logger';

/**
 * Validation rules for registration
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: VALIDATION.EMAIL_MAX_LENGTH })
    .withMessage(`Email cannot exceed ${VALIDATION.EMAIL_MAX_LENGTH} characters`),

  body('password')
    .isLength({ min: VALIDATION.PASSWORD_MIN_LENGTH, max: VALIDATION.PASSWORD_MAX_LENGTH })
    .withMessage(
      `Password must be between ${VALIDATION.PASSWORD_MIN_LENGTH} and ${VALIDATION.PASSWORD_MAX_LENGTH} characters`
    )
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('firstName')
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(
      `First name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`
    ),

  body('lastName')
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN_LENGTH, max: VALIDATION.NAME_MAX_LENGTH })
    .withMessage(
      `Last name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`
    )
];

/**
 * Register new user
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, firstName, lastName } = req.body;

  logger.info(`Registration attempt for email: ${email}`);

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AuthenticationError('A user with this email already exists');
  }

  // Get free plan limits
  const questionsLimit = getQuestionsLimit(SubscriptionPlan.FREE) as number;
  const documentsLimit = getDocumentsLimit(SubscriptionPlan.FREE) as number;

  // Create new user with free subscription
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: UserRole.USER,
    subscription: {
      plan: SubscriptionPlan.FREE,
      status: 'active',
      startDate: new Date(),
      questionsUsed: 0,
      questionsLimit,
      documentsUsed: 0,
      documentsLimit
    }
  });

  logger.info(`User registered successfully: ${user._id}`);

  // Generate tokens
  const tokens = generateTokenPair({
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  });

  // Prepare response
  const authResponse: IAuthResponse = {
    user: {
      _id: user._id.toString(),
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
    message: 'Registration successful',
    timestamp: new Date().toISOString()
  };

  res.status(HttpStatus.CREATED).json(response);
});
