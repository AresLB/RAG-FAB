import { Pinecone } from '@pinecone-database/pinecone';
import { env } from './env';
import { logger } from '../utils/logger';

let pineconeClient: Pinecone | null = null;

/**
 * Initialize Pinecone client (singleton pattern)
 */
export const initializePinecone = async (): Promise<Pinecone> => {
  if (pineconeClient) {
    return pineconeClient;
  }

  try {
    logger.info('Initializing Pinecone client');

    pineconeClient = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT
    });

    logger.info('Pinecone client initialized successfully');

    return pineconeClient;
  } catch (error: any) {
    logger.error('Failed to initialize Pinecone client', {
      error: error.message
    });
    throw new Error(`Failed to initialize Pinecone: ${error.message}`);
  }
};

/**
 * Get Pinecone client instance
 */
export const getPineconeClient = (): Pinecone => {
  if (!pineconeClient) {
    throw new Error('Pinecone client not initialized. Call initializePinecone() first.');
  }
  return pineconeClient;
};

/**
 * Get or create Pinecone index
 */
export const getOrCreateIndex = async (indexName: string = env.PINECONE_INDEX_NAME) => {
  try {
    const client = await initializePinecone();

    logger.info('Checking if Pinecone index exists', { indexName });

    // List existing indexes
    const indexesList = await client.listIndexes();
    const indexNames = indexesList.map((index: any) => index.name);
    const indexExists = indexNames.includes(indexName);

    if (indexExists) {
      logger.info('Pinecone index exists', { indexName });
      return client.index(indexName);
    }

    // Create index if it doesn't exist
    logger.info('Creating Pinecone index', { indexName });

    await client.createIndex({
      name: indexName,
      dimension: 1536, // text-embedding-3-small dimension
      metric: 'cosine'
    });

    logger.info('Waiting for index to be ready', { indexName });

    // Wait for index to be ready
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!isReady && attempts < maxAttempts) {
      const description = await client.describeIndex(indexName);
      isReady = description.status?.ready ?? false;

      if (!isReady) {
        logger.debug('Index not ready yet, waiting...', {
          attempt: attempts + 1,
          maxAttempts
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    if (!isReady) {
      throw new Error('Index creation timed out');
    }

    logger.info('Pinecone index created successfully', { indexName });

    return client.index(indexName);
  } catch (error: any) {
    logger.error('Failed to get or create Pinecone index', {
      error: error.message,
      indexName
    });
    throw new Error(`Failed to get or create index: ${error.message}`);
  }
};

/**
 * Delete Pinecone index (use with caution!)
 */
export const deleteIndex = async (indexName: string = env.PINECONE_INDEX_NAME) => {
  try {
    const client = await initializePinecone();

    logger.warn('Deleting Pinecone index', { indexName });

    await client.deleteIndex(indexName);

    logger.info('Pinecone index deleted', { indexName });
  } catch (error: any) {
    logger.error('Failed to delete Pinecone index', {
      error: error.message,
      indexName
    });
    throw new Error(`Failed to delete index: ${error.message}`);
  }
};
