'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
}

interface Draft {
  to: string;
  subject: string;
  body: string;
  confidence: number;
  sources?: Array<{
    documentName: string;
    excerpt: string;
    relevance: number;
  }>;
  warnings?: string[];
}

export default function EmailAgentPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<'gmail' | 'outlook'>('gmail');

  useEffect(() => {
    const authProvider = localStorage.getItem('authProvider');
    if (authProvider === 'gmail' || authProvider === 'outlook') {
      setProvider(authProvider);
    }
  }, []);

  const fetchEmails = async () => {
    try {
      setIsLoadingEmails(true);
      setError('');

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Nicht angemeldet');
        return;
      }

      const response = await api.post('/agents/email/fetch', {
        provider,
        accessToken,
        maxResults: 10,
      });

      const fetchedEmails = response.data.data.emails.map((email: any) => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        body: email.body,
        receivedAt: new Date(email.receivedAt),
      }));

      setEmails(fetchedEmails);
    } catch (err: any) {
      console.error('Failed to fetch emails:', err);
      setError(err.response?.data?.message || 'Fehler beim Abrufen der Emails');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const generateDraft = async (email: Email) => {
    try {
      setIsGeneratingDraft(true);
      setError('');
      setDraft(null);

      const response = await api.post('/agents/email/draft', {
        email: {
          from: email.from,
          subject: email.subject,
          body: email.body,
          receivedAt: email.receivedAt,
        },
      });

      setDraft(response.data.data);
    } catch (err: any) {
      console.error('Failed to generate draft:', err);
      setError(err.response?.data?.message || 'Fehler beim Erstellen des Entwurfs');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    setDraft(null);
    generateDraft(email);
  };

  const copyDraft = () => {
    if (draft) {
      navigator.clipboard.writeText(draft.body);
      alert('Entwurf in Zwischenablage kopiert!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Email-Agent</h1>
        <p className="text-slate-600">
          Holen Sie Emails ab und generieren Sie automatisch Antwort-Entwürfe basierend auf Ihren Dokumenten
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Email-Provider
            </h3>
            <p className="text-sm text-slate-600">
              Verbunden mit: {provider === 'gmail' ? 'Gmail' : 'Outlook'}
            </p>
          </div>
          <button
            onClick={fetchEmails}
            disabled={isLoadingEmails}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingEmails ? 'Lädt...' : 'Emails abrufen'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email List */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Ungelesene Emails ({emails.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="text-5xl mb-3">📬</div>
                <p>Keine ungelesenen Emails</p>
                <p className="text-sm mt-1">Klicken Sie auf &quot;Emails abrufen&quot;</p>
              </div>
            ) : (
              emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium text-slate-900 truncate">
                      {email.from}
                    </p>
                    <span className="text-xs text-slate-500">
                      {email.receivedAt.toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  <p className="font-medium text-slate-700 text-sm mb-1 truncate">
                    {email.subject}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {email.body.substring(0, 100)}...
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Draft Preview */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Generierter Entwurf
            </h2>
          </div>

          {isGeneratingDraft ? (
            <div className="p-8 text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
              <p className="text-slate-600">Entwurf wird generiert...</p>
            </div>
          ) : !draft ? (
            <div className="p-8 text-center text-slate-500">
              <div className="text-5xl mb-3">✍️</div>
              <p>Wählen Sie eine Email aus</p>
              <p className="text-sm mt-1">
                Die KI erstellt automatisch einen Antwort-Entwurf basierend auf Ihren Dokumenten
              </p>
            </div>
          ) : (
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {/* Confidence Score */}
              <div className="mb-4 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Konfidenz
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {Math.round(draft.confidence * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      draft.confidence >= 0.7
                        ? 'bg-green-600'
                        : draft.confidence >= 0.5
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${draft.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Warnings */}
              {draft.warnings && draft.warnings.length > 0 && (
                <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    ⚠️ Hinweise:
                  </p>
                  {draft.warnings.map((warning, idx) => (
                    <p key={idx} className="text-sm text-yellow-700">
                      • {warning}
                    </p>
                  ))}
                </div>
              )}

              {/* Email Fields */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    An
                  </label>
                  <p className="text-slate-900">{draft.to}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    Betreff
                  </label>
                  <p className="text-slate-900">{draft.subject}</p>
                </div>
              </div>

              {/* Body */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
                  Nachricht
                </label>
                <div className="rounded-lg bg-slate-50 p-4 whitespace-pre-wrap text-slate-900">
                  {draft.body}
                </div>
              </div>

              {/* Sources */}
              {draft.sources && draft.sources.length > 0 && (
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    📚 Verwendete Quellen:
                  </p>
                  {draft.sources.map((source, idx) => (
                    <div key={idx} className="text-sm text-blue-800 mb-2">
                      <span className="font-medium">{source.documentName}</span>
                      <p className="text-xs mt-1 italic text-blue-700">
                        &quot;{source.excerpt.substring(0, 100)}...&quot;
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={copyDraft}
                  className="flex-1 rounded-lg border-2 border-blue-600 bg-white px-4 py-2 font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Kopieren
                </button>
                <button
                  onClick={() => alert('Send-Funktion folgt in Kürze!')}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Senden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
