import { describe, it, expect } from 'vitest';
import { LOCALES, DEFAULT_LOCALE, isLocale, messages } from '@/i18n/config';

describe('i18n config', () => {
  it('includes both th and en locales', () => {
    expect(LOCALES).toContain('th');
    expect(LOCALES).toContain('en');
  });

  it('defaults to th', () => {
    expect(DEFAULT_LOCALE).toBe('th');
  });

  it('validates locale strings', () => {
    expect(isLocale('th')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('has matching keys in every locale', () => {
    function keys(obj: unknown, prefix = ''): string[] {
      if (!obj || typeof obj !== 'object') return [];
      return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
        const next = prefix ? `${prefix}.${k}` : k;
        return typeof v === 'object' && v !== null ? keys(v, next) : [next];
      });
    }

    const thKeys = keys(messages.th).sort();
    const enKeys = keys(messages.en).sort();
    expect(enKeys).toEqual(thKeys);
  });
});
