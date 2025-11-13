import { createApp } from '../functions/index';
import { connectDatabase } from '../config/database';
import { validateEnv } from '../config/env';
import { logger } from '../utils/logger';

// Connect to database immediately on cold start
let isConnected = false;

async function initializeDatabase() {
  if (isConnected) return;

  try {
    const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;

    if (!dbUrl) {
      logger.error('❌ DATABASE_URL or MONGODB_URI environment variable is not set!');
      logger.error('Available env vars (non-secret):',
        Object.keys(process.env)
          .filter(k => !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD'))
          .join(', ')
      );
      return;
    }

    logger.info(`🔄 Attempting DB connection with URL: ${dbUrl.substring(0, 30)}...`);

    validateEnv();
    await connectDatabase();
    isConnected = true;

    logger.info('✅ Database connected successfully!');
  } catch (error: any) {
    logger.error('❌ Database connection failed:', {
      error: error.message,
      code: error.code,
      name: error.name
    });
  }
}

// Initialize DB connection (non-blocking)
initializeDatabase().catch(err => {
  logger.error('Failed to initialize database:', err);
});

// Export the Express app for Vercel Serverless
export default createApp();
