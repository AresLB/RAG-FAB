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

const REDIRECT_URI = `${env.APP_URL}/auth/outlook/callback`;
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
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }

    try {
      // Exchange code for tokens
      const tokenRequest = {
        code: code as string,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI
      };

      const response = await pca.acquireTokenByCode(tokenRequest);

      if (!response || !response.account) {
        return res.redirect(`${env.APP_URL}/login?error=no_account`);
      }

      const email = response.account.username;

      if (!email) {
        return res.redirect(`${env.APP_URL}/login?error=no_email`);
      }

      // Find or create user
      let user = await User.findOne({ email });

      if (!user) {
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
      }

      // Store OAuth tokens in user profile (optional)
      // You might want to create a separate OAuthTokens model

      // Generate JWT tokens
      const jwtTokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      logger.info('Outlook OAuth successful', { userId: user.id });

      // Redirect to frontend with tokens
      res.redirect(
        `${env.APP_URL}/auth/callback?token=${jwtTokens.accessToken}&refresh=${jwtTokens.refreshToken}&provider=outlook`
      );
    } catch (error: any) {
      logger.error('Outlook OAuth failed', { error: error.message });
      res.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }
  })
);

export default router;
