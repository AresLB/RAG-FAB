'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    documentName: string;
    excerpt: string;
    relevance: number;
  }>;
}

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data.data.conversations || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      const msgs = response.data.data.messages || [];

      setMessages(
        msgs.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          sources: msg.sources,
        }))
      );
      setCurrentConversation(conversationId);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Error loading conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/chat/ask', {
        question: input,
        conversationId: currentConversation,
      });

      const data = response.data.data;

      if (!currentConversation && data.conversationId) {
        setCurrentConversation(data.conversationId);
        fetchConversations();
      }

      const assistantMessage: Message = {
        id: data.messageId || Date.now().toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.message || 'Error sending message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex gap-6 h-full">
        {/* Sidebar - Conversation History */}
        <aside className="w-64 flex-shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 overflow-y-auto">
          <button
            onClick={startNewConversation}
            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-violet-600 hover:to-cyan-600 transition-all mb-4"
          >
            + New Chat
          </button>

          <h3 className="text-sm font-semibold text-zinc-300 mb-3">
            Chat History
          </h3>

          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all ${
                  currentConversation === conv._id
                    ? 'bg-gradient-to-r from-violet-500/10 to-cyan-500/10 text-violet-400 border border-violet-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <div className="truncate">{conv.title}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(conv.updatedAt).toLocaleDateString('en-US')}
                </div>
              </button>
            ))}

            {conversations.length === 0 && (
              <p className="text-xs text-zinc-500 text-center py-4">
                No conversations yet
              </p>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100">
              RAG Chat: Ask about your documents
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              AI responds based on your uploaded documents
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 mb-4">
                  <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                  Start a conversation
                </h3>
                <p className="text-zinc-400 max-w-md mx-auto mb-6">
                  Ask questions about your uploaded documents. The AI uses RAG technology to provide precise answers based on your content.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-zinc-300">Example questions:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setInput('What information is in my documents about pricing?')}
                      className="text-sm px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800/50 text-zinc-300 transition-colors"
                    >
                      What about pricing?
                    </button>
                    <button
                      onClick={() => setInput('What products are documented?')}
                      className="text-sm px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800/50 text-zinc-300 transition-colors"
                    >
                      What products documented?
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                        AI
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                          : 'bg-zinc-800/50 text-zinc-100 border border-zinc-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <p className="text-xs font-semibold text-zinc-400 mb-2">
                            Sources:
                          </p>
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="text-xs text-zinc-400 mb-2">
                              <span className="font-medium text-zinc-300">{source.documentName}</span>
                              <p className="mt-1 italic text-zinc-500">&quot;{source.excerpt.substring(0, 100)}...&quot;</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-700 text-white flex items-center justify-center font-bold text-sm">
                        You
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                      AI
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 py-3 bg-red-950/50 border-t border-red-800/50">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 font-semibold text-white hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
