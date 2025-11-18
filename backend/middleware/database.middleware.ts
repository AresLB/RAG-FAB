import { Request, Response, NextFunction } from 'express';
import { connectDatabase, getDatabaseStatus } from '../config/database';
import { logger } from '../utils/logger';

let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

/**
 * Middleware to ensure database connection before handling requests
 * Designed for Vercel Serverless Functions
 */
export const ensureDatabaseConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // If already connected, proceed immediately
    if (getDatabaseStatus()) {
      return next();
    }

    // If connection is in progress, wait for it
    if (isConnecting && connectionPromise) {
      console.log('⏳ Waiting for existing connection attempt...');
      await connectionPromise;
      return next();
    }

    // Start new connection
    console.log('🔄 Establishing database connection...');
    isConnecting = true;

    connectionPromise = connectDatabase()
      .then(() => {
        console.log('✅ Database connected successfully');
        isConnecting = false;
        connectionPromise = null;
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error);
        isConnecting = false;
        connectionPromise = null;
        throw error;
      });

    await connectionPromise;
    next();
  } catch (error: any) {
    logger.error('Database connection middleware failed', {
      error: error.message,
      path: req.path
    });

    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database connection failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};
