import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { env } from '../../config/env';
import { User } from '../../models/User.model';
import { generateTokenPair } from '../../utils/jwt';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${env.APP_URL}/auth/gmail/callback`
);

/**
 * Initiate Gmail OAuth flow
 * @route GET /api/v1/oauth/gmail
 */
router.get('/gmail', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });

  res.redirect(authUrl);
});

/**
 * Gmail OAuth callback
 * @route GET /api/v1/oauth/gmail/callback
 */
router.get(
  '/gmail/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);

      // Get user info
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      if (!data.email) {
        return res.redirect(`${env.APP_URL}/login?error=no_email`);
      }

      // Find or create user
      let user = await User.findOne({ email: data.email });

      if (!user) {
        // Create new user
        user = await User.create({
          email: data.email,
          firstName: data.given_name || '',
          lastName: data.family_name || '',
          password: Math.random().toString(36), // Random password (OAuth login)
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            questionsUsed: 0,
            documentsUsed: 0
          }
        });
      }

      // Store OAuth tokens in user profile (optional)
      // You might want to create a separate OAuthTokens model

      // Generate JWT tokens
      const jwtTokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      logger.info('Gmail OAuth successful', { userId: user.id });

      // Redirect to frontend with tokens
      res.redirect(
        `${env.APP_URL}/auth/callback?token=${jwtTokens.accessToken}&refresh=${jwtTokens.refreshToken}&provider=gmail`
      );
    } catch (error: any) {
      logger.error('Gmail OAuth failed', { error: error.message });
      res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }
  })
);

export default router;
