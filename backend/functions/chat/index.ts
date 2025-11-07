import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chatLimiter } from '../../middleware/rate-limit.middleware';
import { askQuestion } from './ask';
import {
  listConversations,
  getConversation,
  deleteConversationEndpoint,
  updateConversation
} from './conversations';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

/**
 * Chat Routes
 */

// Ask a question (with RAG)
router.post('/ask', chatLimiter, askQuestion);

// Conversation management
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.patch('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversationEndpoint);

export default router;
