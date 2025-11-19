'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface EmailListItem {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  isUnread: boolean;
  provider: 'gmail' | 'outlook';
}

interface EmailDetail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  threadId?: string;
}

interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  confidence: number;
  sources: Array<{
    documentName: string;
    excerpt: string;
    relevance: number;
  }>;
  warnings?: string[];
}

interface EmailFilter {
  id: string;
  name: string;
  count?: number;
  type?: string;
}

export default function EmailPage() {
  const [emails, setEmails] = useState<EmailListItem[]>([]);
  const [filters, setFilters] = useState<EmailFilter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [selectedEmailProvider, setSelectedEmailProvider] = useState<'gmail' | 'outlook' | null>(null);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [provider, setProvider] = useState<'gmail' | 'outlook' | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [error, setError] = useState('');
  const [showFilterSetup, setShowFilterSetup] = useState(false);

  // Detect provider on mount
  useEffect(() => {
    detectProvider();
  }, []);

  // Load filters when provider is detected
  useEffect(() => {
    if (provider) {
      loadFilters();
    }
  }, [provider]);

  const detectProvider = async () => {
    try {
      const authProvider = localStorage.getItem('authProvider');
      if (authProvider === 'gmail' || authProvider === 'outlook') {
        setProvider(authProvider);
      }
    } catch (err) {
      console.error('Failed to detect provider:', err);
    }
  };

  const loadFilters = async () => {
    try {
      setIsLoadingFilters(true);
      setError('');

      const response = await api.get('/emails/filters', {
        params: { provider }
      });

      const data = response.data.data;
      setFilters(data.filters);
      setProvider(data.provider);
    } catch (err: any) {
      console.error('Failed to load filters:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Filter');
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const loadEmails = async (filterName?: string) => {
    try {
      setIsLoadingEmails(true);
      setError('');
      setSelectedEmail(null);

      const params: any = {
        maxResults: 50
      };

      if (filterName) {
        params.filterName = filterName;
      }

      const response = await api.get('/emails', { params });

      const fetchedEmails = response.data.data.map((email: any) => ({
        ...email,
        date: new Date(email.date).toISOString()
      }));

      setEmails(fetchedEmails);

      if (fetchedEmails.length === 0 && filterName) {
        setError(`Keine Emails im ${provider === 'gmail' ? 'Label' : 'Ordner'} "${filterName}" gefunden.`);
      }
    } catch (err: any) {
      console.error('Failed to load emails:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Emails');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadEmailDetail = async (email: EmailListItem) => {
    try {
      setIsLoadingDetail(true);
      setError('');
      setDraft(null); // Reset draft when selecting new email

      const response = await api.get(`/emails/${email.id}`, {
        params: { provider: email.provider }
      });

      setSelectedEmail(response.data.data);
      setSelectedEmailProvider(email.provider);
    } catch (err: any) {
      console.error('Failed to load email detail:', err);
      setError(err.response?.data?.message || 'Fehler beim Laden der Email-Details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const generateDraftForEmail = async () => {
    if (!selectedEmail || !selectedEmailProvider) return;

    try {
      setIsGeneratingDraft(true);
      setError('');

      const response = await api.post(`/emails/${selectedEmail.id}/generate-draft`, {
        provider: selectedEmailProvider
      });

      setDraft(response.data.data);
    } catch (err: any) {
      console.error('Failed to generate draft:', err);
      setError(err.response?.data?.message || 'Fehler beim Generieren des Entwurfs');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const copyDraftToClipboard = () => {
    if (draft) {
      navigator.clipboard.writeText(draft.body);
      alert('Entwurf wurde in die Zwischenablage kopiert!');
    }
  };

  const handleFilterSelect = (filterName: string) => {
    setSelectedFilter(filterName);
    loadEmails(filterName);
    setShowFilterSetup(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Gerade eben';
    } else if (diffHours < 24) {
      return `vor ${diffHours} Std`;
    } else if (diffDays < 7) {
      return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
    }
  };

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Kein Email-Provider verbunden
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Verbinden Sie Ihr Gmail- oder Outlook-Konto, um Emails zu verwalten und Antworten zu generieren.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Jetzt verbinden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Emails</h1>
        <p className="text-slate-600">
          Verwalten Sie Ihre {provider === 'gmail' ? 'Gmail' : 'Outlook'} Emails und generieren Sie AI-Antworten
        </p>
      </div>

      {/* Filter Setup Card */}
      {(!selectedFilter || showFilterSetup) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Email-Filter einrichten
              </h3>
              <p className="text-sm text-slate-600">
                Wählen Sie ein {provider === 'gmail' ? 'Label' : 'Ordner'}, um nur bestimmte Emails zu verarbeiten
              </p>
            </div>
            {selectedFilter && (
              <button
                onClick={() => setShowFilterSetup(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {isLoadingFilters ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filters.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
              <p className="text-slate-600 mb-4">
                Keine {provider === 'gmail' ? 'Labels' : 'Ordner'} gefunden
              </p>
              <p className="text-sm text-slate-500">
                Erstellen Sie ein {provider === 'gmail' ? 'Label' : 'Ordner'} in {provider === 'gmail' ? 'Gmail' : 'Outlook'} und laden Sie diese Seite neu
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterSelect(filter.name)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    selectedFilter === filter.name
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900">{filter.name}</span>
                    {filter.count !== undefined && (
                      <span className="text-xs text-slate-500">{filter.count} ungelesen</span>
                    )}
                  </div>
                  {filter.type && (
                    <span className="text-xs text-slate-500">{filter.type}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Selected Filter Bar */}
      {selectedFilter && !showFilterSetup && (
        <div className="mb-6 flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">Aktiver Filter</p>
              <p className="font-semibold text-slate-900">{selectedFilter}</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilterSetup(true)}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Filter ändern
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      {selectedFilter && !showFilterSetup && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Email List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Posteingang {emails.length > 0 && `(${emails.length})`}
              </h2>
              <button
                onClick={() => loadEmails(selectedFilter)}
                disabled={isLoadingEmails}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="Aktualisieren"
              >
                <svg className={`w-5 h-5 text-slate-600 ${isLoadingEmails ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-[calc(100vh-300px)] overflow-y-auto">
              {isLoadingEmails ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-sm text-slate-600">Emails werden geladen...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">Keine Emails</p>
                  <p className="text-sm text-slate-600">
                    Verschieben Sie Emails in das Label &quot;{selectedFilter}&quot;
                  </p>
                </div>
              ) : (
                emails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => loadEmailDetail(email)}
                    className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="font-medium text-slate-900 truncate flex-1">
                        {email.from.replace(/<.*>/g, '').trim() || email.from}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {email.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                        <span className="text-xs text-slate-500">
                          {formatDate(email.date)}
                        </span>
                      </div>
                    </div>
                    <p className="font-medium text-slate-700 text-sm mb-1 truncate">
                      {email.subject || '(Kein Betreff)'}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {email.snippet}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Email Detail */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Email-Details</h2>
            </div>

            {isLoadingDetail ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-sm text-slate-600">Email wird geladen...</p>
              </div>
            ) : !selectedEmail ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-900 mb-1">Keine Email ausgewählt</p>
                <p className="text-sm text-slate-600">
                  Wählen Sie eine Email aus der Liste
                </p>
              </div>
            ) : (
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {selectedEmail.subject || '(Kein Betreff)'}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {selectedEmail.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{selectedEmail.from}</p>
                      <p className="text-slate-600">
                        {new Date(selectedEmail.receivedAt).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate max-w-none">
                    <div className="whitespace-pre-wrap text-slate-700">
                      {selectedEmail.body}
                    </div>
                  </div>

                  {/* Draft Generator */}
                  {!draft && (
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <button
                        onClick={generateDraftForEmail}
                        disabled={isGeneratingDraft}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingDraft ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            AI generiert Antwort...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Antwort-Entwurf generieren
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Generated Draft */}
                  {draft && (
                    <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">AI-Generierter Entwurf</h4>
                        <button
                          onClick={() => setDraft(null)}
                          className="text-sm text-slate-600 hover:text-slate-900"
                        >
                          Neu generieren
                        </button>
                      </div>

                      {/* Confidence Score */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Confidence Score
                          </span>
                          <span className={`text-sm font-bold ${
                            draft.confidence >= 0.7 ? 'text-green-600' :
                            draft.confidence >= 0.5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {Math.round(draft.confidence * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              draft.confidence >= 0.7 ? 'bg-green-600' :
                              draft.confidence >= 0.5 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                            style={{ width: `${draft.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Warnings */}
                      {draft.warnings && draft.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900 mb-1">Hinweise</p>
                              <ul className="text-sm text-yellow-800 space-y-1">
                                {draft.warnings.map((warning, idx) => (
                                  <li key={idx}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Draft Body */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">
                            An
                          </label>
                          <p className="text-slate-900">{draft.to}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase block mb-1">
                            Betreff
                          </label>
                          <p className="text-slate-900">{draft.subject}</p>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 uppercase block mb-2">
                            Nachricht
                          </label>
                          <div className="bg-white border border-slate-200 rounded-lg p-4 whitespace-pre-wrap text-slate-900">
                            {draft.body}
                          </div>
                        </div>
                      </div>

                      {/* Sources Used */}
                      {draft.sources && draft.sources.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                Verwendete Dokumente ({draft.sources.length})
                              </p>
                              <div className="space-y-2">
                                {draft.sources.map((source, idx) => (
                                  <div key={idx} className="text-sm">
                                    <p className="font-medium text-blue-900">{source.documentName}</p>
                                    <p className="text-xs text-blue-700 italic mt-1">
                                      &quot;{source.excerpt}&quot;
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                      Relevanz: {Math.round(source.relevance * 100)}%
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={copyDraftToClipboard}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Kopieren
                        </button>
                        <button
                          onClick={() => alert('Email-Versand-Funktion kommt bald!')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Als Entwurf speichern
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
