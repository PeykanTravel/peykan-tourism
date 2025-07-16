import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../lib/contexts/AuthContext';
<<<<<<< Updated upstream
import { CartProvider } from '../../lib/contexts/CartContext';
import type { Locale } from '@/i18n/config';

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
=======
import { CartProvider } from '../../lib/contexts/UnifiedCartContext';
import { ThemeProvider } from '../../lib/contexts/ThemeContext';
import { ToastProvider } from '../../lib/contexts/ToastContext';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
>>>>>>> Stashed changes

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params }: Props) {
  const messages = await getMessages();

  return (
<<<<<<< Updated upstream
    <html lang={params.locale} dir={params.locale === 'fa' ? 'rtl' : 'ltr'}>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white min-h-screen">
        <NextIntlClientProvider locale={params.locale} messages={messages}>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
              </div>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
=======
    <ErrorBoundary>
      <NextIntlClientProvider locale={params.locale} messages={messages}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </ErrorBoundary>
>>>>>>> Stashed changes
  );
} 