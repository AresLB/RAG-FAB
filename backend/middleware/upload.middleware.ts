import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FILE_LIMITS } from '../../shared/constants/limits';
import { AppError } from '../utils/errors';
import { ApiErrorCode, HttpStatus } from '../../shared/types/api.types';
import { SubscriptionPlan } from '../../shared/types/user.types';
import { getMaxFileSize } from '../../shared/constants/plans';

// Upload directory
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// File storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${uniqueId}${ext}`;
    cb(null, filename);
  }
});

// File filter - only allow PDF, DOCX, TXT
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = FILE_LIMITS.ALLOWED_MIME_TYPES;
  const allowedExts = FILE_LIMITS.ALLOWED_EXTENSIONS;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        ApiErrorCode.INVALID_FILE_TYPE,
        `Invalid file type. Only ${allowedExts.join(', ')} files are allowed`,
        HttpStatus.BAD_REQUEST
      )
    );
  }
};

// Get file size limit based on subscription plan
export const getFileSizeLimit = (plan: SubscriptionPlan): number => {
  const maxSizeMB = getMaxFileSize(plan);
  return maxSizeMB * 1024 * 1024; // Convert MB to bytes
};

// Create multer upload middleware
export const createUploadMiddleware = () => {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB max (will check actual limit in endpoint)
    }
  }).single('file');
};

// Helper to validate uploaded file
export const validateUploadedFile = (file: Express.Multer.File | undefined): void => {
  if (!file) {
    throw new AppError(
      ApiErrorCode.VALIDATION_ERROR,
      'No file uploaded',
      HttpStatus.BAD_REQUEST
    );
  }
};

// Export upload middleware
export const uploadMiddleware = createUploadMiddleware();
