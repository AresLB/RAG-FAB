'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setTimeout(() => {
        router.push('/login?error=' + error);
      }, 2000);
      return;
    }

    if (!token || !refresh) {
      setStatus('error');
      setErrorMessage('Keine Authentifizierungs-Token erhalten.');
      setTimeout(() => {
        router.push('/login?error=no_tokens');
      }, 2000);
      return;
    }

    // Store tokens in localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refresh);

    if (provider) {
      localStorage.setItem('authProvider', provider);
    }

    setStatus('success');

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="mb-4">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Anmeldung läuft...
              </h2>
              <p className="text-slate-600">
                Bitte warten Sie einen Moment
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-4 text-green-600">
                <svg
                  className="inline-block h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Erfolgreich angemeldet!
              </h2>
              <p className="text-slate-600">
                Sie werden zum Dashboard weitergeleitet...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-4 text-red-600">
                <svg
                  className="inline-block h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Anmeldung fehlgeschlagen
              </h2>
              <p className="text-slate-600">
                {errorMessage}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
