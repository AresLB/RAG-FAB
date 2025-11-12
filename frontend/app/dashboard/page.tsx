'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    // In a real app, you would fetch user data from API
    // For now, we'll just show the provider from localStorage
    const authProvider = localStorage.getItem('authProvider');
    setProvider(authProvider || '');
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Willkommen bei Responobis</h1>
        <p className="mt-2 text-slate-600">
          Ihre KI-gestützte Email-Lösung für Immobilienmakler
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Link
          href="/dashboard/documents"
          className="block rounded-lg border-2 border-slate-200 bg-white p-6 hover:border-blue-600 hover:shadow-lg transition-all"
        >
          <div className="mb-3 text-4xl">📄</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Dokumente hochladen
          </h3>
          <p className="text-sm text-slate-600">
            Laden Sie Expose, Verträge und FAQs hoch
          </p>
        </Link>

        <Link
          href="/dashboard/chat"
          className="block rounded-lg border-2 border-slate-200 bg-white p-6 hover:border-blue-600 hover:shadow-lg transition-all"
        >
          <div className="mb-3 text-4xl">💬</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Chat starten
          </h3>
          <p className="text-sm text-slate-600">
            Stellen Sie Fragen zu Ihren Dokumenten
          </p>
        </Link>

        <Link
          href="/dashboard/email"
          className="block rounded-lg border-2 border-slate-200 bg-white p-6 hover:border-blue-600 hover:shadow-lg transition-all"
        >
          <div className="mb-3 text-4xl">📧</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Email-Agent
          </h3>
          <p className="text-sm text-slate-600">
            Automatische Email-Antworten generieren
          </p>
        </Link>
      </div>

      {/* Getting Started Guide */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Erste Schritte
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Dokumente hochladen
              </h3>
              <p className="text-sm text-slate-600">
                Laden Sie Ihre wichtigsten Dokumente hoch: Objekt-Expose, Standard-Mietverträge, FAQ-Listen, Objektbeschreibungen. Die KI analysiert diese und nutzt sie für Antworten.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Chat testen
              </h3>
              <p className="text-sm text-slate-600">
                Probieren Sie den Chat aus und stellen Sie Fragen zu Ihren hochgeladenen Dokumenten. Die KI antwortet basierend auf dem Inhalt Ihrer Dateien.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Email-Agent aktivieren
              </h3>
              <p className="text-sm text-slate-600">
                Verbinden Sie {provider === 'gmail' ? 'Ihr Gmail-Konto' : provider === 'outlook' ? 'Ihr Outlook-Konto' : 'Gmail oder Outlook'} und lassen Sie den Agent automatisch Antwort-Entwürfe für eingehende Anfragen erstellen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Tipp: Qualität der Dokumente
          </h3>
          <p className="text-sm text-blue-800">
            Je detaillierter und aktueller Ihre hochgeladenen Dokumente sind, desto präziser werden die KI-Antworten. Aktualisieren Sie regelmäßig Ihre Expose und FAQs.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🎯 Perfekt für Makler
          </h3>
          <p className="text-sm text-green-800">
            Responobis ist speziell für Immobilienmakler entwickelt. Die KI versteht Fachbegriffe wie "Energieausweis", "Provision", "Besichtigungstermin" und vieles mehr.
          </p>
        </div>
      </div>
    </div>
  );
}
