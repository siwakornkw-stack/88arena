import th from './messages/th.json';
import en from './messages/en.json';

export const LOCALES = ['th', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'th';
export const LOCALE_COOKIE = 'locale';

export type Messages = typeof th;

export const messages: Record<Locale, Messages> = { th, en };

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
