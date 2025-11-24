'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors border border-slate-200 dark:border-zinc-700"
      aria-label="Toggle language"
      title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
    >
      <span className="text-slate-700 dark:text-zinc-300">
        {language === 'de' ? 'EN' : 'DE'}
      </span>
    </button>
  );
}
