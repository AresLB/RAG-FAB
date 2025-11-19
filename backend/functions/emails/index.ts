import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { listEmails } from './list';
import { getEmailById } from './get';
import { getEmailFilters } from './filters';
import { generateDraft } from './generate-draft';

const router = Router();

// All email routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/v1/emails
 * @desc Get filtered emails from Gmail or Outlook
 * @access Private
 * @query provider - 'gmail' or 'outlook' (optional, auto-detected)
 * @query filterName - Label/Folder name (e.g., "AI-Assistent")
 * @query maxResults - Max number of emails to return (default: 20)
 * @query includeUnreadOnly - Only include unread emails (default: false)
 */
router.get('/', listEmails);

/**
 * @route GET /api/v1/emails/filters
 * @desc Get available email filters (Gmail labels or Outlook folders)
 * @access Private
 * @query provider - 'gmail' or 'outlook' (optional, auto-detected)
 */
router.get('/filters', getEmailFilters);

/**
 * @route GET /api/v1/emails/:id
 * @desc Get full email details by ID
 * @access Private
 * @query provider - 'gmail' or 'outlook' (required)
 */
router.get('/:id', getEmailById);

/**
 * @route POST /api/v1/emails/:id/generate-draft
 * @desc Generate AI draft reply for email
 * @access Private
 * @body provider - 'gmail' or 'outlook' (required)
 * @body documentIds - Array of document IDs to use (optional)
 */
router.post('/:id/generate-draft', generateDraft);

export default router;
