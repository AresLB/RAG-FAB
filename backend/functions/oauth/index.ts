import { Router } from 'express';
import gmailRouter from './gmail';
import outlookRouter from './outlook';

const router = Router();

// Gmail OAuth routes
router.use('/', gmailRouter);

// Outlook OAuth routes
router.use('/', outlookRouter);

export default router;
