import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chatLimiter } from '../../middleware/rate-limit.middleware';
import { askQuestion } from './ask';
import { askQuestionStream } from './ask-stream';
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

// Ask a question with streaming response (with RAG)
router.post('/ask/stream', chatLimiter, askQuestionStream);

// Conversation management
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversation);
router.patch('/conversations/:id', updateConversation);
router.delete('/conversations/:id', deleteConversationEndpoint);

export default router;
