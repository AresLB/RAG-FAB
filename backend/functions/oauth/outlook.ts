import { Router, Request, Response } from 'express';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { env } from '../../config/env';
import { User } from '../../models/User.model';
import { generateTokenPair } from '../../utils/jwt';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

const router = Router();

const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/common`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || ''
  }
};

const pca = new ConfidentialClientApplication(msalConfig);

const REDIRECT_URI = `${env.API_URL}/api/v1/oauth/outlook/callback`;
const SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'https://graph.microsoft.com/Mail.Read',
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/Mail.ReadWrite'
];

/**
 * Initiate Outlook OAuth flow
 * @route GET /api/v1/oauth/outlook
 */
router.get('/outlook', (req: Request, res: Response) => {
  const authCodeUrlParameters = {
    scopes: SCOPES,
    redirectUri: REDIRECT_URI,
    prompt: 'consent'
  };

  pca
    .getAuthCodeUrl(authCodeUrlParameters)
    .then((authUrl: string) => {
      res.redirect(authUrl);
    })
    .catch((error: any) => {
      logger.error('Failed to generate Outlook auth URL', { error: error.message });
      res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    });
});

/**
 * Outlook OAuth callback
 * @route GET /api/v1/oauth/outlook/callback
 */
router.get(
  '/outlook/callback',
  asyncHandler(async (req: Request, res: Response) => {
    console.log('📧 Outlook callback received');
    const { code } = req.query;

    if (!code) {
      console.log('❌ No code received');
      return res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }

    try {
      console.log('🔄 Exchanging code for tokens...');
      // Exchange code for tokens
      const tokenRequest = {
        code: code as string,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI
      };

      const response = await pca.acquireTokenByCode(tokenRequest);
      console.log('✅ Token response received');

      if (!response || !response.account) {
        console.log('❌ No account in response');
        return res.redirect(`${env.APP_URL}/login?error=no_account`);
      }

      const email = response.account.username;
      console.log('✅ User email:', email);

      if (!email) {
        console.log('❌ No email in account');
        return res.redirect(`${env.APP_URL}/login?error=no_email`);
      }

      // Find or create user
      console.log('🔄 Finding or creating user in database...');
      let user = await User.findOne({ email });

      if (!user) {
        console.log('🔄 User not found, creating new user...');
        // Create new user
        const name = response.account.name || '';
        const nameParts = name.split(' ');

        user = await User.create({
          email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          password: Math.random().toString(36), // Random password (OAuth login)
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            questionsUsed: 0,
            documentsUsed: 0
          }
        });
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

      logger.info('Outlook OAuth successful', { userId: user.id });

      // Redirect to frontend with tokens
      const redirectUrl = `${env.APP_URL}/auth/callback?token=${jwtTokens.accessToken}&refresh=${jwtTokens.refreshToken}&provider=outlook`;
      console.log('🔄 Redirecting to:', redirectUrl.substring(0, 100) + '...');
      res.redirect(redirectUrl);
    } catch (error: any) {
      console.error('❌ Outlook OAuth failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      logger.error('Outlook OAuth failed', { error: error.message });

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
