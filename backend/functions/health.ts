import express, { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';
import { IApiResponse, HttpStatus } from '../../shared/types/api.types';
import { env } from '../config/env';

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

export default router;
