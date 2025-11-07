/**
 * Chat Types - Shared between Frontend and Backend
 */

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

export interface IMessage {
  _id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: IMessageSource[];
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    model?: string;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface IMessageSource {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  similarity: number;
  pageNumber?: number;
}

export interface IConversation {
  _id: string;
  userId: string;
  documentIds: string[];
  title: string;
  status: ConversationStatus;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatRequest {
  conversationId?: string;
  documentIds: string[];
  message: string;
  useContext?: boolean;
}

export interface IChatResponse {
  conversationId: string;
  message: IMessage;
  sources: IMessageSource[];
  questionsRemaining: number;
}

export interface IConversationCreate {
  userId: string;
  documentIds: string[];
  title?: string;
}

export interface IConversationListQuery {
  userId: string;
  status?: ConversationStatus;
  limit?: number;
  offset?: number;
}
