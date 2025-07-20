'use client';

import React, { useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCurrency } from '../lib/stores/currencyStore';
import { Button } from './ui/Button';

export default function CurrencySelector() {
  const {
    currentCurrency,
    supportedCurrencies,
    setCurrency,
    isLoading,
    error,
    initialize
  } = useCurrency();

  // Initialize currency store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleCurrencyChange = async (currency: string) => {
    if (currency !== currentCurrency) {
      await setCurrency(currency);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  // Error state
  if (error) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-red-500"
        onClick={() => initialize()}
      >
        <span>Error</span>
        <ChevronDown className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <span className="font-medium">
          {supportedCurrencies.find(c => c.currency_code === currentCurrency)?.symbol || '$'}
        </span>
        <span className="text-xs">
          {currentCurrency}
        </span>
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </Button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {supportedCurrencies.map((currency) => (
          <button
            key={currency.currency_code}
            onClick={() => handleCurrencyChange(currency.currency_code)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              currency.currency_code === currentCurrency
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="font-medium">{currency.symbol}</span>
            <span className="flex-1 text-left">{currency.currency_name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currency.currency_code}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 