'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleGmailLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/oauth/gmail`;
  };

  const handleOutlookLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/oauth/outlook`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-slate-900">Responobis</h1>
          </Link>
          <p className="mt-2 text-slate-600">
            Melden Sie sich an mit Ihrem Email-Konto
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">
              {error === 'oauth_failed' && 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'}
              {error === 'no_email' && 'Keine Email-Adresse gefunden. Bitte versuchen Sie es erneut.'}
              {error === 'no_account' && 'Konto nicht gefunden. Bitte versuchen Sie es erneut.'}
            </p>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            {/* Gmail Login Button */}
            <button
              onClick={handleGmailLogin}
              className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"
                />
                <path
                  fill="#4A90E2"
                  d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"
                />
              </svg>
              Mit Gmail anmelden
            </button>

            {/* Outlook Login Button */}
            <button
              onClick={handleOutlookLogin}
              className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#0078D4"
                  d="M24 7.387v9.226c0 1.75-1.42 3.17-3.17 3.17h-2.53v-8.24h2.53c.35 0 .69-.06 1-.17V7.387c-.31-.11-.65-.17-1-.17h-2.53V3.83c0-.35-.06-.69-.17-1h2.7c1.75 0 3.17 1.42 3.17 3.17v1.387zm-6.7-4.557v4.557h-6.7V2.83c0-.35.06-.69.17-1h6.53c-.11.31-.17.65-.17 1zm-6.7 4.557v8.24H3.17c-1.75 0-3.17-1.42-3.17-3.17V7.387c0-.35.06-.69.17-1h10.43zm6.7 8.24v4.557c0 .35-.06.69-.17 1H3.17c.11-.31.17-.65.17-1v-4.557h13.96z"
                />
              </svg>
              Mit Outlook anmelden
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-4 text-sm text-slate-500">oder</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Email/Password Form (Optional - can be implemented later) */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Email & Passwort Anmeldung folgt in Kürze
            </p>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Mit der Anmeldung akzeptieren Sie unsere{' '}
          <a href="#" className="underline hover:text-slate-700">
            Nutzungsbedingungen
          </a>{' '}
          und{' '}
          <a href="#" className="underline hover:text-slate-700">
            Datenschutzrichtlinien
          </a>
        </p>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
