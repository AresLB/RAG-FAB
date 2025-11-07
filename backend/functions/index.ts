import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateEnv } from '../config/env';
import { connectDatabase } from '../config/database';
import { logger, stream } from '../utils/logger';
import { errorHandler, notFoundHandler } from '../middleware/error.middleware';
import { generalLimiter } from '../middleware/rate-limit.middleware';

// Import routes
import authRoutes from './auth';
import healthRoutes from './health';

/**
 * Create Express application
 */
const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.APP_URL,
      credentials: true
    })
  );

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging (using winston stream)
  if (env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('combined', { stream }));
  }

  // Rate limiting (apply globally)
  app.use('/api', generalLimiter);

  // Routes
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/v1/auth', authRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate environment variables
    validateEnv();
    logger.info('Environment variables validated');

    // Try to connect to database (non-blocking)
    try {
      await connectDatabase();
      logger.info('Database connected');
    } catch (dbError) {
      logger.warn('Failed to connect to database, continuing without DB:', dbError);
      logger.warn('Server will start but database operations will fail');
    }

    // Create app
    const app = createApp();

    // Start listening
    const PORT = env.PORT;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`API URL: ${env.API_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
