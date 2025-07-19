'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Tag, CreditCard, Receipt } from 'lucide-react';
import { EventPricingBreakdown } from '@/lib/types/api';

interface PricingBreakdownProps {
  pricing: EventPricingBreakdown;
}

export default function PricingBreakdown({ pricing }: PricingBreakdownProps) {
  const t = useTranslations('eventDetail');
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('pricingBreakdown')}</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4" />
              <span className="text-sm">{t('hideDetails')}</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              <span className="text-sm">{t('showDetails')}</span>
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span>{t('tickets')}</span>
          </div>
          <span>{formatPrice(pricing.subtotal, pricing.currency)}</span>
        </div>

        {pricing.options_total > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="h-4 w-4 text-gray-500" />
              <span>{t('options')}</span>
            </div>
            <span>{formatPrice(pricing.options_total, pricing.currency)}</span>
          </div>
        )}

        {pricing.fees_total > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span>{t('fees')}</span>
            </div>
            <span>{formatPrice(pricing.fees_total, pricing.currency)}</span>
          </div>
        )}

        {pricing.discount_total > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>{t('discount')}</span>
            <span>-{formatPrice(pricing.discount_total, pricing.currency)}</span>
          </div>
        )}

        <div className="border-t pt-3">
          <div className="flex items-center justify-between font-semibold text-lg">
            <span>{t('total')}</span>
            <span>{formatPrice(pricing.final_price, pricing.currency)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium mb-4">{t('detailedBreakdown')}</h4>
          
          <div className="space-y-4">
            {/* Base Price */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2">{t('basePrice')}</h5>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('pricePerTicket')}</span>
                  <span>{formatPrice(pricing.base_price, pricing.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('quantity')}</span>
                  <span>{pricing.quantity}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(pricing.subtotal, pricing.currency)}</span>
                </div>
              </div>
            </div>

            {/* Options */}
            {pricing.options && pricing.options.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{t('selectedOptions')}</h5>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  {pricing.options.map((option, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{option.name} × {option.quantity}</span>
                      <span>{formatPrice(option.price * option.quantity, pricing.currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('optionsTotal')}</span>
                    <span>{formatPrice(pricing.options_total, pricing.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fees */}
            {pricing.fees && pricing.fees.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{t('feesAndCharges')}</h5>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  {pricing.fees.map((fee, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{fee.name}</span>
                      <span>{formatPrice(fee.amount, pricing.currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('feesTotal')}</span>
                    <span>{formatPrice(pricing.fees_total, pricing.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Discounts */}
            {pricing.discounts && pricing.discounts.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{t('discounts')}</h5>
                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  {pricing.discounts.map((discount, index) => (
                    <div key={index} className="flex justify-between text-sm text-green-700">
                      <span>{discount.name}</span>
                      <span>-{formatPrice(discount.amount, pricing.currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium pt-2 border-t border-green-200 text-green-700">
                    <span>{t('discountTotal')}</span>
                    <span>-{formatPrice(pricing.discount_total, pricing.currency)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <p>{t('pricingIncludes')}</p>
          <p>{t('allPricesIncludeTaxes')}</p>
          <p>{t('pricesSubjectToChange')}</p>
        </div>
      </div>
    </div>
  );
} 