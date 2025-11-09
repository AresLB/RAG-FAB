import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { performRAGQuery, RAGQueryInput, RAGContext } from '../rag/rag-service';
import { getSystemPrompt, detectDomain, PromptDomain } from './prompts';

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
 * Build system prompt with RAG context and domain-specific instructions
 */
const buildSystemPrompt = (ragContext: RAGContext): string => {
  if (ragContext.relevantChunks.length === 0) {
    return `Du bist ein hilfreicher KI-Assistent. Der User hat eine Frage gestellt, aber keine relevanten Informationen wurden in den Dokumenten gefunden.

Teile höflich mit, dass keine relevanten Informationen in den hochgeladenen Dokumenten gefunden wurden.
Schlage vor:
1. Dokumente hochzuladen, die Informationen zu diesem Thema enthalten
2. Die Frage umzuformulieren
3. Eine andere Frage zu den vorhandenen Dokumenten zu stellen

Sei höflich und hilfsbereit.`;
  }

  // Detect domain from documents
  const firstChunk = ragContext.relevantChunks[0];
  const documentName = firstChunk?.documentName || '';
  const documentContent = ragContext.contextText.substring(0, 2000);

  const domain = detectDomain(documentName, documentContent);

  logger.debug('Domain detected for prompt', { domain, documentName });

  // Get domain-specific system prompt
  const domainPrompt = getSystemPrompt({
    domain,
    language: 'de' // Could be detected from content or user settings
  });

  // Combine domain prompt with context
  return `${domainPrompt}

---

RELEVANTER KONTEXT AUS DEN DOKUMENTEN:

${ragContext.contextText}

---

Beantworte nun die Frage des Users basierend auf diesem Kontext. Wenn der Kontext keine ausreichenden Informationen enthält, sei ehrlich darüber.`;
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
