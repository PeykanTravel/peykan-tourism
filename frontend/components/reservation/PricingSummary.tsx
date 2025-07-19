'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/lib/utils';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface PricingItem {
  label: string;
  amount: number;
  currency: string;
  quantity?: number;
  unitPrice?: number;
  isDiscount?: boolean;
  isTax?: boolean;
}

interface PricingSummaryProps {
  items: PricingItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  discountAmount?: number;
  discountCode?: string;
  showBreakdown?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onApplyDiscount?: (code: string) => void;
}

export default function PricingSummary({
  items,
  subtotal,
  taxAmount,
  totalAmount,
  currency,
  discountAmount = 0,
  discountCode,
  showBreakdown = true,
  isLoading = false,
  error,
  onApplyDiscount
}: PricingSummaryProps) {
  const t = useTranslations('pricing');
  const [discountInput, setDiscountInput] = React.useState('');

  const formatPrice = (amount: number, currencyCode: string) => {
    return formatCurrency(amount, currencyCode);
  };

  const handleApplyDiscount = () => {
    if (discountInput.trim() && onApplyDiscount) {
      onApplyDiscount(discountInput.trim());
      setDiscountInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('pricingSummary')}
      </h3>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-800 dark:text-red-200">
              {error}
            </span>
          </div>
        </div>
      )}

      {/* Items Breakdown */}
      {showBreakdown && (
        <div className="space-y-3 mb-4">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
                {item.quantity && item.unitPrice && (
                  <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                    ({item.quantity} × {formatPrice(item.unitPrice, item.currency)})
                  </span>
                )}
              </div>
              <span className={`text-sm font-medium ${
                item.isDiscount 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {item.isDiscount ? '-' : ''}{formatPrice(item.amount, item.currency)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Discount Code */}
      {onApplyDiscount && (
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder={t('enterDiscountCode')}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleApplyDiscount}
              disabled={!discountInput.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {t('apply')}
            </button>
          </div>
          {discountCode && (
            <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              {t('discountApplied')}: {discountCode}
            </div>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatPrice(subtotal, currency)}
          </span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">{t('discount')}</span>
            <span className="text-green-600 dark:text-green-400 font-medium">
              -{formatPrice(discountAmount, currency)}
            </span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('tax')}</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatPrice(taxAmount, currency)}
          </span>
        </div>
        
        <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
          <span className="text-gray-900 dark:text-white">{t('total')}</span>
          <span className="text-gray-900 dark:text-white">
            {formatPrice(totalAmount, currency)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">{t('pricingNote')}</p>
            <p>{t('pricingNoteDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 