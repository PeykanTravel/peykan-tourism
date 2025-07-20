/**
 * Store Provider for initializing currency and language stores.
 */

'use client';

import React, { useEffect } from 'react';
import { useCurrencyStore } from '../../lib/stores/currencyStore';
import { useLanguageStore } from '../../lib/stores/languageStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const { initialize: initializeCurrency } = useCurrencyStore();
  const { initialize: initializeLanguage } = useLanguageStore();

  useEffect(() => {
    // Initialize stores on mount
    const initializeStores = async () => {
      try {
        await Promise.all([
          initializeCurrency(),
          initializeLanguage()
        ]);
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      }
    };

    initializeStores();
  }, [initializeCurrency, initializeLanguage]);

  return <>{children}</>;
} 