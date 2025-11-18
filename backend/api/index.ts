import { createApp } from '../functions/index';

/**
 * Vercel Serverless Function Entry Point
 *
 * Database connection is handled by middleware (ensureDatabaseConnection)
 * on each request, which is the recommended pattern for serverless functions.
 */

// Export the Express app for Vercel Serverless
export default createApp();
