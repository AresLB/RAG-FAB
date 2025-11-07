import express from 'express';
import { uploadDocument } from './upload';
import { listDocuments } from './list';
import { getDocument } from './get';
import { deleteDocumentEndpoint } from './delete';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';
import { uploadLimiter } from '../../middleware/rate-limit.middleware';

const router = express.Router();

// All document routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/documents/upload
 * @desc    Upload a document
 * @access  Private
 */
router.post('/upload', uploadLimiter, uploadMiddleware, uploadDocument);

/**
 * @route   GET /api/v1/documents
 * @desc    List user's documents
 * @access  Private
 */
router.get('/', listDocuments);

/**
 * @route   GET /api/v1/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get('/:id', getDocument);

/**
 * @route   DELETE /api/v1/documents/:id
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:id', deleteDocumentEndpoint);

export default router;
