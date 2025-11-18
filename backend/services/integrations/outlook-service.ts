import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import 'isomorphic-fetch';
import { logger } from '../../utils/logger';
import { IncomingEmail } from '../agents/email-agent';
import { OAuthToken } from '../../models/OAuthToken.model';

export interface OutlookAuthConfig {
  accessToken: string;
}

export interface OutlookFolder {
  id: string;
  displayName: string;
  totalItemCount: number;
  unreadItemCount: number;
}

export interface OutlookEmailListItem {
  id: string;
  conversationId: string;
  subject: string;
  from: string;
  snippet: string;
  receivedDateTime: Date;
  isRead: boolean;
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

/**
 * Get user's OAuth tokens from database and refresh if needed
 */
async function getOutlookClient(userId: string): Promise<Client> {
  const tokenDoc = await OAuthToken.findOne({ userId, provider: 'microsoft' }).select('+accessToken +refreshToken');

  if (!tokenDoc) {
    throw new Error('No Outlook OAuth token found. Please reconnect your Outlook account.');
  }

  // Check if token needs refresh
  if (tokenDoc.needsRefresh() && tokenDoc.refreshToken) {
    logger.info('Refreshing Outlook access token', { userId });

    const msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || '',
        authority: 'https://login.microsoftonline.com/common',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || ''
      }
    };

    const pca = new ConfidentialClientApplication(msalConfig);

    try {
      const tokenResponse = await pca.acquireTokenByRefreshToken({
        refreshToken: tokenDoc.refreshToken,
        scopes: tokenDoc.scope
      });

      if (tokenResponse) {
        // Update stored token
        await OAuthToken.updateOne(
          { _id: tokenDoc._id },
          {
            accessToken: tokenResponse.accessToken,
            expiresAt: tokenResponse.expiresOn || new Date(Date.now() + 3600 * 1000)
          }
        );

        logger.info('Outlook access token refreshed', { userId });
        return createGraphClient(tokenResponse.accessToken);
      }
    } catch (error: any) {
      logger.error('Failed to refresh Outlook token', { error: error.message, userId });
      throw new Error('Failed to refresh Outlook token. Please reconnect your account.');
    }
  }

  return createGraphClient(tokenDoc.accessToken);
}

/**
 * Get all mail folders from Outlook
 */
export async function getOutlookFolders(userId: string): Promise<OutlookFolder[]> {
  try {
    const client = await getOutlookClient(userId);

    const response = await client
      .api('/me/mailFolders')
      .select('id,displayName,totalItemCount,unreadItemCount')
      .get();

    const folders = response.value || [];

    return folders.map((folder: any) => ({
      id: folder.id,
      displayName: folder.displayName,
      totalItemCount: folder.totalItemCount || 0,
      unreadItemCount: folder.unreadItemCount || 0
    }));
  } catch (error: any) {
    logger.error('Failed to fetch Outlook folders', { error: error.message, userId });
    throw new Error(`Failed to fetch Outlook folders: ${error.message}`);
  }
}

/**
 * Find folder ID by name
 */
export async function findOutlookFolderByName(userId: string, folderName: string): Promise<string | null> {
  try {
    const folders = await getOutlookFolders(userId);
    const folder = folders.find(f => f.displayName.toLowerCase() === folderName.toLowerCase());
    return folder?.id || null;
  } catch (error: any) {
    logger.error('Failed to find Outlook folder', { error: error.message, userId, folderName });
    return null;
  }
}

/**
 * Get filtered emails from Outlook (with optional folder filter)
 */
export async function getFilteredOutlookEmails(
  userId: string,
  options?: {
    folderId?: string;
    maxResults?: number;
    includeUnreadOnly?: boolean;
  }
): Promise<OutlookEmailListItem[]> {
  try {
    const client = await getOutlookClient(userId);
    const { folderId, maxResults = 20, includeUnreadOnly = false } = options || {};

    // Build API endpoint
    const endpoint = folderId ? `/me/mailFolders/${folderId}/messages` : '/me/messages';

    let apiRequest = client
      .api(endpoint)
      .top(maxResults)
      .select('id,subject,from,bodyPreview,receivedDateTime,conversationId,isRead')
      .orderby('receivedDateTime DESC');

    // Add filter for unread if needed
    if (includeUnreadOnly) {
      apiRequest = apiRequest.filter('isRead eq false');
    }

    const response = await apiRequest.get();

    const messages = response.value || [];

    const emails: OutlookEmailListItem[] = messages.map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      subject: msg.subject || '(No subject)',
      from: msg.from?.emailAddress?.address || '',
      snippet: msg.bodyPreview || '',
      receivedDateTime: new Date(msg.receivedDateTime),
      isRead: msg.isRead || false
    }));

    logger.info('Fetched filtered Outlook emails', { count: emails.length, userId });
    return emails;
  } catch (error: any) {
    logger.error('Failed to fetch filtered Outlook emails', { error: error.message, userId });
    throw new Error(`Failed to fetch emails: ${error.message}`);
  }
}

/**
 * Get full email details by ID
 */
export async function getOutlookEmailById(userId: string, emailId: string): Promise<IncomingEmail> {
  try {
    const client = await getOutlookClient(userId);

    const message = await client
      .api(`/me/messages/${emailId}`)
      .select('id,subject,from,body,receivedDateTime,conversationId')
      .get();

    logger.info('Fetched Outlook email details', { emailId, userId });

    return {
      id: message.id,
      from: message.from?.emailAddress?.address || '',
      subject: message.subject || '',
      body: message.body?.content || '',
      receivedAt: new Date(message.receivedDateTime),
      threadId: message.conversationId
    };
  } catch (error: any) {
    logger.error('Failed to fetch Outlook email details', { error: error.message, userId, emailId });
    throw new Error(`Failed to fetch email details: ${error.message}`);
  }
}
