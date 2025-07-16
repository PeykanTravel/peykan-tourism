export const locales = ['en', 'fa', 'tr'] as const;
export const defaultLocale = 'fa' as const;

export type Locale = (typeof locales)[number]; 