import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale; // fallback to default from config
  }
  return {
    locale: locale as typeof defaultLocale,
    messages: (await import(`../i18n/${locale}.json`)).default
  };
}); 