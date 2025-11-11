import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header/Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Responobis</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Anmelden
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Kostenlos starten
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <h2 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            KI-gestützte Email-Antworten
            <br />
            <span className="text-blue-600">für Immobilienmakler</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Laden Sie Ihre Dokumente hoch - Expose, Mietverträge, FAQs - und lassen Sie unsere KI automatisch professionelle Email-Antworten für Sie erstellen. Basierend auf Ihren eigenen Informationen.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Kostenlos testen
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-slate-300 bg-white px-8 py-3 text-lg font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Mehr erfahren
            </a>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20">
          <h3 className="text-center text-3xl font-bold text-slate-900 mb-12">
            Perfekt für Ihren Makler-Alltag
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">📧</div>
              <h4 className="mb-2 text-xl font-semibold text-slate-900">
                Email-Agent
              </h4>
              <p className="text-slate-600">
                Verbinden Sie Gmail oder Outlook. Unser Agent liest Anfragen und erstellt automatisch passende Antwort-Entwürfe basierend auf Ihren Dokumenten.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">📄</div>
              <h4 className="mb-2 text-xl font-semibold text-slate-900">
                Dokumente hochladen
              </h4>
              <p className="text-slate-600">
                PDF, DOCX, TXT - laden Sie Expose, Verträge, Objektbeschreibungen hoch. Die KI versteht den Kontext und nutzt diese Informationen.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 text-4xl">🤖</div>
              <h4 className="mb-2 text-xl font-semibold text-slate-900">
                RAG-Technologie
              </h4>
              <p className="text-slate-600">
                Retrieval Augmented Generation stellt sicher, dass alle Antworten auf Ihren echten Dokumenten basieren - keine Halluzinationen.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20">
          <h3 className="text-center text-3xl font-bold text-slate-900 mb-12">
            Transparente Preise
          </h3>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Free</h4>
              <div className="mb-4">
                <span className="text-4xl font-bold">€0</span>
                <span className="text-slate-600">/Monat</span>
              </div>
              <ul className="space-y-2 mb-6 text-slate-600">
                <li>✓ 10 Fragen/Monat</li>
                <li>✓ 5 Dokumente</li>
                <li>✓ Email-Integration</li>
                <li>✓ Basis-Support</li>
              </ul>
              <Link
                href="/login"
                className="block w-full rounded-lg border border-blue-600 bg-white px-4 py-2 text-center font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Starten
              </Link>
            </div>

            {/* Basic Plan */}
            <div className="rounded-lg border-2 border-blue-600 bg-white p-6 shadow-lg">
              <div className="mb-2 text-sm font-semibold text-blue-600">BELIEBT</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Basic</h4>
              <div className="mb-4">
                <span className="text-4xl font-bold">€99</span>
                <span className="text-slate-600">/Monat</span>
              </div>
              <ul className="space-y-2 mb-6 text-slate-600">
                <li>✓ 500 Fragen/Monat</li>
                <li>✓ 50 Dokumente</li>
                <li>✓ Email-Integration</li>
                <li>✓ Prioritäts-Support</li>
              </ul>
              <Link
                href="/login"
                className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Jetzt starten
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="rounded-lg border-2 border-slate-200 bg-white p-6">
              <h4 className="text-xl font-bold text-slate-900 mb-2">Pro</h4>
              <div className="mb-4">
                <span className="text-4xl font-bold">€299</span>
                <span className="text-slate-600">/Monat</span>
              </div>
              <ul className="space-y-2 mb-6 text-slate-600">
                <li>✓ Unbegrenzte Fragen</li>
                <li>✓ Unbegrenzte Dokumente</li>
                <li>✓ Email-Integration</li>
                <li>✓ Premium-Support</li>
              </ul>
              <Link
                href="/login"
                className="block w-full rounded-lg border border-blue-600 bg-white px-4 py-2 text-center font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-slate-600">
            © 2025 Responobis. Intelligente Email-Lösungen für Immobilienmakler.
          </p>
        </div>
      </footer>
    </div>
  );
}
