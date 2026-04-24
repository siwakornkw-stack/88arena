'use client';

import { useTranslation } from '@/i18n/provider';
import { LOCALES } from '@/i18n/config';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 p-0.5 text-xs" title={t('language.switch')}>
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => {
            setLocale(l);
            window.location.reload();
          }}
          className={`px-2 py-1 rounded-full font-medium transition ${
            locale === l
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
