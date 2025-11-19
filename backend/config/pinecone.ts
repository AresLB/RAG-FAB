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
    logger.info('Initializing Pinecone client', {
      hasApiKey: !!env.PINECONE_API_KEY,
      hasEnvironment: !!env.PINECONE_ENVIRONMENT,
      indexName: env.PINECONE_INDEX_NAME
    });

    // Modern Pinecone SDK (v2+) only needs apiKey
    // Older SDK (v1) needs both apiKey and environment
    const config: any = {
      apiKey: env.PINECONE_API_KEY
    };

    // Only add environment if provided (for backwards compatibility)
    if (env.PINECONE_ENVIRONMENT) {
      config.environment = env.PINECONE_ENVIRONMENT;
    }

    pineconeClient = new Pinecone(config);

    logger.info('Pinecone client initialized successfully');

    return pineconeClient;
  } catch (error: any) {
    logger.error('Failed to initialize Pinecone client', {
      error: error.message,
      stack: error.stack,
      hasApiKey: !!env.PINECONE_API_KEY,
      hasEnvironment: !!env.PINECONE_ENVIRONMENT
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

    // List existing indexes (SDK v1+ returns IndexList object with indexes array)
    const indexList = await client.listIndexes();
    logger.info('Retrieved index list', {
      indexList: JSON.stringify(indexList),
      type: typeof indexList
    });

    // Handle different response formats from Pinecone SDK
    let indexExists = false;
    let existingIndexes: string[] = [];

    if (indexList && typeof indexList === 'object') {
      // SDK v1+ format: { indexes: [...] }
      if ('indexes' in indexList && Array.isArray(indexList.indexes)) {
        existingIndexes = indexList.indexes.map((idx: any) => idx.name);
        indexExists = existingIndexes.includes(indexName);
      }
      // Alternative: Array format
      else if (Array.isArray(indexList)) {
        existingIndexes = indexList.map((idx: any) => idx.name);
        indexExists = existingIndexes.includes(indexName);
      }
    }

    logger.info('Index check result', {
      indexName,
      indexExists,
      existingIndexes
    });

    if (indexExists) {
      logger.info('Pinecone index exists', { indexName });
      return client.index(indexName);
    }

    // Create index if it doesn't exist
    logger.info('Creating Pinecone index', { indexName });

    // SDK v1+ requires spec object
    await client.createIndex({
      name: indexName,
      dimension: 1536, // text-embedding-3-small dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    logger.info('Waiting for index to be ready', { indexName });

    // Wait for index to be ready
    let isReady = false;
    let attempts = 0;
    const maxAttempts = 60; // Increased to 2 minutes

    while (!isReady && attempts < maxAttempts) {
      try {
        const description = await client.describeIndex(indexName);
        isReady = description.status?.ready ?? false;

        logger.debug('Index status check', {
          attempt: attempts + 1,
          maxAttempts,
          isReady,
          status: description.status
        });

        if (!isReady) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        }
      } catch (describeError: any) {
        logger.warn('Error checking index status', {
          attempt: attempts + 1,
          error: describeError.message
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    if (!isReady) {
      throw new Error('Index creation timed out after 2 minutes');
    }

    logger.info('Pinecone index created successfully', { indexName });

    return client.index(indexName);
  } catch (error: any) {
    logger.error('Failed to get or create Pinecone index', {
      error: error.message,
      stack: error.stack,
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
