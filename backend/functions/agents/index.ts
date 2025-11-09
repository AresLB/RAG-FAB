import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { generateDraft, fetchEmails, batchProcess } from './email';

const router = Router();

// All agent routes require authentication
router.use(authenticate);

/**
 * Email Agent Routes
 */
router.post('/email/draft', generateDraft);
router.post('/email/fetch', fetchEmails);
router.post('/email/batch', batchProcess);

export default router;
