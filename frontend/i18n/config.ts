export const locales = ['en', 'fa', 'tr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number]; 