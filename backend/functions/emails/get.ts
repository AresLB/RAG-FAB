import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/error.middleware';
import { IApiResponse, HttpStatus } from '../../../shared/types/api.types';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { getGmailEmailById } from '../../services/integrations/gmail-service';
import { getOutlookEmailById } from '../../services/integrations/outlook-service';
import { IncomingEmail } from '../../services/agents/email-agent';

/**
 * Get email details by ID
 * @route GET /api/v1/emails/:id
 * @access Private
 */
export const getEmailById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { provider } = req.query; // 'gmail' or 'outlook'

  if (!userId) {
    throw new AppError('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  if (!id) {
    throw new AppError('Email ID is required', HttpStatus.BAD_REQUEST);
  }

  if (!provider || (provider !== 'gmail' && provider !== 'outlook')) {
    throw new AppError('Provider parameter required (gmail or outlook)', HttpStatus.BAD_REQUEST);
  }

  logger.info('Fetching email details', { userId, emailId: id, provider });

  try {
    let email: IncomingEmail;

    if (provider === 'gmail') {
      email = await getGmailEmailById(userId, id);
    } else {
      email = await getOutlookEmailById(userId, id);
    }

    const response: IApiResponse<IncomingEmail> = {
      success: true,
      data: email,
      message: 'Email details fetched successfully',
      timestamp: new Date().toISOString()
    };

    res.status(HttpStatus.OK).json(response);
  } catch (error: any) {
    logger.error('Failed to fetch email details', { error: error.message, userId, emailId: id });
    throw error;
  }
});
