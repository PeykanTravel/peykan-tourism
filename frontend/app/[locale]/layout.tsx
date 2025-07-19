/**
 * Root Layout Component
 * 
 * Main layout wrapper with navigation, footer, and global providers
 */

import React from 'react';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// Components
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/Toaster';

// Providers
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CartProvider } from '@/lib/contexts/CartContext';
import { ToastProvider } from '@/lib/contexts/ToastContext';

// Styles
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                  <Toaster />
                </div>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fa' }];
} 