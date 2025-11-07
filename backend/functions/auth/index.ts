import express from 'express';
import { register, registerValidation } from './register';
import { login, loginValidation } from './login';
import { refresh, refreshValidation } from './refresh';
import { getMe } from './me';
import { validate } from '../../middleware/validation.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rate-limit.middleware';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', registerValidation, validate, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, validate, login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshValidation, validate, refresh);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getMe);

export default router;
