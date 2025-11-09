import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { logger } from '../../utils/logger';
import { IncomingEmail } from '../agents/email-agent';

export interface OutlookAuthConfig {
  accessToken: string;
}

/**
 * Create Microsoft Graph client
 */
function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
}

/**
 * Fetch unread emails from Outlook
 */
export async function fetchOutlookEmails(
  authConfig: OutlookAuthConfig,
  maxResults: number = 10
): Promise<IncomingEmail[]> {
  try {
    const client = createGraphClient(authConfig.accessToken);

    // Get unread messages
    const response = await client
      .api('/me/messages')
      .filter('isRead eq false')
      .top(maxResults)
      .select('id,subject,from,bodyPreview,body,receivedDateTime,conversationId')
      .get();

    const messages = response.value || [];
    const emails: IncomingEmail[] = messages.map((msg: any) => ({
      id: msg.id,
      from: msg.from?.emailAddress?.address || '',
      subject: msg.subject || '',
      body: msg.body?.content || msg.bodyPreview || '',
      receivedAt: new Date(msg.receivedDateTime),
      threadId: msg.conversationId
    }));

    logger.info('Fetched Outlook emails', { count: emails.length });
    return emails;
  } catch (error: any) {
    logger.error('Failed to fetch Outlook emails', { error: error.message });
    throw new Error(`Outlook fetch failed: ${error.message}`);
  }
}

/**
 * Send email via Outlook
 */
export async function sendOutlookEmail(
  authConfig: OutlookAuthConfig,
  to: string,
  subject: string,
  body: string,
  inReplyTo?: string
): Promise<string> {
  try {
    const client = createGraphClient(authConfig.accessToken);

    const message = {
      subject,
      body: {
        contentType: 'Text',
        content: body
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    };

    // If replying, use reply endpoint
    if (inReplyTo) {
      await client.api(`/me/messages/${inReplyTo}/reply`).post({ message, comment: body });

      logger.info('Sent Outlook reply', { inReplyTo });
      return inReplyTo;
    } else {
      // Send new message
      const response = await client.api('/me/sendMail').post({ message });

      logger.info('Sent Outlook email');
      return 'sent';
    }
  } catch (error: any) {
    logger.error('Failed to send Outlook email', { error: error.message });
    throw new Error(`Outlook send failed: ${error.message}`);
  }
}

/**
 * Create draft in Outlook
 */
export async function createOutlookDraft(
  authConfig: OutlookAuthConfig,
  to: string,
  subject: string,
  body: string
): Promise<string> {
  try {
    const client = createGraphClient(authConfig.accessToken);

    const draft = {
      subject,
      body: {
        contentType: 'Text',
        content: body
      },
      toRecipients: [
        {
          emailAddress: {
            address: to
          }
        }
      ]
    };

    const response = await client.api('/me/messages').post(draft);

    logger.info('Created Outlook draft', { draftId: response.id });
    return response.id;
  } catch (error: any) {
    logger.error('Failed to create Outlook draft', { error: error.message });
    throw new Error(`Outlook draft creation failed: ${error.message}`);
  }
}
