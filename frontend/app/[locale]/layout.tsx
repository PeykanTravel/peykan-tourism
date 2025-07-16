import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../lib/contexts/AuthContext';
import { UnifiedCartProvider } from '../../lib/contexts/UnifiedCartContext';
import { ThemeProvider } from '../../lib/contexts/ThemeContext';
import { ToastProvider } from '../../lib/contexts/ToastContext';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Peykan Tourism Platform',
  description: 'Book tours, events, and transfers with ease',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎭</text></svg>',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Peykan Tourism Platform',
    description: 'Book tours, events, and transfers with ease',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params }: Props) {
  const messages = await getMessages();

  return (
    <html lang={params.locale} dir={params.locale === 'fa' ? 'rtl' : 'ltr'}>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white min-h-screen">
        <ErrorBoundary>
          <NextIntlClientProvider locale={params.locale} messages={messages}>
            <ThemeProvider>
              <ToastProvider>
                <AuthProvider>
                  <UnifiedCartProvider>
                    <div className="min-h-screen flex flex-col">
                      <Navbar />
                      <main className="flex-1">
                        {children}
                      </main>
                    </div>
                  </UnifiedCartProvider>
                </AuthProvider>
              </ToastProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 