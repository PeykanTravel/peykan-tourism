/**
 * Dynamic Price Component for currency conversion and formatting.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../lib/stores/currencyStore';

interface PriceProps {
  amount: number;
  originalCurrency?: string;
  showOriginal?: boolean;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
}

export default function Price({ 
  amount, 
  originalCurrency = 'USD', 
  showOriginal = false, 
  className = '',
  loadingClassName = 'text-gray-400',
  errorClassName = 'text-red-500'
}: PriceProps) {
  const { 
    currentCurrency, 
    convertPrice, 
    formatPrice, 
    isLoading, 
    error 
  } = useCurrency();
  
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [formattedPrice, setFormattedPrice] = useState<string>('');
  const [originalFormatted, setOriginalFormatted] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Convert and format price
  useEffect(() => {
    const convertAndFormat = async () => {
      if (amount === 0) {
        setConvertedAmount(0);
        setFormattedPrice('0');
        return;
      }

      try {
        setIsConverting(true);
        setConversionError(null);

        // Convert currency if needed
        let finalAmount = amount;
        if (originalCurrency !== currentCurrency) {
          finalAmount = await convertPrice(amount, originalCurrency, currentCurrency);
        }
        
        setConvertedAmount(finalAmount);

        // Format the converted price
        const formatted = await formatPrice(finalAmount, currentCurrency);
        setFormattedPrice(formatted);

        // Format original price if needed
        if (showOriginal && originalCurrency !== currentCurrency) {
          const originalFormatted = await formatPrice(amount, originalCurrency);
          setOriginalFormatted(originalFormatted);
        }
      } catch (error) {
        console.error('Price conversion error:', error);
        setConversionError('Price conversion failed');
        // Fallback to original amount
        setFormattedPrice(new Intl.NumberFormat('en', {
          style: 'currency',
          currency: currentCurrency
        }).format(amount));
      } finally {
        setIsConverting(false);
      }
    };

    convertAndFormat();
  }, [amount, originalCurrency, currentCurrency, showOriginal, convertPrice, formatPrice]);

  // Loading state
  if (isLoading || isConverting) {
    return (
      <span className={`${className} ${loadingClassName}`}>
        <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse"></span>
      </span>
    );
  }

  // Error state
  if (conversionError || error) {
    return (
      <span className={`${className} ${errorClassName}`}>
        {new Intl.NumberFormat('en', {
          style: 'currency',
          currency: originalCurrency
        }).format(amount)}
      </span>
    );
  }

  return (
    <span className={className}>
      {formattedPrice}
      {showOriginal && originalCurrency !== currentCurrency && originalFormatted && (
        <span className="text-sm text-gray-500 ml-2">
          ({originalFormatted})
        </span>
      )}
    </span>
  );
}

// Export convenience components
export const PriceDisplay = ({ 
  amount, 
  currency = 'USD', 
  className = '' 
}: { 
  amount: number; 
  currency?: string; 
  className?: string; 
}) => (
  <Price 
    amount={amount} 
    originalCurrency={currency} 
    className={className} 
  />
);

export const PriceWithOriginal = ({ 
  amount, 
  currency = 'USD', 
  className = '' 
}: { 
  amount: number; 
  currency?: string; 
  className?: string; 
}) => (
  <Price 
    amount={amount} 
    originalCurrency={currency} 
    showOriginal={true} 
    className={className} 
  />
); 