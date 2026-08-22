export const locales = ['pt', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export const localeLabels: Record<Locale, string> = {
  pt: 'PT',
  en: 'EN',
};

export const htmlLang: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
};

export const dateLocale: Record<Locale, string> = {
  pt: 'pt-BR',
  en: 'en-US',
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getAlternateLocale(lang: Locale): Locale {
  return lang === 'pt' ? 'en' : 'pt';
}
