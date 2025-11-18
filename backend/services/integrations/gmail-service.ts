import { google } from 'googleapis';
import { logger } from '../../utils/logger';
import { IncomingEmail } from '../agents/email-agent';
import { OAuthToken } from '../../models/OAuthToken.model';

const gmail = google.gmail('v1');

export interface GmailAuthConfig {
  accessToken: string;
  refreshToken?: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: string;
}

export interface GmailEmailListItem {
  id: string;
  threadId: string;
  snippet: string;
  from: string;
  subject: string;
  date: Date;
  isUnread: boolean;
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
        threadId: message.threadId ?? undefined
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

/**
 * Get user's OAuth tokens from database and refresh if needed
 */
async function getGmailAuth(userId: string): Promise<google.auth.OAuth2Client> {
  const tokenDoc = await OAuthToken.findOne({ userId, provider: 'google' }).select('+accessToken +refreshToken');

  if (!tokenDoc) {
    throw new Error('No Gmail OAuth token found. Please reconnect your Gmail account.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken
  });

  // Check if token needs refresh
  if (tokenDoc.needsRefresh()) {
    logger.info('Refreshing Gmail access token', { userId });
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update stored token
    await OAuthToken.updateOne(
      { _id: tokenDoc._id },
      {
        accessToken: credentials.access_token!,
        expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000)
      }
    );

    logger.info('Gmail access token refreshed', { userId });
  }

  return oauth2Client;
}

/**
 * Get all Gmail labels for user
 */
export async function getGmailLabels(userId: string): Promise<GmailLabel[]> {
  try {
    const auth = await getGmailAuth(userId);

    const response = await gmail.users.labels.list({
      auth,
      userId: 'me'
    });

    const labels = response.data.labels || [];

    return labels.map(label => ({
      id: label.id!,
      name: label.name!,
      type: label.type!
    }));
  } catch (error: any) {
    logger.error('Failed to fetch Gmail labels', { error: error.message, userId });
    throw new Error(`Failed to fetch Gmail labels: ${error.message}`);
  }
}

/**
 * Find label ID by name
 */
export async function findGmailLabelByName(userId: string, labelName: string): Promise<string | null> {
  try {
    const labels = await getGmailLabels(userId);
    const label = labels.find(l => l.name.toLowerCase() === labelName.toLowerCase());
    return label?.id || null;
  } catch (error: any) {
    logger.error('Failed to find Gmail label', { error: error.message, userId, labelName });
    return null;
  }
}

/**
 * Get filtered emails from Gmail (with optional label filter)
 */
export async function getFilteredGmailEmails(
  userId: string,
  options?: {
    labelIds?: string[];
    maxResults?: number;
    includeUnreadOnly?: boolean;
  }
): Promise<GmailEmailListItem[]> {
  try {
    const auth = await getGmailAuth(userId);
    const { labelIds, maxResults = 20, includeUnreadOnly = false } = options || {};

    // Build query
    let q = '';
    if (includeUnreadOnly) {
      q = 'is:unread';
    }

    const response = await gmail.users.messages.list({
      auth,
      userId: 'me',
      labelIds: labelIds || undefined,
      q: q || undefined,
      maxResults
    });

    const messages = response.data.messages || [];
    const emails: GmailEmailListItem[] = [];

    // Fetch email headers (faster than full message)
    for (const message of messages) {
      if (!message.id) continue;

      const msgDetail = await gmail.users.messages.get({
        auth,
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });

      const headers = msgDetail.data.payload?.headers || [];
      const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';
      const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
      const dateStr = headers.find((h) => h.name?.toLowerCase() === 'date')?.value;

      const labelIds = msgDetail.data.labelIds || [];
      const isUnread = labelIds.includes('UNREAD');

      emails.push({
        id: message.id!,
        threadId: message.threadId!,
        snippet: msgDetail.data.snippet || '',
        from,
        subject,
        date: dateStr ? new Date(dateStr) : new Date(),
        isUnread
      });
    }

    logger.info('Fetched filtered Gmail emails', { count: emails.length, userId });
    return emails;
  } catch (error: any) {
    logger.error('Failed to fetch filtered Gmail emails', { error: error.message, userId });
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
}

/**
 * Get full email details by ID
 */
export async function getGmailEmailById(userId: string, emailId: string): Promise<IncomingEmail> {
  try {
    const auth = await getGmailAuth(userId);

    const msgDetail = await gmail.users.messages.get({
      auth,
      userId: 'me',
      id: emailId,
      format: 'full'
    });

    const headers = msgDetail.data.payload?.headers || [];
    const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '';
    const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '';
    const date = headers.find((h) => h.name?.toLowerCase() === 'date')?.value;

    // Extract body (text/plain preferred)
    let body = '';
    const parts = msgDetail.data.payload?.parts || [];

    // Try to find text/plain part
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        break;
      }
    }

    // Fallback to text/html or payload body
    if (!body) {
      for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }
    }

    // Fallback to main payload body
    if (!body && msgDetail.data.payload?.body?.data) {
      body = Buffer.from(msgDetail.data.payload.body.data, 'base64').toString('utf-8');
    }

    logger.info('Fetched Gmail email details', { emailId, userId });

    return {
      id: emailId,
      from,
      subject,
      body,
      receivedAt: date ? new Date(date) : new Date(),
      threadId: msgDetail.data.threadId ?? undefined
    };
  } catch (error: any) {
    logger.error('Failed to fetch Gmail email details', { error: error.message, userId, emailId });
    throw new Error(`Failed to fetch email details: ${error.message}`);
  }
}
