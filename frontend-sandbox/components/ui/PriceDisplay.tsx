'use client';

import React from 'react';
import { useCurrencyLanguage } from '@/lib/hooks/useCurrencyLanguage';

interface PriceDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showCurrency?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'highlight' | 'muted';
}

export function PriceDisplay({ 
  amount, 
  currency = 'USD', 
  className = '',
  showCurrency = true,
  size = 'md',
  variant = 'default'
}: PriceDisplayProps) {
  const { currentCurrency: userCurrency, convertPrice } = useCurrencyLanguage();
  
  // For now, use simple conversion (will be improved with API integration)
  const convertedAmount = currency === userCurrency ? amount : amount * 1.1; // Simple fallback
  
  // Currency symbols
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'TRY': '₺',
    'IRR': 'ریال',
  };
  
  const symbol = currencySymbols[userCurrency] || userCurrency;
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };
  
  // Variant classes
  const variantClasses = {
    default: 'text-gray-900 dark:text-white',
    highlight: 'text-blue-600 dark:text-blue-400 font-semibold',
    muted: 'text-gray-500 dark:text-gray-400'
  };
  
  return (
    <span className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {showCurrency && symbol}
      {convertedAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}
    </span>
  );
}

// Component for showing price breakdown
interface PriceBreakdownProps {
  items: Array<{
    label: string;
    amount: number;
    currency?: string;
  }>;
  total: number;
  currency?: string;
  className?: string;
}

export function PriceBreakdown({ items, total, currency = 'USD', className = '' }: PriceBreakdownProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
          <PriceDisplay 
            amount={item.amount} 
            currency={item.currency || currency}
            size="sm"
          />
        </div>
      ))}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
        <div className="flex justify-between items-center font-semibold">
          <span>مجموع</span>
          <PriceDisplay 
            amount={total} 
            currency={currency}
            size="md"
            variant="highlight"
          />
        </div>
      </div>
    </div>
  );
} 