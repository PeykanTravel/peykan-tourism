'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { DollarSign, Users, Package, Plus } from 'lucide-react';

interface PriceDisplayProps {
  totalPrice: number;
  currency: string;
  breakdown?: {
    adult?: number;
    child?: number;
    infant?: number;
    options?: number;
  };
  participants?: {
    adult: number;
    child: number;
    infant: number;
  };
  selectedVariant?: any;
  selectedOptions?: string[];
  productOptions?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export default function PriceDisplay({
  totalPrice,
  currency,
  breakdown,
  participants,
  selectedVariant,
  selectedOptions,
  productOptions
}: PriceDisplayProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getAgeGroupLabel = (type: string) => {
    switch (type) {
      case 'adult': return 'بزرگسال';
      case 'child': return 'کودک';
      case 'infant': return 'نوزاد';
      default: return type;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            خلاصه قیمت
          </h3>
        </div>

        {/* Base Price */}
        {selectedVariant && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedVariant.name}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatPrice(selectedVariant.base_price)} {currency}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              قیمت پایه برای هر بزرگسال
            </div>
          </div>
        )}

        {/* Participants Breakdown */}
        {participants && breakdown && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>شرکت‌کنندگان</span>
            </h4>
            <div className="space-y-2">
              {participants.adult > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {getAgeGroupLabel('adult')} ({participants.adult} نفر)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(breakdown.adult || 0)} {currency}
                  </span>
                </div>
              )}
              {participants.child > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {getAgeGroupLabel('child')} ({participants.child} نفر)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(breakdown.child || 0)} {currency}
                  </span>
                </div>
              )}
              {participants.infant > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {getAgeGroupLabel('infant')} ({participants.infant} نفر)
                  </span>
                  <span className="font-medium text-green-600">
                    رایگان
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options Breakdown */}
        {selectedOptions && productOptions && selectedOptions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
              <Plus className="w-4 h-4" />
              <span>گزینه‌های اضافی</span>
            </h4>
            <div className="space-y-2">
              {selectedOptions.map((optionId) => {
                const option = productOptions.find(o => o.id === optionId);
                if (!option) return null;
                
                return (
                  <div key={optionId} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {option.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(option.price)} {currency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              قیمت کل
            </span>
            <span className="text-xl font-bold text-green-600">
              {formatPrice(totalPrice)} {currency}
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1 mb-1">
            <span>•</span>
            <span>قیمت‌ها شامل مالیات می‌باشد</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>•</span>
            <span>پرداخت در زمان رزرو انجام می‌شود</span>
          </div>
        </div>
      </div>
    </Card>
  );
} 