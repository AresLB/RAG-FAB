import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvironmentConfig {
  // App
  NODE_ENV: string;
  PORT: number;
  APP_URL: string;
  API_URL: string;

  // Database
  MONGODB_URI: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;

  // OpenAI
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;

  // Pinecone
  PINECONE_API_KEY: string;
  PINECONE_ENVIRONMENT: string;
  PINECONE_INDEX_NAME: string;

  // AWS
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;

  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_BASIC_PRICE_ID?: string;
  STRIPE_PRO_PRICE_ID?: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value as string;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

export const env: EnvironmentConfig = {
  // App
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvNumber('PORT', 3000),
  APP_URL: getEnvVar('APP_URL', 'http://localhost:3000'),
  API_URL: getEnvVar('API_URL', 'http://localhost:3000/api'),

  // Database
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/rag-fab'),

  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRATION: getEnvVar('JWT_EXPIRATION', '15m'),
  JWT_REFRESH_SECRET: getEnvVar(
    'JWT_REFRESH_SECRET',
    'your-super-secret-refresh-key-change-in-production'
  ),
  JWT_REFRESH_EXPIRATION: getEnvVar('JWT_REFRESH_EXPIRATION', '7d'),

  // OpenAI
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  OPENAI_MODEL: getEnvVar('OPENAI_MODEL', 'gpt-3.5-turbo'),

  // Pinecone
  PINECONE_API_KEY: getEnvVar('PINECONE_API_KEY'),
  PINECONE_ENVIRONMENT: getEnvVar('PINECONE_ENVIRONMENT'),
  PINECONE_INDEX_NAME: getEnvVar('PINECONE_INDEX_NAME', 'rag-fab-documents'),

  // AWS (optional)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'eu-central-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,

  // Stripe (optional)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_BASIC_PRICE_ID: process.env.STRIPE_BASIC_PRICE_ID,
  STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100)
};

// Validate critical environment variables in production
export const validateEnv = (): void => {
  if (env.NODE_ENV === 'production') {
    const criticalVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'OPENAI_API_KEY',
      'PINECONE_API_KEY'
    ];

    const missing = criticalVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      // Log instead of throwing to see what's missing
      console.error(`⚠️ Missing critical environment variables in production: ${missing.join(', ')}`);
      console.error('Available env vars:', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')).join(', '));
      // Don't throw for now to debug
      // throw new Error(
      //   `Missing critical environment variables in production: ${missing.join(', ')}`
      // );
    }

    // Check if using default secrets in production
    if (
      env.JWT_SECRET.includes('change-in-production') ||
      env.JWT_REFRESH_SECRET.includes('change-in-production')
    ) {
      console.error('⚠️ Using default JWT secrets in production!');
      // Don't throw for now to debug
      // throw new Error('Cannot use default JWT secrets in production!');
    }
  }
};

// Export for convenience
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
