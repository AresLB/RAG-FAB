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
      setError('Fehler beim Laden der Konversation');
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

      // If no conversationId yet, set it
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
      setError(err.response?.data?.message || 'Fehler beim Senden der Nachricht');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
      <div className="flex gap-6 h-full">
        {/* Sidebar - Conversation History */}
        <aside className="w-64 flex-shrink-0 bg-white rounded-lg border border-slate-200 p-4 overflow-y-auto">
          <button
            onClick={startNewConversation}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mb-4"
          >
            + Neuer Chat
          </button>

          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Chat-Verlauf
          </h3>

          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  currentConversation === conv._id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="truncate">{conv.title}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(conv.updatedAt).toLocaleDateString('de-DE')}
                </div>
              </button>
            ))}

            {conversations.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                Noch keine Gespräche
              </p>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              RAG-Chat: Fragen Sie zu Ihren Dokumenten
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Die KI antwortet basierend auf Ihren hochgeladenen Dokumenten
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Starten Sie eine Konversation
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Stellen Sie Fragen zu Ihren hochgeladenen Dokumenten. Die KI nutzt RAG-Technologie, um präzise Antworten basierend auf Ihrem Content zu geben.
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium text-slate-700">Beispiel-Fragen:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setInput('Was steht in meinen Dokumenten über Nebenkosten?')}
                      className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      Was steht über Nebenkosten?
                    </button>
                    <button
                      onClick={() => setInput('Welche Objekte habe ich dokumentiert?')}
                      className="text-sm px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      Welche Objekte dokumentiert?
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
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                        AI
                      </div>
                    )}

                    <div
                      className={`max-w-2xl rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-300">
                          <p className="text-xs font-semibold text-slate-600 mb-2">
                            Quellen:
                          </p>
                          {message.sources.map((source, idx) => (
                            <div key={idx} className="text-xs text-slate-600 mb-2">
                              <span className="font-medium">{source.documentName}</span>
                              <p className="mt-1 italic">&quot;{source.excerpt.substring(0, 100)}...&quot;</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">
                        Sie
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      AI
                    </div>
                    <div className="bg-slate-100 rounded-lg px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Stellen Sie eine Frage zu Ihren Dokumenten..."
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Senden
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
