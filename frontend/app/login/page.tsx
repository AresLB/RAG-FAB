'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorDetails = searchParams.get('details');

  let parsedError = null;
  if (errorDetails) {
    try {
      parsedError = JSON.parse(decodeURIComponent(errorDetails));
    } catch (e) {
      console.error('Failed to parse error details:', e);
    }
  }

  const handleGmailLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/oauth/gmail`;
  };

  const handleOutlookLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/oauth/outlook`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
              Responobis
            </h1>
          </Link>
          <p className="mt-3 text-slate-600 dark:text-zinc-400">
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-950/50 border border-red-800/50 p-4">
            <p className="text-sm font-semibold text-red-400 mb-2">
              {error === 'oauth_failed' && 'Authentication failed'}
              {error === 'no_email' && 'No email address found'}
              {error === 'no_account' && 'Account not found'}
            </p>
            {parsedError && (
              <details className="mt-2">
                <summary className="text-xs text-red-400/80 cursor-pointer hover:text-red-400">
                  View technical details
                </summary>
                <div className="mt-2 p-3 bg-red-950/80 rounded border border-red-800/30 text-xs font-mono text-red-300 overflow-auto max-h-40">
                  <p><strong>Error:</strong> {parsedError.name}</p>
                  <p><strong>Message:</strong> {parsedError.message}</p>
                  {parsedError.stack && (
                    <div className="mt-2">
                      <strong>Stack:</strong>
                      <pre className="text-[10px] whitespace-pre-wrap mt-1">{parsedError.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Login Card */}
        <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-xl p-8">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500/5 to-cyan-500/5 blur-xl rounded-2xl"></div>

          <div className="space-y-4">
            {/* Gmail Login Button */}
            <button
              onClick={handleGmailLogin}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 px-6 py-3.5 font-semibold text-slate-900 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700/50 hover:border-slate-400 dark:hover:border-zinc-600 transition-all"
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
              Continue with Gmail
            </button>

            {/* Outlook Login Button */}
            <button
              onClick={handleOutlookLogin}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 px-6 py-3.5 font-semibold text-slate-900 dark:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-700/50 hover:border-slate-400 dark:hover:border-zinc-600 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#0078D4"
                  d="M24 7.387v9.226c0 1.75-1.42 3.17-3.17 3.17h-2.53v-8.24h2.53c.35 0 .69-.06 1-.17V7.387c-.31-.11-.65-.17-1-.17h-2.53V3.83c0-.35-.06-.69-.17-1h2.7c1.75 0 3.17 1.42 3.17 3.17v1.387zm-6.7-4.557v4.557h-6.7V2.83c0-.35.06-.69.17-1h6.53c-.11.31-.17.65-.17 1zm-6.7 4.557v8.24H3.17c-1.75 0-3.17-1.42-3.17-3.17V7.387c0-.35.06-.69.17-1h10.43zm6.7 8.24v4.557c0 .35-.06.69-.17 1H3.17c.11-.31.17-.65.17-1v-4.557h13.96z"
                />
              </svg>
              Continue with Outlook
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-slate-200 dark:border-zinc-800"></div>
            <span className="px-4 text-sm text-slate-500 dark:text-zinc-500">or</span>
            <div className="flex-1 border-t border-slate-200 dark:border-zinc-800"></div>
          </div>

          {/* Coming Soon */}
          <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-zinc-800/30 border border-slate-200 dark:border-zinc-800">
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Email & password sign in coming soon
            </p>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="mt-6 p-4 rounded-lg border border-slate-200 dark:border-zinc-800/50 bg-slate-50 dark:bg-zinc-900/30 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
            <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Your data stays private and secure</span>
          </div>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-zinc-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors underline">
            Privacy Policy
          </a>
        </p>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
              <p className="mt-4 text-sm text-slate-600 dark:text-zinc-400">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
