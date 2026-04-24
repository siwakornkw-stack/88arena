'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DEFAULT_LOCALE, LOCALE_COOKIE, Locale, Messages, messages as all } from './config';

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function get(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    if (current && typeof current === 'object' && p in current) {
      current = (current as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages: all[locale],
      setLocale,
      t: (key: string) => get(all[locale], key) ?? get(all[DEFAULT_LOCALE], key) ?? key,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      messages: all[DEFAULT_LOCALE],
      setLocale: () => {},
      t: (key: string) => get(all[DEFAULT_LOCALE], key) ?? key,
    };
  }
  return ctx;
}
