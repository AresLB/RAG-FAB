import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { getFilteredGmailEmails, findGmailLabelByName } from '../../services/integrations/gmail-service';
import { getFilteredOutlookEmails, findOutlookFolderByName } from '../../services/integrations/outlook-service';
import { OAuthToken } from '../../models/OAuthToken.model';

export interface EmailListItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: Date;
  isUnread: boolean;
  provider: 'gmail' | 'outlook';
}

/**
 * Get filtered emails from user's connected email provider
 * @route GET /api/v1/emails
 * @access Private
 */
export const listEmails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  // Query parameters
  const {
    provider, // 'gmail' or 'outlook'
    filterName, // Label/Folder name (e.g., "AI-Assistent")
    maxResults = 20,
    includeUnreadOnly = false
  } = req.query;

  logger.info('Fetching emails', { userId, provider, filterName });

  try {
    let emails: EmailListItem[] = [];

    // Determine which provider to use
    let targetProvider = provider as string | undefined;

    if (!targetProvider) {
      // Auto-detect provider based on available OAuth tokens
      const gmailToken = await OAuthToken.findOne({ userId, provider: 'google' });
      const outlookToken = await OAuthToken.findOne({ userId, provider: 'microsoft' });

      if (gmailToken) {
        targetProvider = 'gmail';
      } else if (outlookToken) {
        targetProvider = 'outlook';
      } else {
        throw new AppError(ApiErrorCode.EMAIL_PROVIDER_NOT_CONNECTED, 'No email provider connected. Please connect Gmail or Outlook.', HttpStatus.BAD_REQUEST);
      }
    }

    // Fetch emails based on provider
    if (targetProvider === 'gmail') {
      let labelIds: string[] | undefined;

      // Find label ID if filterName is provided
      if (filterName && typeof filterName === 'string') {
        const labelId = await findGmailLabelByName(userId, filterName);
        if (labelId) {
          labelIds = [labelId];
        } else {
          logger.warn('Gmail label not found', { userId, filterName });
        }
      }

      const gmailEmails = await getFilteredGmailEmails(userId, {
        labelIds,
        maxResults: Number(maxResults),
        includeUnreadOnly: includeUnreadOnly === 'true'
      });

      emails = gmailEmails.map(email => ({
        id: email.id,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        snippet: email.snippet,
        date: email.date,
        isUnread: email.isUnread,
        provider: 'gmail' as const
      }));
    } else if (targetProvider === 'outlook') {
      let folderId: string | undefined;

      // Find folder ID if filterName is provided
      if (filterName && typeof filterName === 'string') {
        folderId = await findOutlookFolderByName(userId, filterName) || undefined;
        if (!folderId) {
          logger.warn('Outlook folder not found', { userId, filterName });
        }
      }

      const outlookEmails = await getFilteredOutlookEmails(userId, {
        folderId,
        maxResults: Number(maxResults),
        includeUnreadOnly: includeUnreadOnly === 'true'
      });

      emails = outlookEmails.map(email => ({
        id: email.id,
        threadId: email.conversationId,
        subject: email.subject,
        from: email.from,
        snippet: email.snippet,
        date: email.receivedDateTime,
        isUnread: !email.isRead,
        provider: 'outlook' as const
      }));
    } else {
      throw new AppError(ApiErrorCode.INVALID_EMAIL_PROVIDER, 'Invalid provider. Use "gmail" or "outlook".', HttpStatus.BAD_REQUEST);
    }

    const response: IApiResponse<EmailListItem[]> = {
      success: true,
      data: emails,
      message: `Fetched ${emails.length} emails`,
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to fetch emails', { error: error.message, userId });
    throw error;
  }
});
