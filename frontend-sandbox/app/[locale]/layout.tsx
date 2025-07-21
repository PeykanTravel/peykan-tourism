import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../lib/contexts/AuthContext';
import { UnifiedCartProvider } from '../../lib/contexts/UnifiedCartContext';
import { CurrencyProvider } from '../../lib/currency-context';
import { RTLProvider } from '../../components/RTLProvider';
import StoreProvider from '../../components/providers/StoreProvider';
import ThemeProvider from '../../components/ThemeProvider';
import type { Locale } from '@/i18n/config';

type Props = {
  children: ReactNode;
  params: {
    locale: Locale;
  };
};

export default async function LocaleLayout({ children, params }: Props) {
  const messages = await getMessages();
  const isRTL = params.locale === 'fa';

  return (
    <ThemeProvider isRTL={isRTL} locale={params.locale}>
      <NextIntlClientProvider locale={params.locale} messages={messages}>
        <StoreProvider>
          <CurrencyProvider>
            <RTLProvider>
              <AuthProvider>
                <UnifiedCartProvider>
                  <div className={`min-h-screen flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
                    <Navbar />
                    <main className="flex-1">
                      {children}
                    </main>
                  </div>
                </UnifiedCartProvider>
              </AuthProvider>
            </RTLProvider>
          </CurrencyProvider>
        </StoreProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
} 