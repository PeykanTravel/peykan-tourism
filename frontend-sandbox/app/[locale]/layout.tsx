import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ClientLayout from './ClientLayout';
import type { Locale } from '@/i18n/config';

type Props = {
  children: ReactNode;
  params: {
    locale: Locale;
  };
};

export default async function LocaleLayout({ children, params }: Props) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={params.locale} messages={messages}>
      <ClientLayout locale={params.locale}>{children}</ClientLayout>
    </NextIntlClientProvider>
  );
} 