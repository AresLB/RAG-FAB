'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState('');
  const [provider, setProvider] = useState('');

  useEffect(() => {
    const authProvider = localStorage.getItem('authProvider');
    setProvider(authProvider || '');
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Welcome to Responobis</h1>
        <p className="mt-2 text-zinc-400">
          Your AI email assistant powered by your own documents
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Link
          href="/dashboard/documents"
          className="group relative block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-violet-500/50 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500/20 to-violet-500/10 border border-violet-500/30">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Upload documents
            </h3>
            <p className="text-sm text-zinc-400">
              Add your knowledge base - PDFs, contracts, FAQs
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/chat"
          className="group relative block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-cyan-500/50 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Start chat
            </h3>
            <p className="text-sm text-zinc-400">
              Ask questions about your documents
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/email"
          className="group relative block rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-violet-500/50 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500/20 to-cyan-500/10 border border-violet-500/30">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Email Assistant
            </h3>
            <p className="text-sm text-zinc-400">
              Generate automatic email responses
            </p>
          </div>
        </Link>
      </div>

      {/* Getting Started Guide */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 mb-8">
        <h2 className="text-xl font-bold text-zinc-100 mb-6">
          Getting started
        </h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-white flex items-center justify-center text-lg font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 mb-2">
                Upload your documents
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Add your key documents: product specs, contracts, FAQs, templates. The AI analyzes them and uses this knowledge to generate responses.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white flex items-center justify-center text-lg font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 mb-2">
                Test the chat
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Try the chat feature and ask questions about your uploaded documents. The AI answers based on the content of your files.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white flex items-center justify-center text-lg font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 mb-2">
                Activate Email Assistant
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Connect {provider === 'gmail' ? 'your Gmail account' : provider === 'outlook' ? 'your Outlook account' : 'Gmail or Outlook'} and let the assistant automatically create response drafts for incoming requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-violet-900/5 p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-violet-300 mb-2">
                Document quality matters
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                The more detailed and current your documents are, the more precise the AI responses. Regularly update your documents and FAQs.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-cyan-900/5 p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                Privacy-first approach
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                You control what gets processed. Use labels or folders to decide which emails your AI assistant sees. Your data stays yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
