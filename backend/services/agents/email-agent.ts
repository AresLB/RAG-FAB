import { logger } from '../../utils/logger';
import { performRAGQuery } from '../rag/rag-service';
import { generateChatCompletion } from '../chat/chat-service';

export interface IncomingEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  threadId?: string;
}

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
  references?: string;
  confidence: number; // 0-1: How confident the AI is about the draft
  sources: Array<{
    documentName: string;
    excerpt: string;
    relevance: number;
  }>;
  warnings?: string[]; // e.g., "No relevant documents found", "Low confidence"
}

export interface EmailIntent {
  questions: string[];
  actionItems: string[];
  sentiment: 'neutral' | 'urgent' | 'friendly' | 'formal';
  requiresAttachments: boolean;
  suggestedPriority: 'low' | 'medium' | 'high';
}

/**
 * Extract intent and questions from incoming email
 */
export async function extractEmailIntent(email: IncomingEmail): Promise<EmailIntent> {
  logger.info('Extracting email intent', {
    from: email.from,
    subject: email.subject
  });

  try {
    // Use GPT to analyze the email
    const analysisPrompt = `Analysiere diese Email und extrahiere:
1. Alle Fragen, die beantwortet werden sollen
2. Action Items / Anfragen
3. Sentiment (neutral/urgent/friendly/formal)
4. Ob Anhänge benötigt werden
5. Priorität (low/medium/high)

Email:
Von: ${email.from}
Betreff: ${email.subject}
---
${email.body}
---

Antworte im JSON-Format:
{
  "questions": ["Frage 1", "Frage 2"],
  "actionItems": ["Action 1"],
  "sentiment": "neutral",
  "requiresAttachments": false,
  "suggestedPriority": "medium"
}`;

    const response = await generateChatCompletion({
      query: analysisPrompt,
      userId: 'system',
      model: 'gpt-3.5-turbo',
      temperature: 0.3
    });

    // Parse JSON from response
    const jsonMatch = response.answer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const intent = JSON.parse(jsonMatch[0]);
      logger.info('Email intent extracted', intent);
      return intent;
    }

    // Fallback
    return {
      questions: [],
      actionItems: [],
      sentiment: 'neutral',
      requiresAttachments: false,
      suggestedPriority: 'medium'
    };
  } catch (error: any) {
    logger.error('Failed to extract email intent', { error: error.message });

    // Fallback: Extract questions manually
    const questions = extractQuestionsFromText(email.body);

    return {
      questions,
      actionItems: [],
      sentiment: 'neutral',
      requiresAttachments: false,
      suggestedPriority: 'medium'
    };
  }
}

/**
 * Simple regex-based question extraction (fallback)
 */
function extractQuestionsFromText(text: string): string[] {
  const questionPattern = /([^.!?]*\?)/g;
  const matches = text.match(questionPattern) || [];
  return matches.map((q) => q.trim()).filter((q) => q.length > 10);
}

/**
 * Generate email draft using RAG
 */
export async function generateEmailDraft(
  email: IncomingEmail,
  userId: string,
  documentIds?: string[]
): Promise<EmailDraft> {
  logger.info('Generating email draft', {
    userId,
    emailId: email.id,
    from: email.from
  });

  try {
    // Step 1: Extract intent
    const intent = await extractEmailIntent(email);

    // Step 2: Combine all questions into one query
    const combinedQuery =
      intent.questions.length > 0
        ? intent.questions.join('\n')
        : `Beantworte diese Email: ${email.body.substring(0, 500)}`;

    // Step 3: Perform RAG query
    const ragContext = await performRAGQuery({
      query: combinedQuery,
      userId,
      documentIds,
      topK: 5,
      minScore: 0.6
    });

    // Calculate confidence based on RAG results
    const confidence = calculateConfidence(ragContext.relevantChunks);

    // Step 4: Generate draft with GPT
    const draftPrompt = `Du bist ein professioneller Email-Assistent.

EINGEHENDE EMAIL:
Von: ${email.from}
Betreff: ${email.subject}
---
${email.body}
---

RELEVANTE INFORMATIONEN AUS DOKUMENTEN:
${ragContext.contextText || 'Keine relevanten Dokumente gefunden.'}

---

AUFGABE:
Erstelle einen höflichen, professionellen Email-Entwurf als Antwort.

WICHTIG:
1. Beantworte alle Fragen basierend auf den Dokumenten
2. Wenn Informationen fehlen, sage das höflich
3. Nutze einen passenden Ton (${intent.sentiment})
4. Zitiere Quellen wenn möglich
5. Beginne mit "Sehr geehrte/r..." oder passendem Greeting
6. Schließe mit "Mit freundlichen Grüßen" ab
7. Keine Signatur (das macht der User)

Schreibe NUR den Email-Text, keine Erklärungen.`;

    const draftResponse = await generateChatCompletion({
      query: draftPrompt,
      userId,
      documentIds,
      model: 'gpt-4', // Use GPT-4 for better email quality
      temperature: 0.7
    });

    // Extract sources
    const sources = ragContext.relevantChunks.map((chunk) => ({
      documentName: chunk.documentName,
      excerpt: chunk.content.substring(0, 200) + '...',
      relevance: chunk.score
    }));

    // Generate warnings
    const warnings: string[] = [];
    if (ragContext.relevantChunks.length === 0) {
      warnings.push('Keine relevanten Dokumente gefunden. Antwort basiert auf allgemeinem Wissen.');
    }
    if (confidence < 0.5) {
      warnings.push('Niedrige Konfidenz. Bitte Email sorgfältig prüfen.');
    }
    if (intent.requiresAttachments) {
      warnings.push('Email erwartet möglicherweise Anhänge.');
    }

    const draft: EmailDraft = {
      to: email.from,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: draftResponse.answer,
      inReplyTo: email.id,
      confidence,
      sources,
      warnings: warnings.length > 0 ? warnings : undefined
    };

    logger.info('Email draft generated', {
      confidence,
      sourcesFound: sources.length,
      warnings: warnings.length
    });

    return draft;
  } catch (error: any) {
    logger.error('Failed to generate email draft', { error: error.message });
    throw new Error(`Failed to generate email draft: ${error.message}`);
  }
}

/**
 * Calculate confidence score based on RAG results
 */
function calculateConfidence(chunks: any[]): number {
  if (chunks.length === 0) return 0.2;

  const avgScore = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length;

  // Boost confidence if we have multiple relevant chunks
  const countBoost = Math.min(chunks.length / 5, 0.2);

  return Math.min(avgScore + countBoost, 1.0);
}

/**
 * Batch process multiple emails
 */
export async function batchProcessEmails(
  emails: IncomingEmail[],
  userId: string,
  documentIds?: string[]
): Promise<EmailDraft[]> {
  logger.info('Batch processing emails', {
    count: emails.length,
    userId
  });

  const drafts: EmailDraft[] = [];

  for (const email of emails) {
    try {
      const draft = await generateEmailDraft(email, userId, documentIds);
      drafts.push(draft);
    } catch (error) {
      logger.error('Failed to process email in batch', {
        emailId: email.id,
        error
      });
    }
  }

  return drafts;
}
