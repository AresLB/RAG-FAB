import { google } from 'googleapis';
import { logger } from '../../utils/logger';
import { IncomingEmail } from '../agents/email-agent';

const gmail = google.gmail('v1');

export interface GmailAuthConfig {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Fetch unread emails from Gmail
 */
export async function fetchGmailEmails(
  authConfig: GmailAuthConfig,
  maxResults: number = 10
): Promise<IncomingEmail[]> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: authConfig.accessToken,
      refresh_token: authConfig.refreshToken
    });

    // Get unread messages
    const messagesRes = await gmail.users.messages.list({
      auth,
      userId: 'me',
      q: 'is:unread',
      maxResults
    });

    const messages = messagesRes.data.messages || [];
    const emails: IncomingEmail[] = [];

    // Fetch full message details
    for (const message of messages) {
      if (!message.id) continue;

      const msgDetail = await gmail.users.messages.get({
        auth,
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const headers = msgDetail.data.payload?.headers || [];
      const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';
      const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
      const date = headers.find((h) => h.name?.toLowerCase() === 'date')?.value;

      // Extract body
      let body = '';
      const parts = msgDetail.data.payload?.parts || [];
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }

      // Fallback to payload body
      if (!body && msgDetail.data.payload?.body?.data) {
        body = Buffer.from(msgDetail.data.payload.body.data, 'base64').toString('utf-8');
      }

      emails.push({
        id: message.id,
        from,
        subject,
        body,
        receivedAt: date ? new Date(date) : new Date(),
        threadId: message.threadId
      });
    }

    logger.info('Fetched Gmail emails', { count: emails.length });
    return emails;
  } catch (error: any) {
    logger.error('Failed to fetch Gmail emails', { error: error.message });
    throw new Error(`Gmail fetch failed: ${error.message}`);
  }
}

/**
 * Send email draft via Gmail
 */
export async function sendGmailDraft(
  authConfig: GmailAuthConfig,
  to: string,
  subject: string,
  body: string,
  inReplyTo?: string
): Promise<string> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: authConfig.accessToken,
      refresh_token: authConfig.refreshToken
    });

    // Create RFC2822 formatted message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      inReplyTo ? `In-Reply-To: ${inReplyTo}` : '',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ]
      .filter(Boolean)
      .join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      auth,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: inReplyTo
      }
    });

    logger.info('Sent Gmail email', { messageId: response.data.id });
    return response.data.id || '';
  } catch (error: any) {
    logger.error('Failed to send Gmail email', { error: error.message });
    throw new Error(`Gmail send failed: ${error.message}`);
  }
}

/**
 * Create draft in Gmail (user can review before sending)
 */
export async function createGmailDraft(
  authConfig: GmailAuthConfig,
  to: string,
  subject: string,
  body: string,
  inReplyTo?: string
): Promise<string> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: authConfig.accessToken,
      refresh_token: authConfig.refreshToken
    });

    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      inReplyTo ? `In-Reply-To: ${inReplyTo}` : '',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body
    ]
      .filter(Boolean)
      .join('\n');

    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await gmail.users.drafts.create({
      auth,
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: inReplyTo
        }
      }
    });

    logger.info('Created Gmail draft', { draftId: response.data.id });
    return response.data.id || '';
  } catch (error: any) {
    logger.error('Failed to create Gmail draft', { error: error.message });
    throw new Error(`Gmail draft creation failed: ${error.message}`);
  }
}
