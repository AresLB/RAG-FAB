'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  de: {
    // Navigation
    'nav.features': 'Features',
    'nav.pricing': 'Preise',
    'nav.signin': 'Anmelden',
    'nav.getstarted': 'Kostenlos starten',
    'nav.signout': 'Abmelden',

    // Hero
    'hero.badge': 'Ihr KI Email-Assistent',
    'hero.title1': 'Wie ein digitaler Praktikant',
    'hero.title2': 'der nie schläft',
    'hero.subtitle': 'KI-gestützte Email-Entwürfe basierend auf IHREN Dokumenten.',
    'hero.subtitle2': ' Sie behalten die Kontrolle.',
    'hero.subtitle3': ' Wir lesen Ihre Emails nicht - Ihr KI-Assistent tut es.',
    'hero.cta.start': 'Kostenlos starten',
    'hero.cta.demo': 'Demo ansehen',
    'hero.nocreditcard': 'Keine Kreditkarte erforderlich',
    'hero.freeplan': 'Kostenloser Plan für immer',

    // Features
    'features.title': 'Ihr KI-Assistent, der',
    'features.title2': ' tatsächlich versteht ',
    'features.title3': 'Ihr Geschäft',
    'features.subtitle': 'Laden Sie Ihre Dokumente einmal hoch. Erhalten Sie intelligente Email-Entwürfe für immer.',

    'features.docs.title': 'Wissen aus IHREN Dokumenten',
    'features.docs.desc': 'Laden Sie PDFs, Word-Dokumente oder Textdateien hoch. Ihr KI-Assistent lernt aus Ihren echten Geschäftsdokumenten - Produktkataloge, FAQs, Preislisten, Vorlagen.',

    'features.filter.title': 'Intelligente Email-Filterung',
    'features.filter.desc': 'Sie entscheiden, welche Emails verarbeitet werden. Nutzen Sie Gmail-Labels oder Outlook-Ordner, um genau zu kontrollieren, was Ihr KI-Assistent sieht. Maximale Privatsphäre.',

    'features.draft.title': 'Sofortige Entwurfserstellung',
    'features.draft.desc': 'Erhalten Sie professionelle Email-Entwürfe in Sekunden. Überprüfen, bearbeiten und senden. Ihr KI-Assistent erledigt die schwere Arbeit, Sie behalten die volle Kontrolle.',

    // How it works
    'howitworks.title': 'So funktioniert es',
    'howitworks.subtitle': 'Drei einfache Schritte zu 10x mehr Email-Produktivität',
    'howitworks.step1': 'Dokumente hochladen',
    'howitworks.step1.desc': 'Fügen Sie Ihre Wissensbasis hinzu - Produktspezifikationen, FAQs, Vorlagen oder beliebige Geschäftsdokumente. Ihre KI lernt daraus.',
    'howitworks.step2': 'Postfach verbinden',
    'howitworks.step2.desc': 'Verknüpfen Sie Gmail oder Outlook. Erstellen Sie ein Label oder Ordner für Emails, bei denen Sie Hilfe möchten. Sie kontrollieren, was verarbeitet wird.',
    'howitworks.step3': 'Überprüfen und senden',
    'howitworks.step3.desc': 'Erhalten Sie KI-generierte Entwürfe basierend auf Ihren Dokumenten. Bei Bedarf bearbeiten, dann senden. Sparen Sie täglich Stunden.',

    // Privacy
    'privacy.title': 'Datenschutz von Grund auf',
    'privacy.subtitle': 'Wir haben Responobis nach einem Kernprinzip gebaut:',
    'privacy.subtitle2': ' Ihre Daten bleiben Ihre.',
    'privacy.subtitle3': ' Wir lesen Ihre Emails nicht. Ihr KI-Assistent tut es - und er steht unter Ihrer vollständigen Kontrolle.',
    'privacy.feature1.title': 'Sie wählen, was verarbeitet wird',
    'privacy.feature1.desc': 'Label/Ordner-basierte Filterung bedeutet, dass nur ausgewählte Emails analysiert werden',
    'privacy.feature2.title': 'DSGVO-konform',
    'privacy.feature2.desc': 'EU-Server, verschlüsselte Speicherung, vollständige Datenlöschung auf Anfrage',
    'privacy.feature3.title': 'Keine dauerhafte Speicherung',
    'privacy.feature3.desc': 'Email-Inhalte werden im Speicher verarbeitet, nicht in Datenbanken gespeichert',
    'privacy.feature4.title': 'OAuth-Sicherheit',
    'privacy.feature4.desc': 'Sichere Google/Microsoft OAuth, minimale Berechtigungen, verschlüsselte Tokens',

    // Pricing
    'pricing.title': 'Einfache, transparente Preise',
    'pricing.subtitle': 'Kostenlos starten, upgraden wenn Sie mehr brauchen',
    'pricing.free': 'Kostenlos',
    'pricing.free.drafts': 'Email-Entwürfe/Monat',
    'pricing.free.docs': 'Dokumente (max 10MB)',
    'pricing.free.account': 'Email-Konto',
    'pricing.free.support': 'Community Support',
    'pricing.free.cta': 'Loslegen',

    'pricing.basic': 'Basic',
    'pricing.basic.popular': 'Beliebtester',
    'pricing.basic.drafts': 'Email-Entwürfe/Monat',
    'pricing.basic.docs': 'Dokumente (max 100MB)',
    'pricing.basic.accounts': 'Email-Konten',
    'pricing.basic.support': 'Prioritäts-Email-Support',
    'pricing.basic.filters': 'Erweiterte Filter',
    'pricing.basic.cta': 'Kostenlos testen',

    'pricing.pro': 'Pro',
    'pricing.pro.drafts': 'Unbegrenzte Email-Entwürfe',
    'pricing.pro.docs': 'Unbegrenzte Dokumente (500MB)',
    'pricing.pro.accounts': 'Unbegrenzte Email-Konten',
    'pricing.pro.support': 'Prioritäts-Support + Slack',
    'pricing.pro.templates': 'Individuelle Vorlagen',
    'pricing.pro.cta': 'Vertrieb kontaktieren',

    // CTA
    'cta.title': 'Bereit, täglich Stunden zu sparen?',
    'cta.subtitle': 'Schließen Sie sich Profis an, die KI repetitive Emails erledigen lassen, während sie sich auf das Wesentliche konzentrieren.',
    'cta.button': 'Kostenlos starten',

    // Footer
    'footer.tagline': 'Ihr KI-Email-Assistent. Wie ein digitaler Praktikant, der nie schläft. Datenschutz zuerst, dokumentenbasiert, immer unter Ihrer Kontrolle.',
    'footer.product': 'Produkt',
    'footer.demo': 'Demo',
    'footer.company': 'Unternehmen',
    'footer.about': 'Über uns',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.contact': 'Kontakt',
    'footer.copyright': '© 2025 Responobis. Gebaut für Profis, die ihre Zeit schätzen.',

    // Dashboard
    'dashboard.welcome': 'Willkommen bei Responobis',
    'dashboard.subtitle': 'Ihr KI-Email-Assistent auf Basis Ihrer eigenen Dokumente',
    'dashboard.overview': 'Übersicht',
    'dashboard.documents': 'Dokumente',
    'dashboard.chat': 'Chat',
    'dashboard.email': 'Email-Assistent',

    'dashboard.action.docs': 'Dokumente hochladen',
    'dashboard.action.docs.desc': 'Fügen Sie Ihre Wissensbasis hinzu - PDFs, Verträge, FAQs',
    'dashboard.action.chat': 'Chat starten',
    'dashboard.action.chat.desc': 'Stellen Sie Fragen zu Ihren Dokumenten',
    'dashboard.action.email': 'Email-Assistent',
    'dashboard.action.email.desc': 'Automatische Email-Antworten generieren',

    'dashboard.getting.started': 'Erste Schritte',
    'dashboard.step1': 'Dokumente hochladen',
    'dashboard.step1.desc': 'Fügen Sie Ihre wichtigsten Dokumente hinzu: Produktspezifikationen, Verträge, FAQs, Vorlagen. Die KI analysiert diese und nutzt dieses Wissen für Antworten.',
    'dashboard.step2': 'Chat testen',
    'dashboard.step2.desc': 'Probieren Sie die Chat-Funktion aus und stellen Sie Fragen zu Ihren hochgeladenen Dokumenten. Die KI antwortet basierend auf dem Inhalt Ihrer Dateien.',
    'dashboard.step3': 'Email-Assistent aktivieren',
    'dashboard.step3.desc': 'Verbinden Sie Gmail oder Outlook und lassen Sie den Assistenten automatisch Antwortentwürfe für eingehende Anfragen erstellen.',

    'dashboard.tip.quality': 'Dokumentqualität zählt',
    'dashboard.tip.quality.desc': 'Je detaillierter und aktueller Ihre Dokumente sind, desto präziser werden die KI-Antworten. Aktualisieren Sie regelmäßig Ihre Dokumente und FAQs.',
    'dashboard.tip.privacy': 'Datenschutz-zuerst Ansatz',
    'dashboard.tip.privacy.desc': 'Sie kontrollieren, was verarbeitet wird. Nutzen Sie Labels oder Ordner, um zu entscheiden, welche Emails Ihr KI-Assistent sieht. Ihre Daten bleiben Ihre.',

    'dashboard.usage': 'Nutzung (Kostenloser Plan)',
    'dashboard.upgrade': 'Plan upgraden',

    // Documents Page
    'docs.title': 'Dokumente',
    'docs.subtitle': 'Laden Sie Ihre Wissensdatenbank hoch - PDF, DOCX, TXT oder MD Dateien',
    'docs.upload': 'Dokument hochladen',
    'docs.upload.dragging': 'Datei hier ablegen...',
    'docs.upload.desc': 'Ziehen Sie eine Datei hierher oder klicken Sie zum Auswählen',
    'docs.upload.button': 'Datei auswählen',
    'docs.upload.formats': 'Unterstützte Formate: PDF, DOCX, TXT, MD (max. 10MB)',
    'docs.list': 'Ihre Dokumente',
    'docs.empty': 'Noch keine Dokumente',
    'docs.empty.desc': 'Laden Sie Ihr erstes Dokument hoch, um mit RAG-basierten Email-Antworten zu starten',
    'docs.empty.button': 'Erstes Dokument hochladen',

    // Chat Page
    'chat.title': 'RAG-Chat: Fragen Sie zu Ihren Dokumenten',
    'chat.subtitle': 'KI antwortet basierend auf Ihren hochgeladenen Dokumenten',
    'chat.new': 'Neuer Chat',
    'chat.history': 'Chat-Verlauf',
    'chat.start': 'Starten Sie eine Konversation',
    'chat.start.desc': 'Stellen Sie Fragen zu Ihren hochgeladenen Dokumenten. Die KI nutzt RAG-Technologie für präzise Antworten basierend auf Ihrem Content.',
    'chat.examples': 'Beispielfragen:',
    'chat.example1': 'Was steht über Preise?',
    'chat.example2': 'Welche Produkte dokumentiert?',
    'chat.placeholder': 'Stellen Sie eine Frage zu Ihren Dokumenten...',
    'chat.send': 'Senden',
    'chat.sources': 'Quellen:',

    // Email Page
    'email.title': 'Emails',
    'email.subtitle.gmail': 'Verwalten Sie Ihre Gmail Emails und generieren Sie KI-Antworten',
    'email.subtitle.outlook': 'Verwalten Sie Ihre Outlook Emails und generieren Sie KI-Antworten',
    'email.no.provider': 'Kein Email-Anbieter verbunden',
    'email.no.provider.desc': 'Verbinden Sie Ihr Gmail- oder Outlook-Konto, um Emails zu verwalten und Antworten zu generieren.',
    'email.connect': 'Jetzt verbinden',
    'email.filter.setup': 'Email-Filter einrichten',
    'email.filter.desc.gmail': 'Wählen Sie ein Label, um nur bestimmte Emails zu verarbeiten',
    'email.filter.desc.outlook': 'Wählen Sie einen Ordner, um nur bestimmte Emails zu verarbeiten',
  },
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.signin': 'Sign in',
    'nav.getstarted': 'Get started',
    'nav.signout': 'Sign out',

    // Hero
    'hero.badge': 'Your AI Email Assistant',
    'hero.title1': 'Like a digital intern',
    'hero.title2': 'who never sleeps',
    'hero.subtitle': 'AI-powered email drafts based on YOUR documents.',
    'hero.subtitle2': ' You stay in control.',
    'hero.subtitle3': " We don't read your emails - your AI assistant does.",
    'hero.cta.start': 'Start for free',
    'hero.cta.demo': 'Watch demo',
    'hero.nocreditcard': 'No credit card required',
    'hero.freeplan': 'Free forever plan',

    // Features
    'features.title': 'Your AI assistant that',
    'features.title2': ' actually understands ',
    'features.title3': 'your business',
    'features.subtitle': 'Upload your documents once. Get intelligent email drafts forever.',

    'features.docs.title': 'Knowledge from YOUR documents',
    'features.docs.desc': 'Upload PDFs, Word docs, or text files. Your AI assistant learns from your actual business documents - product catalogs, FAQs, price lists, templates.',

    'features.filter.title': 'Smart email filtering',
    'features.filter.desc': 'You decide which emails get processed. Use Gmail labels or Outlook folders to control exactly what your AI assistant sees. Maximum privacy.',

    'features.draft.title': 'Instant draft generation',
    'features.draft.desc': 'Get professional email drafts in seconds. Review, edit, and send. Your AI assistant handles the heavy lifting, you keep full control.',

    // How it works
    'howitworks.title': 'How it works',
    'howitworks.subtitle': 'Three simple steps to 10x your email productivity',
    'howitworks.step1': 'Upload documents',
    'howitworks.step1.desc': 'Add your knowledge base - product specs, FAQs, templates, or any business documents. Your AI learns from them.',
    'howitworks.step2': 'Connect your inbox',
    'howitworks.step2.desc': 'Link Gmail or Outlook. Create a label or folder for emails you want help with. You control what gets processed.',
    'howitworks.step3': 'Review and send',
    'howitworks.step3.desc': 'Get AI-generated drafts based on your documents. Edit if needed, then send. Save hours every day.',

    // Privacy
    'privacy.title': 'Privacy-first by design',
    'privacy.subtitle': 'We built Responobis with one core principle:',
    'privacy.subtitle2': ' your data stays yours.',
    'privacy.subtitle3': " We don't read your emails. Your AI assistant does - and it's under your complete control.",
    'privacy.feature1.title': "You choose what's processed",
    'privacy.feature1.desc': 'Label/folder-based filtering means only selected emails are analyzed',
    'privacy.feature2.title': 'GDPR compliant',
    'privacy.feature2.desc': 'EU servers, encrypted storage, full data deletion on request',
    'privacy.feature3.title': 'No permanent storage',
    'privacy.feature3.desc': 'Email content is processed in memory, not stored in databases',
    'privacy.feature4.title': 'OAuth security',
    'privacy.feature4.desc': 'Secure Google/Microsoft OAuth, minimal permissions, encrypted tokens',

    // Pricing
    'pricing.title': 'Simple, transparent pricing',
    'pricing.subtitle': 'Start free, upgrade when you need more',
    'pricing.free': 'Free',
    'pricing.free.drafts': 'email drafts/month',
    'pricing.free.docs': 'documents (max 10MB)',
    'pricing.free.account': 'email account',
    'pricing.free.support': 'Community support',
    'pricing.free.cta': 'Get started',

    'pricing.basic': 'Basic',
    'pricing.basic.popular': 'Most popular',
    'pricing.basic.drafts': 'email drafts/month',
    'pricing.basic.docs': 'documents (max 100MB)',
    'pricing.basic.accounts': 'email accounts',
    'pricing.basic.support': 'Priority email support',
    'pricing.basic.filters': 'Advanced filters',
    'pricing.basic.cta': 'Start free trial',

    'pricing.pro': 'Pro',
    'pricing.pro.drafts': 'Unlimited email drafts',
    'pricing.pro.docs': 'Unlimited documents (500MB)',
    'pricing.pro.accounts': 'Unlimited email accounts',
    'pricing.pro.support': 'Priority support + Slack',
    'pricing.pro.templates': 'Custom templates',
    'pricing.pro.cta': 'Contact sales',

    // CTA
    'cta.title': 'Ready to save hours every day?',
    'cta.subtitle': 'Join professionals who let AI handle repetitive emails while they focus on what matters.',
    'cta.button': 'Get started for free',

    // Footer
    'footer.tagline': 'Your AI email assistant. Like a digital intern who never sleeps. Privacy-first, document-powered, always under your control.',
    'footer.product': 'Product',
    'footer.demo': 'Demo',
    'footer.company': 'Company',
    'footer.about': 'About',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact',
    'footer.copyright': '© 2025 Responobis. Built for professionals who value their time.',

    // Dashboard
    'dashboard.welcome': 'Welcome to Responobis',
    'dashboard.subtitle': 'Your AI email assistant powered by your own documents',
    'dashboard.overview': 'Overview',
    'dashboard.documents': 'Documents',
    'dashboard.chat': 'Chat',
    'dashboard.email': 'Email Assistant',

    'dashboard.action.docs': 'Upload documents',
    'dashboard.action.docs.desc': 'Add your knowledge base - PDFs, contracts, FAQs',
    'dashboard.action.chat': 'Start chat',
    'dashboard.action.chat.desc': 'Ask questions about your documents',
    'dashboard.action.email': 'Email Assistant',
    'dashboard.action.email.desc': 'Generate automatic email responses',

    'dashboard.getting.started': 'Getting started',
    'dashboard.step1': 'Upload your documents',
    'dashboard.step1.desc': 'Add your key documents: product specs, contracts, FAQs, templates. The AI analyzes them and uses this knowledge to generate responses.',
    'dashboard.step2': 'Test the chat',
    'dashboard.step2.desc': 'Try the chat feature and ask questions about your uploaded documents. The AI answers based on the content of your files.',
    'dashboard.step3': 'Activate Email Assistant',
    'dashboard.step3.desc': 'Connect Gmail or Outlook and let the assistant automatically create response drafts for incoming requests.',

    'dashboard.tip.quality': 'Document quality matters',
    'dashboard.tip.quality.desc': 'The more detailed and current your documents are, the more precise the AI responses. Regularly update your documents and FAQs.',
    'dashboard.tip.privacy': 'Privacy-first approach',
    'dashboard.tip.privacy.desc': "You control what gets processed. Use labels or folders to decide which emails your AI assistant sees. Your data stays yours.",

    'dashboard.usage': 'Usage (Free Plan)',
    'dashboard.upgrade': 'Upgrade plan',

    // Documents Page
    'docs.title': 'Documents',
    'docs.subtitle': 'Upload your knowledge base - PDF, DOCX, TXT or MD files',
    'docs.upload': 'Upload document',
    'docs.upload.dragging': 'Drop file here...',
    'docs.upload.desc': 'Drag and drop a file here or click to select',
    'docs.upload.button': 'Select file',
    'docs.upload.formats': 'Supported formats: PDF, DOCX, TXT, MD (max. 10MB)',
    'docs.list': 'Your Documents',
    'docs.empty': 'No documents yet',
    'docs.empty.desc': 'Upload your first document to start with RAG-based email responses',
    'docs.empty.button': 'Upload first document',

    // Chat Page
    'chat.title': 'RAG Chat: Ask about your documents',
    'chat.subtitle': 'AI responds based on your uploaded documents',
    'chat.new': 'New Chat',
    'chat.history': 'Chat History',
    'chat.start': 'Start a conversation',
    'chat.start.desc': 'Ask questions about your uploaded documents. The AI uses RAG technology to provide precise answers based on your content.',
    'chat.examples': 'Example questions:',
    'chat.example1': 'What about pricing?',
    'chat.example2': 'What products documented?',
    'chat.placeholder': 'Ask a question about your documents...',
    'chat.send': 'Send',
    'chat.sources': 'Sources:',

    // Email Page
    'email.title': 'Emails',
    'email.subtitle.gmail': 'Manage your Gmail emails and generate AI responses',
    'email.subtitle.outlook': 'Manage your Outlook emails and generate AI responses',
    'email.no.provider': 'No email provider connected',
    'email.no.provider.desc': 'Connect your Gmail or Outlook account to manage emails and generate responses.',
    'email.connect': 'Connect now',
    'email.filter.setup': 'Set up email filter',
    'email.filter.desc.gmail': 'Choose a label to process only specific emails',
    'email.filter.desc.outlook': 'Choose a folder to process only specific emails',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage or use German as default
    const savedLanguage = localStorage.getItem('language') as Language | null;
    setLanguage(savedLanguage || 'de');
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('language', language);
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'de' ? 'en' : 'de');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
