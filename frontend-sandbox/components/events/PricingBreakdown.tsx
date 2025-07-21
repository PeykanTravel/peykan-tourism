'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Calculator, 
  Tag, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Percent, 
  DollarSign,
  Receipt,
  TrendingDown,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { EventPricingBreakdown } from '@/lib/types/api';
import { PriceDisplay } from '@/components/ui/Price';

interface PricingBreakdownProps {
  breakdown: EventPricingBreakdown | null;
  isLoading?: boolean;
  discountCode?: string;
  onDiscountCodeChange?: (code: string) => void;
  onApplyDiscount?: () => void;
  onRemoveDiscount?: (discountIndex: number) => void;
  formatPrice: (price: number, currency: string) => string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

export default function PricingBreakdown({
  breakdown,
  isLoading = false,
  discountCode = '',
  onDiscountCodeChange,
  onApplyDiscount,
  onRemoveDiscount,
  formatPrice,
  showDetails = false,
  onToggleDetails
}: PricingBreakdownProps) {
  const t = useTranslations('pricing');
  const [expandedSections, setExpandedSections] = useState<{
    options: boolean;
    discounts: boolean;
    fees: boolean;
    taxes: boolean;
  }>({
    options: false,
    discounts: false,
    fees: false,
    taxes: false
  });

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const totalSavings = useMemo(() => {
    if (!breakdown) return 0;
    return breakdown.discounts.reduce((sum, discount) => sum + discount.amount, 0);
  }, [breakdown]);

  const totalExtras = useMemo(() => {
    if (!breakdown) return 0;
    return breakdown.fees_total + breakdown.taxes_total;
  }, [breakdown]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
        <Calculator className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noPricingData')}</h3>
        <p className="text-gray-600 dark:text-gray-300">{t('selectSeatsForPricing')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('pricingBreakdown')}</h3>
          </div>
          
          {onToggleDetails && (
            <button
              onClick={onToggleDetails}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              {showDetails ? t('hideDetails') : t('showDetails')}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Base Price */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>{t('basePrice')}</span>
            <span><PriceDisplay amount={breakdown.base_price} currency="USD" /> × {breakdown.quantity}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{t('subtotal')}</span>
            <span><PriceDisplay amount={breakdown.subtotal} currency="USD" /></span>
          </div>
        </div>

        {/* Options */}
        {breakdown.options.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mb-4">
            <button
              onClick={() => toggleSection('options')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-white">{t('addOns')}</span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                  ({breakdown.options.length} {breakdown.options.length === 1 ? t('item') : t('items')})
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-white mr-2">
                  <PriceDisplay amount={breakdown.options_total} currency="USD" />
                </span>
                <TrendingDown 
                  className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${
                    expandedSections.options ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
            
            {expandedSections.options && (
              <div className="mt-3 pl-4 space-y-2">
                {breakdown.options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-900 dark:text-white">{option.name}</span>
                      <span className="text-gray-600 dark:text-gray-300 ml-2">
                        (<PriceDisplay amount={option.price} currency="USD" /> × {option.quantity})
                      </span>
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      <PriceDisplay amount={option.total} currency="USD" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discounts */}
        {breakdown.discounts.length > 0 && (
          <div className="border-t pt-4 mb-4">
            <button
              onClick={() => toggleSection('discounts')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <span className="font-medium text-green-700">{t('discounts')}</span>
                <span className="ml-2 text-sm text-green-600">
                  ({breakdown.discounts.length} {breakdown.discounts.length === 1 ? t('applied') : t('applied')})
                </span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-green-700 mr-2">
                  -<PriceDisplay amount={breakdown.discount_total} currency="USD" />
                </span>
                <TrendingDown 
                  className={`h-4 w-4 text-green-500 transition-transform ${
                    expandedSections.discounts ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
            
            {expandedSections.discounts && (
              <div className="mt-3 pl-4 space-y-2">
                {breakdown.discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-gray-900">{discount.name}</span>
                      {discount.percentage && (
                        <span className="text-green-600 ml-2">
                          ({discount.percentage}%)
                        </span>
                      )}
                      {onRemoveDiscount && (
                        <button
                          onClick={() => onRemoveDiscount(index)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                        >
                          {t('remove')}
                        </button>
                      )}
                    </div>
                    <span className="text-green-700 font-medium">
                      -<PriceDisplay amount={discount.amount} currency="USD" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discount Code Input */}
        {onDiscountCodeChange && onApplyDiscount && (
          <div className="border-t pt-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t('enterDiscountCode')}
                  value={discountCode}
                  onChange={(e) => onDiscountCodeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <button
                onClick={onApplyDiscount}
                disabled={!discountCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {t('apply')}
              </button>
            </div>
          </div>
        )}

        {/* Fees */}
        {breakdown.fees.length > 0 && (
          <div className="border-t pt-4 mb-4">
            <button
              onClick={() => toggleSection('fees')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{t('fees')}</span>
                <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-2">
                  <PriceDisplay amount={breakdown.fees_total} currency="USD" />
                </span>
                <TrendingDown 
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    expandedSections.fees ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
            
            {expandedSections.fees && (
              <div className="mt-3 pl-4 space-y-2">
                {breakdown.fees.map((fee, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-900">{fee.name}</span>
                      <span className="text-gray-600 ml-2">({fee.type})</span>
                    </div>
                    <span className="text-gray-900">
                      <PriceDisplay amount={fee.amount} currency="USD" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Taxes */}
        {breakdown.taxes.length > 0 && (
          <div className="border-t pt-4 mb-4">
            <button
              onClick={() => toggleSection('taxes')}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <span className="font-medium text-gray-900">{t('taxes')}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-2">
                  <PriceDisplay amount={breakdown.taxes_total} currency="USD" />
                </span>
                <TrendingDown 
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    expandedSections.taxes ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
            
            {expandedSections.taxes && (
              <div className="mt-3 pl-4 space-y-2">
                {breakdown.taxes.map((tax, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-900">{tax.name}</span>
                      <span className="text-gray-600 ml-2">({tax.type})</span>
                    </div>
                    <span className="text-gray-900">
                      <PriceDisplay amount={tax.amount} currency="USD" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Cards */}
        {(totalSavings > 0 || totalExtras > 0) && (
          <div className="border-t pt-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {totalSavings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800">{t('totalSavings')}</span>
                  </div>
                  <div className="text-lg font-bold text-green-700 mt-1">
                    <PriceDisplay amount={totalSavings} currency="USD" />
                  </div>
                </div>
              )}
              
              {totalExtras > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-blue-800">{t('feesAndTaxes')}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-700 mt-1">
                    <PriceDisplay amount={totalExtras} currency="USD" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Total */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold text-gray-900">{t('total')}</span>
              <div className="text-sm text-gray-600">
                {t('allFeesIncluded')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                <PriceDisplay amount={breakdown.final_price} currency="USD" />
              </div>
              {totalSavings > 0 && (
                <div className="text-sm text-green-600">
                  {t('youSave')} <PriceDisplay amount={totalSavings} currency="USD" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Security Notice */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">{t('securePayment')}</p>
              <p>{t('paymentSecurityNotice')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 