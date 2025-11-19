import express, { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';
import { IApiResponse, HttpStatus } from '../../shared/types/api.types';
import { env } from '../config/env';
import { initializePinecone } from '../config/pinecone';
import { logger } from '../utils/logger';

const router = express.Router();

interface HealthCheckData {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    openai: 'configured' | 'not_configured';
    pinecone: 'configured' | 'not_configured';
  };
}

/**
 * @route   GET /api/v1/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/', (req: Request, res: Response): void => {
  const dbStatus = getDatabaseStatus();

  const healthData: HealthCheckData = {
    status: dbStatus ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: '1.0.0',
    services: {
      database: dbStatus ? 'connected' : 'disconnected',
      openai: env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      pinecone: env.PINECONE_API_KEY ? 'configured' : 'not_configured'
    }
  };

  const response: IApiResponse<HealthCheckData> = {
    success: dbStatus,
    data: healthData,
    message: dbStatus ? 'Service is healthy' : 'Service is unhealthy',
    timestamp: new Date().toISOString()
  };

  const statusCode = dbStatus ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
  res.status(statusCode).json(response);
});

/**
 * @route   GET /api/v1/health/sentry-test
 * @desc    Test Sentry error tracking
 * @access  Public
 */
router.get('/sentry-test', (req: Request, res: Response): void => {
  // This will trigger Sentry
  throw new Error('🧪 Sentry Test Error - If you see this in Sentry, it works!');
});

/**
 * @route   GET /api/v1/health/pinecone-test
 * @desc    Test Pinecone connection and configuration
 * @access  Public
 */
router.get('/pinecone-test', async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Testing Pinecone connection...');

    // Check environment variables
    const hasApiKey = !!env.PINECONE_API_KEY;
    const hasEnvironment = !!env.PINECONE_ENVIRONMENT;
    const indexName = env.PINECONE_INDEX_NAME;

    logger.info('Pinecone config check', {
      hasApiKey,
      hasEnvironment,
      indexName,
      apiKeyPrefix: env.PINECONE_API_KEY ? env.PINECONE_API_KEY.substring(0, 10) + '...' : 'not set'
    });

    if (!hasApiKey) {
      res.status(500).json({
        success: false,
        error: 'PINECONE_API_KEY is not set',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Try to initialize Pinecone client
    logger.info('Initializing Pinecone client...');
    const client = await initializePinecone();
    logger.info('Pinecone client initialized successfully');

    // Try to list indexes
    logger.info('Listing Pinecone indexes...');
    const indexList = await client.listIndexes();
    logger.info('Index list retrieved', {
      indexList: JSON.stringify(indexList),
      type: typeof indexList
    });

    // Parse index list
    let indexes: string[] = [];
    if (indexList && typeof indexList === 'object') {
      if ('indexes' in indexList && Array.isArray(indexList.indexes)) {
        indexes = indexList.indexes.map((idx: any) => idx.name);
      } else if (Array.isArray(indexList)) {
        indexes = indexList.map((idx: any) => idx.name);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        status: 'Pinecone connection successful',
        config: {
          hasApiKey: true,
          hasEnvironment,
          indexName,
          apiKeyPrefix: env.PINECONE_API_KEY.substring(0, 10) + '...'
        },
        indexes: {
          available: indexes,
          count: indexes.length,
          targetExists: indexes.includes(indexName)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Pinecone test failed', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });

    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      },
      config: {
        hasApiKey: !!env.PINECONE_API_KEY,
        hasEnvironment: !!env.PINECONE_ENVIRONMENT,
        indexName: env.PINECONE_INDEX_NAME,
        apiKeyPrefix: env.PINECONE_API_KEY ? env.PINECONE_API_KEY.substring(0, 10) + '...' : 'not set'
      },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
