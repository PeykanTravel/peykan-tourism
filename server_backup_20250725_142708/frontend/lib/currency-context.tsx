'use client';
import { createContext, useContext, ReactNode } from 'react';

interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

const CurrencyContext = createContext<CurrencyState | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const setCurrency = (currency: string) => {
    // Mock implementation - will be implemented later
    console.log('Set currency:', currency);
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string) => {
    // Mock conversion - will be implemented later
    return amount;
  };

  const value: CurrencyState = {
    currency: 'USD',
    setCurrency,
    convertCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
} 