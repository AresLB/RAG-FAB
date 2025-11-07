import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { performRAGQuery, RAGQueryInput, RAGContext } from '../rag/rag-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionInput {
  query: string;
  userId: string;
  documentIds?: string[];
  conversationHistory?: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatCompletionResult {
  answer: string;
  ragContext: RAGContext;
  model: string;
  tokensUsed: number;
  processingTime: number;
}

/**
 * Generate chat completion with RAG context
 */
export const generateChatCompletion = async (
  input: ChatCompletionInput
): Promise<ChatCompletionResult> => {
  const {
    query,
    userId,
    documentIds,
    conversationHistory = [],
    model = env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature = 0.7,
    maxTokens = 1000
  } = input;

  const startTime = Date.now();

  logger.info('Generating chat completion', {
    userId,
    query: query.substring(0, 100),
    model,
    documentIds,
    historyLength: conversationHistory.length
  });

  try {
    // Step 1: Perform RAG query to get relevant context
    const ragInput: RAGQueryInput = {
      query,
      userId,
      documentIds,
      topK: 5,
      minScore: 0.7
    };

    const ragContext = await performRAGQuery(ragInput);

    // Step 2: Build system prompt with RAG context
    const systemPrompt = buildSystemPrompt(ragContext);

    // Step 3: Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: query }
    ];

    logger.debug('Sending request to OpenAI', {
      model,
      messageCount: messages.length,
      contextLength: ragContext.contextText.length
    });

    // Step 4: Call OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature,
      max_tokens: maxTokens,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated.';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const processingTime = Date.now() - startTime;

    logger.info('Chat completion generated successfully', {
      tokensUsed,
      processingTime,
      answerLength: answer.length,
      relevantChunks: ragContext.relevantChunks.length
    });

    return {
      answer,
      ragContext,
      model,
      tokensUsed,
      processingTime
    };
  } catch (error: any) {
    logger.error('Chat completion failed', {
      error: error.message,
      query: query.substring(0, 100)
    });
    throw new Error(`Chat completion failed: ${error.message}`);
  }
};

/**
 * Build system prompt with RAG context
 */
const buildSystemPrompt = (ragContext: RAGContext): string => {
  if (ragContext.relevantChunks.length === 0) {
    return `You are a helpful AI assistant. The user asked a question, but no relevant information was found in their documents.

Please let them know that you couldn't find relevant information in their uploaded documents to answer this question.
Suggest they either:
1. Upload documents that contain information about this topic
2. Rephrase their question
3. Ask a different question about their existing documents

Be polite and helpful.`;
  }

  return `You are a helpful AI assistant that answers questions based on the user's uploaded documents.

IMPORTANT INSTRUCTIONS:
1. Base your answer ONLY on the information provided in the context below
2. If the context doesn't contain enough information to answer the question, say so clearly
3. Cite which document(s) you're referencing in your answer
4. Be concise but thorough
5. If you're unsure, express uncertainty rather than making up information
6. Use a friendly, professional tone

RELEVANT CONTEXT FROM USER'S DOCUMENTS:

${ragContext.contextText}

---

Now, answer the user's question based on this context. If the context doesn't contain relevant information, be honest about it.`;
};

/**
 * Stream chat completion (for future implementation)
 */
export const streamChatCompletion = async (
  input: ChatCompletionInput,
  onChunk: (chunk: string) => void
): Promise<ChatCompletionResult> => {
  // This would be implemented similarly to generateChatCompletion
  // but using OpenAI's streaming API
  // For now, we'll just call the regular function
  const result = await generateChatCompletion(input);
  onChunk(result.answer);
  return result;
};
