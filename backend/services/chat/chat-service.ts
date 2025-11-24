import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { performRAGQuery, RAGQueryInput, RAGContext } from '../rag/rag-service';
import { getSystemPrompt, detectDomain, detectLanguage, PromptDomain } from './prompts';

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
      minScore: 0.5
    };

    const ragContext = await performRAGQuery(ragInput);

    // Step 2: Build system prompt with RAG context (with language detection)
    const systemPrompt = buildSystemPrompt(ragContext, query);

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
 * Automatically detects language and domain from query and content
 */
const buildSystemPrompt = (ragContext: RAGContext, query: string): string => {
  // Detect language from query and document content
  const documentContent = ragContext.contextText.substring(0, 500);
  const language = detectLanguage(query, documentContent);

  logger.debug('Language detected for prompt', { language, query: query.substring(0, 50) });

  if (ragContext.relevantChunks.length === 0) {
    // No results - provide helpful message in detected language
    if (language === 'de') {
      return `Du bist ein hilfreicher KI-Assistent. Der User hat eine Frage gestellt, aber keine relevanten Informationen wurden in den Dokumenten gefunden.

Teile höflich mit, dass keine relevanten Informationen in den hochgeladenen Dokumenten gefunden wurden.
Schlage vor:
1. Dokumente hochzuladen, die Informationen zu diesem Thema enthalten
2. Die Frage umzuformulieren
3. Eine andere Frage zu den vorhandenen Dokumenten zu stellen

Sei höflich und hilfsbereit.`;
    } else {
      return `You are a helpful AI assistant. The user asked a question, but no relevant information was found in the documents.

Politely inform them that no relevant information was found in the uploaded documents.
Suggest:
1. Uploading documents that contain information on this topic
2. Rephrasing the question
3. Asking a different question about the existing documents

Be polite and helpful.`;
    }
  }

  // Detect domain from documents
  const firstChunk = ragContext.relevantChunks[0];
  const documentName = firstChunk?.documentName || '';

  const domain = detectDomain(documentName, documentContent);

  logger.debug('Domain and language detected for prompt', { domain, language, documentName });

  // Get domain-specific system prompt with detected language
  const domainPrompt = getSystemPrompt({
    domain,
    language
  });

  // Combine domain prompt with context (context separator in appropriate language)
  const contextHeader = language === 'de'
    ? 'RELEVANTER KONTEXT AUS DEN DOKUMENTEN:'
    : 'RELEVANT CONTEXT FROM DOCUMENTS:';
  const contextFooter = language === 'de'
    ? 'Beantworte nun die Frage des Users basierend auf diesem Kontext. Wenn der Kontext keine ausreichenden Informationen enthält, sei ehrlich darüber.'
    : 'Now answer the user\'s question based on this context. If the context does not contain sufficient information, be honest about it.';

  return `${domainPrompt}

---

${contextHeader}

${ragContext.contextText}

---

${contextFooter}`;
};

/**
 * Stream chat completion with RAG context
 * Streams response chunks in real-time for better UX
 */
export const streamChatCompletion = async (
  input: ChatCompletionInput,
  onChunk: (chunk: string) => void,
  onComplete?: () => void
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

  logger.info('Streaming chat completion', {
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
      minScore: 0.5
    };

    const ragContext = await performRAGQuery(ragInput);

    // Step 2: Build system prompt with RAG context (with language detection)
    const systemPrompt = buildSystemPrompt(ragContext, query);

    // Step 3: Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6),
      { role: 'user', content: query }
    ];

    logger.debug('Sending streaming request to OpenAI', {
      model,
      messageCount: messages.length,
      contextLength: ragContext.contextText.length
    });

    // Step 4: Call OpenAI Streaming Chat Completion
    const stream = await openai.chat.completions.create({
      model,
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      temperature,
      max_tokens: maxTokens,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stream: true
    });

    // Collect the full response
    let fullAnswer = '';
    let tokensUsed = 0;

    // Stream chunks to the callback
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullAnswer += content;
        onChunk(content);
      }

      // Track token usage from the finish reason
      if (chunk.choices[0]?.finish_reason) {
        // Note: Streaming doesn't provide exact token counts
        // We'll estimate or get it from the final chunk
        tokensUsed = Math.ceil(fullAnswer.length / 4); // Rough estimate
      }
    }

    const processingTime = Date.now() - startTime;

    // Call completion callback if provided
    if (onComplete) {
      onComplete();
    }

    logger.info('Streaming chat completion finished', {
      tokensUsed,
      processingTime,
      answerLength: fullAnswer.length,
      relevantChunks: ragContext.relevantChunks.length
    });

    return {
      answer: fullAnswer,
      ragContext,
      model,
      tokensUsed,
      processingTime
    };
  } catch (error: any) {
    logger.error('Streaming chat completion failed', {
      error: error.message,
      query: query.substring(0, 100)
    });
    throw new Error(`Streaming chat completion failed: ${error.message}`);
  }
};
