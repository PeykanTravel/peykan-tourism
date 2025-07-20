'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface CurrencyState {
  currency: string;
  setCurrency: (currency: string) => void;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

const CurrencyContext = createContext<CurrencyState | undefined>(undefined);

// Exchange rates (mock data - in production this would come from an API)
const EXCHANGE_RATES = {
  USD: 1.0,
  EUR: 0.85,
  TRY: 30.5,
  IRR: 500000, // 1 USD = 500,000 IRR (approximate)
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('USD');

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && EXCHANGE_RATES[savedCurrency as keyof typeof EXCHANGE_RATES]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: string) => {
    if (EXCHANGE_RATES[newCurrency as keyof typeof EXCHANGE_RATES]) {
      setCurrencyState(newCurrency);
      localStorage.setItem('selectedCurrency', newCurrency);
    }
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    // Handle same currency
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Handle zero amount
    if (amount === 0) {
      return 0;
    }

    // Get exchange rates
    const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES] || 1;
    const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES] || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  };

  const value: CurrencyState = {
    currency,
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