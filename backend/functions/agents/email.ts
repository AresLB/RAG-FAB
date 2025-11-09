import { Request, Response } from 'express';
import { User } from '../../models/User.model';
import { generateEmailDraft, batchProcessEmails, IncomingEmail } from '../../services/agents/email-agent';
import { fetchGmailEmails, createGmailDraft } from '../../services/integrations/gmail-service';
import { fetchOutlookEmails, createOutlookDraft } from '../../services/integrations/outlook-service';
import { IApiResponse, HttpStatus, ApiErrorCode } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { asyncHandler } from '../../middleware/error.middleware';
import { logger } from '../../utils/logger';

export interface GenerateDraftRequest {
  email: IncomingEmail;
  documentIds?: string[];
}

export interface FetchEmailsRequest {
  provider: 'gmail' | 'outlook';
  accessToken: string;
  maxResults?: number;
}

/**
 * Generate email draft from incoming email
 * @route POST /api/v1/agents/email/draft
 * @access Private
 */
export const generateDraft = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  const { email, documentIds }: GenerateDraftRequest = req.body;

  if (!email || !email.from || !email.subject || !email.body) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      'Invalid email data',
      HttpStatus.BAD_REQUEST
    );
  }

  logger.info('Generating email draft', { userId, from: email.from });

  try {
    const draft = await generateEmailDraft(email, userId, documentIds);

    const response: IApiResponse<typeof draft> = {
      success: true,
      data: draft,
      message: 'Email draft generated successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to generate email draft', { error: error.message, userId });
    throw new AppError(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to generate draft: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Fetch emails from Gmail/Outlook
 * @route POST /api/v1/agents/email/fetch
 * @access Private
 */
export const fetchEmails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  const { provider, accessToken, maxResults = 10 }: FetchEmailsRequest = req.body;

  if (!provider || !accessToken) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      'Provider and accessToken required',
      HttpStatus.BAD_REQUEST
    );
  }

  logger.info('Fetching emails', { userId, provider });

  try {
    let emails: IncomingEmail[] = [];

    if (provider === 'gmail') {
      emails = await fetchGmailEmails({ accessToken }, maxResults);
    } else if (provider === 'outlook') {
      emails = await fetchOutlookEmails({ accessToken }, maxResults);
    } else {
      throw new AppError(
        ApiErrorCode.VALIDATION_ERROR,
        'Invalid provider. Use gmail or outlook',
        HttpStatus.BAD_REQUEST
      );
    }

    const response: IApiResponse<{ emails: IncomingEmail[] }> = {
      success: true,
      data: { emails },
      message: `Fetched ${emails.length} emails from ${provider}`,
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to fetch emails', { error: error.message, userId, provider });
    throw new AppError(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to fetch emails: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Batch process emails and generate drafts
 * @route POST /api/v1/agents/email/batch
 * @access Private
 */
export const batchProcess = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    throw new AppError(ApiErrorCode.UNAUTHORIZED, 'User not authenticated', HttpStatus.UNAUTHORIZED);
  }

  const { emails, documentIds }: { emails: IncomingEmail[]; documentIds?: string[] } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      'Emails array required',
      HttpStatus.BAD_REQUEST
    );
  }

  logger.info('Batch processing emails', { userId, count: emails.length });

  try {
    const drafts = await batchProcessEmails(emails, userId, documentIds);

    const response: IApiResponse<{ drafts: typeof drafts }> = {
      success: true,
      data: { drafts },
      message: `Generated ${drafts.length} email drafts`,
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to batch process emails', { error: error.message, userId });
    throw new AppError(
      ApiErrorCode.INTERNAL_ERROR,
      `Failed to batch process: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
});
