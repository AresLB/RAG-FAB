import OpenAI from 'openai';
import { logger } from '../utils/logger';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
export const initOpenAI = (): OpenAI => {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  openaiClient = new OpenAI({
    apiKey
  });

  logger.info('OpenAI client initialized successfully');
  return openaiClient;
};

/**
 * Get OpenAI client instance
 */
export const getOpenAI = (): OpenAI => {
  if (!openaiClient) {
    return initOpenAI();
  }
  return openaiClient;
};

export { openaiClient };
