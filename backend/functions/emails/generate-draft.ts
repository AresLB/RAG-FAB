import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { IApiResponse, HttpStatus } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { generateEmailDraft, IncomingEmail, EmailDraft } from '../../services/agents/email-agent';
import { getGmailEmailById } from '../../services/integrations/gmail-service';
import { getOutlookEmailById } from '../../services/integrations/outlook-service';

/**
 * Generate AI draft for an email
 * @route POST /api/v1/emails/:id/generate-draft
 * @access Private
 */
export const generateDraft = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { provider, documentIds } = req.body; // provider: 'gmail' or 'outlook', documentIds: optional array

  if (!userId) {
    throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  if (!id) {
    throw new AppError('Email ID is required', HttpStatus.BAD_REQUEST);
  }

  if (!provider || (provider !== 'gmail' && provider !== 'outlook')) {
    throw new AppError('Provider parameter required (gmail or outlook)', HttpStatus.BAD_REQUEST);
  }

  logger.info('Generating draft for email', { userId, emailId: id, provider });

  try {
    // Step 1: Fetch email details
    let email: IncomingEmail;

    if (provider === 'gmail') {
      email = await getGmailEmailById(userId, id);
    } else {
      email = await getOutlookEmailById(userId, id);
    }

    // Step 2: Generate draft using RAG
    const draft: EmailDraft = await generateEmailDraft(email, userId, documentIds);

    const response: IApiResponse<EmailDraft> = {
      success: true,
      data: draft,
      message: 'Draft generated successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to generate draft', { error: error.message, userId, emailId: id });
    throw error;
  }
});
