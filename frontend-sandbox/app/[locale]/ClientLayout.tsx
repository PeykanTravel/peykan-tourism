'use client';

import { ReactNode } from 'react';
import Navbar from '../../components/Navbar';
import { AuthProvider } from '../../lib/contexts/AuthContext';
import { UnifiedCartProvider } from '../../lib/contexts/UnifiedCartContext';
import { RTLProvider } from '../../components/RTLProvider';
import StoreProvider from '../../components/providers/StoreProvider';
import ThemeProvider from '../../components/ThemeProvider';
import { ToastProvider } from '../../lib/contexts/ToastContext';

export default function ClientLayout({ children, locale }: { children: ReactNode; locale: string }) {
  const isRTL = locale === 'fa';
  return (
    <ThemeProvider isRTL={isRTL} locale={locale}>
      <RTLProvider>
        <AuthProvider>
          <UnifiedCartProvider>
            <StoreProvider>
              <Navbar />
              <ToastProvider>
                <main className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white rtl:text-right ltr:text-left px-2 md:px-4 lg:px-8">
                  {children}
                </main>
              </ToastProvider>
            </StoreProvider>
          </UnifiedCartProvider>
        </AuthProvider>
      </RTLProvider>
    </ThemeProvider>
  );
} 