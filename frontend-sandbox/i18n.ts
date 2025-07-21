import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n/config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  try {
    return {
      locale: locale || defaultLocale,
      messages: (await import(`./i18n/${locale}.json`)).default,
      timeZone: 'Asia/Tehran'
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    return {
      locale: defaultLocale,
      messages: (await import(`./i18n/en.json`)).default,
      timeZone: 'Asia/Tehran'
    };
  }
}); 