'use client';
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Supported currencies with symbols and formatting
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  TRY: { symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  IRR: { symbol: 'ریال', name: 'Iranian Rial', locale: 'fa-IR' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Exchange rates (in real app, these would come from an API)
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 0.85,
  TRY: 28.5,
  IRR: 420000, // Approximate rate
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  convertCurrency: (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => number;
  formatPrice: (amount: number, currency?: CurrencyCode) => string;
  getCurrencySymbol: (currency?: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyState | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferred_currency') as CurrencyCode;
    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred_currency', newCurrency);
  };

  const convertCurrency = (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
    return usdAmount * EXCHANGE_RATES[toCurrency];
  };

  const formatPrice = (amount: number, targetCurrency?: CurrencyCode): string => {
    const currencyToUse = targetCurrency || currency;
    const currencyInfo = SUPPORTED_CURRENCIES[currencyToUse];

    if (currencyToUse === 'IRR') {
      // Special formatting for Iranian Rial
      const formattedAmount = new Intl.NumberFormat('fa-IR').format(Math.round(amount));
      return `${currencyInfo.symbol} ${formattedAmount}`;
    }

    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyToUse,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCurrencySymbol = (targetCurrency?: CurrencyCode): string => {
    const currencyToUse = targetCurrency || currency;
    return SUPPORTED_CURRENCIES[currencyToUse].symbol;
  };

  const value: CurrencyState = {
    currency,
    setCurrency,
    convertCurrency,
    formatPrice,
    getCurrencySymbol,
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