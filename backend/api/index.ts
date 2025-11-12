import { createApp } from '../functions/index';
import { connectDatabase } from '../config/database';
import { validateEnv } from '../config/env';
import { logger } from '../utils/logger';

// Lazy DB connection for serverless
let isConnected = false;

async function ensureDbConnection() {
  if (isConnected) return;

  try {
    validateEnv();
    await connectDatabase();
    isConnected = true;
    logger.info('Database connected in serverless function');
  } catch (error) {
    logger.warn('Database connection failed, continuing without DB:', error);
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
