import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { getGmailLabels, GmailLabel } from '../../services/integrations/gmail-service';
import { getOutlookFolders, OutlookFolder } from '../../services/integrations/outlook-service';
import { OAuthToken } from '../../models/OAuthToken.model';

export interface EmailFilter {
  id: string;
  name: string;
  count?: number;
  type?: string;
}

/**
 * Get available email filters (Gmail labels or Outlook folders)
 * @route GET /api/v1/emails/filters
 * @access Private
 */
export const getEmailFilters = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { provider } = req.query; // 'gmail' or 'outlook'

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  logger.info('Fetching email filters', { userId, provider });

  try {
    let filters: EmailFilter[] = [];
    let detectedProvider: string;

    // Determine which provider to use
    if (provider === 'gmail' || provider === 'outlook') {
      detectedProvider = provider;
    } else {
      // Auto-detect based on available OAuth tokens
      const gmailToken = await OAuthToken.findOne({ userId, provider: 'google' });
      const outlookToken = await OAuthToken.findOne({ userId, provider: 'microsoft' });

      if (gmailToken) {
        detectedProvider = 'gmail';
      } else if (outlookToken) {
        detectedProvider = 'outlook';
      } else {
        throw new AppError(ApiErrorCode.EMAIL_PROVIDER_NOT_CONNECTED, 'No email provider connected', HttpStatus.BAD_REQUEST);
      }
    }

    if (detectedProvider === 'gmail') {
      const labels: GmailLabel[] = await getGmailLabels(userId);

      filters = labels
        .filter(label => label.type === 'user') // Only show user-created labels
        .map(label => ({
          id: label.id,
          name: label.name,
          type: label.type
        }));
    } else if (detectedProvider === 'outlook') {
      const folders: OutlookFolder[] = await getOutlookFolders(userId);

      filters = folders.map(folder => ({
        id: folder.id,
        name: folder.displayName,
        count: folder.unreadItemCount
      }));
    }

    const response: IApiResponse<{ provider: string; filters: EmailFilter[] }> = {
      success: true,
      data: {
        provider: detectedProvider,
        filters
      },
      message: `Fetched ${filters.length} filters`,
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to fetch email filters', { error: error.message, userId });
    throw error;
  }
});
