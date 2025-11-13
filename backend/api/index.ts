import { createApp } from '../functions/index';
import { connectDatabase } from '../config/database';
import { validateEnv } from '../config/env';
import { logger } from '../utils/logger';

// Lazy DB connection for serverless
let isConnected = false;

async function ensureDbConnection() {
  if (isConnected) return;

  try {
    // Log the DATABASE_URL to verify it's set (without showing full credentials)
    const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!dbUrl) {
      logger.error('DATABASE_URL or MONGODB_URI environment variable is not set!');
      return;
    }

    // Log first 20 chars to verify it's there (without exposing password)
    logger.info(`Attempting DB connection with URL: ${dbUrl.substring(0, 20)}...`);

    validateEnv();
    await connectDatabase();
    isConnected = true;
    logger.info('✅ Database connected successfully in serverless function');
  } catch (error: any) {
    logger.error('❌ Database connection failed:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

const app = createApp();

// Middleware to ensure DB connection on first request
app.use(async (req, res, next) => {
  await ensureDbConnection();
  next();
});

// Export the Express app for Vercel Serverless
export default app;
