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
  `${env.API_URL}/api/v1/oauth/gmail/callback`
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
    console.log('📧 Gmail callback received');
    const { code } = req.query;

    if (!code) {
      console.log('❌ No code received');
      return res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }

    try {
      console.log('🔄 Exchanging code for tokens...');
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code as string);
      oauth2Client.setCredentials(tokens);
      console.log('✅ Tokens received');

      // Get user info
      console.log('🔄 Fetching user info...');
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      console.log('✅ User info received:', data.email);

      if (!data.email) {
        console.log('❌ No email in user data');
        return res.redirect(`${env.APP_URL}/login?error=no_email`);
      }

      // Find or create user
      console.log('🔄 Finding or creating user in database...');
      let user = await User.findOne({ email: data.email });

      if (!user) {
        console.log('🔄 User not found, creating new user...');

        // Extract name from email as fallback
        const emailLocalPart = data.email.split('@')[0];
        let firstName = data.given_name;

        // Ensure firstName has at least 2 characters
        if (!firstName || firstName.trim().length < 2) {
          firstName = (emailLocalPart && emailLocalPart.length >= 2) ? emailLocalPart : 'User';
        }

        const lastName = data.family_name;

        // Build user data - only include lastName if it has at least 2 characters
        const userData: any = {
          email: data.email,
          firstName,
          password: Math.random().toString(36), // Random password (OAuth login)
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            questionsUsed: 0,
            documentsUsed: 0
          }
        };

        // Only add lastName if it meets minlength requirement (2 chars)
        if (lastName && lastName.trim().length >= 2) {
          userData.lastName = lastName;
        }

        // Create new user
        user = await User.create(userData);
        console.log('✅ New user created:', user.id);
      } else {
        console.log('✅ Existing user found:', user.id);
      }

      // Store OAuth tokens in user profile (optional)
      // You might want to create a separate OAuthTokens model

      // Generate JWT tokens
      console.log('🔄 Generating JWT tokens...');
      const jwtTokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      console.log('✅ JWT tokens generated');

      logger.info('Gmail OAuth successful', { userId: user.id });

      // Redirect to frontend with tokens
      const redirectUrl = `${env.APP_URL}/auth/callback?token=${jwtTokens.accessToken}&refresh=${jwtTokens.refreshToken}&provider=gmail`;
      console.log('🔄 Redirecting to:', redirectUrl.substring(0, 100) + '...');
      res.redirect(redirectUrl);
    } catch (error: any) {
      console.error('❌ Gmail OAuth failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      logger.error('Gmail OAuth failed', { error: error.message });

      // Send detailed error info to frontend for debugging
      const errorDetails = encodeURIComponent(JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500) // Limit stack trace length
      }));
      res.redirect(`${env.APP_URL}/login?error=oauth_failed&details=${errorDetails}`);
    }
  })
);

export default router;
