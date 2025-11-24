import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold tracking-tight">
                Responobis
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:to-cyan-600 transition-all"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              Your AI Email Assistant
            </div>

            <h1 className="max-w-4xl text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              Like a digital intern
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                who never sleeps
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              AI-powered email drafts based on YOUR documents.
              <span className="text-zinc-300 font-medium"> You stay in control.</span> We don't read your emails - your AI assistant does.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login"
                className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-cyan-600 transition-all"
              >
                Start for free
              </Link>
              <a
                href="#demo"
                className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-8 py-3.5 text-base font-semibold text-zinc-100 hover:bg-zinc-800/50 transition-colors"
              >
                Watch demo
              </a>
            </div>

            <div className="mt-8 flex items-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free forever plan
              </div>
            </div>
          </div>

          {/* Video/Image Placeholder */}
          <div id="demo" className="relative mx-auto max-w-6xl mb-32">
            <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-4 shadow-2xl">
              <div className="aspect-video rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border border-violet-500/30 mb-4">
                    <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-zinc-400 text-sm">Product demo video</p>
                  <p className="text-zinc-600 text-xs mt-1">Click to play</p>
                </div>
              </div>
            </div>
            {/* Gradient glow effect */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 blur-3xl"></div>
          </div>

          {/* Features Section */}
          <div id="features" className="py-32">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Your AI assistant that
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"> actually understands </span>
                your business
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Upload your documents once. Get intelligent email drafts forever.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-violet-500/50 transition-all">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500/20 to-violet-500/10 border border-violet-500/30">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-zinc-100">
                  Knowledge from YOUR documents
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Upload PDFs, Word docs, or text files. Your AI assistant learns from your actual business documents - product catalogs, FAQs, price lists, templates.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-cyan-500/50 transition-all">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-zinc-100">
                  Smart email filtering
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  You decide which emails get processed. Use Gmail labels or Outlook folders to control exactly what your AI assistant sees. Maximum privacy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-violet-500/50 transition-all">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500/20 to-cyan-500/10 border border-violet-500/30">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-zinc-100">
                  Instant draft generation
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  Get professional email drafts in seconds. Review, edit, and send. Your AI assistant handles the heavy lifting, you keep full control.
                </p>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="py-32">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Three simple steps to 10x your email productivity
              </p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {/* Step 1 */}
              <div className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-lg font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-semibold">Upload documents</h3>
                </div>
                <p className="text-zinc-400 leading-relaxed ml-14">
                  Add your knowledge base - product specs, FAQs, templates, or any business documents. Your AI learns from them.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-lg font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-semibold">Connect your inbox</h3>
                </div>
                <p className="text-zinc-400 leading-relaxed ml-14">
                  Link Gmail or Outlook. Create a label or folder for emails you want help with. You control what gets processed.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-lg font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-semibold">Review and send</h3>
                </div>
                <p className="text-zinc-400 leading-relaxed ml-14">
                  Get AI-generated drafts based on your documents. Edit if needed, then send. Save hours every day.
                </p>
              </div>
            </div>
          </div>

          {/* Trust/Privacy Section */}
          <div className="py-32">
            <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-zinc-950 p-12 sm:p-16">
              <div className="text-center max-w-3xl mx-auto">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4">
                  Privacy-first by design
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed mb-8">
                  We built Responobis with one core principle: <span className="text-zinc-300 font-medium">your data stays yours</span>.
                  We don't read your emails. Your AI assistant does - and it's under your complete control.
                </p>

                <div className="grid gap-6 sm:grid-cols-2 text-left mt-12">
                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-zinc-100 mb-1">You choose what's processed</h4>
                      <p className="text-sm text-zinc-400">Label/folder-based filtering means only selected emails are analyzed</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-zinc-100 mb-1">GDPR compliant</h4>
                      <p className="text-sm text-zinc-400">EU servers, encrypted storage, full data deletion on request</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-zinc-100 mb-1">No permanent storage</h4>
                      <p className="text-sm text-zinc-400">Email content is processed in memory, not stored in databases</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-zinc-100 mb-1">OAuth security</h4>
                      <p className="text-sm text-zinc-400">Secure Google/Microsoft OAuth, minimal permissions, encrypted tokens</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Subtle glow */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-500/5 to-cyan-500/5 blur-3xl rounded-3xl"></div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="py-32">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-zinc-400">
                Start free, upgrade when you need more
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Free</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">€0</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    10 email drafts/month
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    5 documents (max 10MB)
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1 email account
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Community support
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-center font-semibold text-zinc-100 hover:bg-zinc-700/50 transition-colors"
                >
                  Get started
                </Link>
              </div>

              {/* Basic Plan - Popular */}
              <div className="relative rounded-2xl border-2 border-violet-500 bg-zinc-900/50 p-8 shadow-xl shadow-violet-500/20">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-1 text-sm font-semibold">
                  Most popular
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Basic</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">€99</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    500 email drafts/month
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    50 documents (max 100MB)
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    3 email accounts
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority email support
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced filters
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="block w-full rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-4 py-3 text-center font-semibold text-white hover:from-violet-600 hover:to-cyan-600 transition-all"
                >
                  Start free trial
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold">€299</span>
                  <span className="text-zinc-400">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited email drafts
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited documents (500MB)
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited email accounts
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support + Slack
                  </li>
                  <li className="flex items-start gap-3 text-zinc-300">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Custom templates
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="block w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-center font-semibold text-zinc-100 hover:bg-zinc-700/50 transition-colors"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-32">
            <div className="relative rounded-3xl border border-zinc-800 bg-gradient-to-r from-violet-900/30 via-zinc-900/50 to-cyan-900/30 p-12 sm:p-16 text-center overflow-hidden">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Ready to save hours every day?
              </h2>
              <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
                Join professionals who let AI handle repetitive emails while they focus on what matters.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-cyan-600 transition-all"
              >
                Get started for free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              {/* Background gradient effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-500/10 via-transparent to-cyan-500/10 blur-3xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-4">Responobis</h3>
              <p className="text-zinc-400 text-sm max-w-md">
                Your AI email assistant. Like a digital intern who never sleeps.
                Privacy-first, document-powered, always under your control.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#features" className="hover:text-zinc-100 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-zinc-100 transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-zinc-100 transition-colors">Demo</a></li>
                <li><Link href="/login" className="hover:text-zinc-100 transition-colors">Sign in</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-zinc-100 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-zinc-100 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            © 2025 Responobis. Built for professionals who value their time.
          </div>
        </div>
      </footer>
    </div>
  );
}
