import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'fa', 'tr'];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale)) {
    locale = 'en'; // fallback to default
  }
  return {
    locale,
    messages: (await import(`../i18n/${locale}.json`)).default
  };
}); 