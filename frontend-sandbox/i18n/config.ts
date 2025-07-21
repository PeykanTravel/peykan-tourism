export const locales = ['fa', 'en', 'tr'] as const;
export const defaultLocale = 'fa' as const;

export type Locale = (typeof locales)[number]; 