'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Plus, Minus, Package } from 'lucide-react';

interface TransferOption {
  id: string;
  name: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'percentage';
  max_quantity: number | null;
}

interface OptionsSelectionProps {
  onSubmit: (data: Array<{
    option_id: string;
    quantity: number;
    name: string;
    price: number;
  }>) => void;
  onBack: () => void;
  options: TransferOption[];
  initialData?: Array<{
    option_id: string;
    quantity: number;
  }>;
}

export default function OptionsSelection({ onSubmit, onBack, options, initialData }: OptionsSelectionProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    initialData?.forEach(item => {
      initial[item.option_id] = item.quantity;
    });
    return initial;
  });

  const handleQuantityChange = (optionId: string, change: number) => {
    const currentQuantity = selectedOptions[optionId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    const option = options.find(opt => opt.id === optionId);
    if (option && option.max_quantity && newQuantity > option.max_quantity) {
      return; // Don't exceed max quantity
    }
    
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: newQuantity
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedOptionsArray = Object.entries(selectedOptions)
      .filter(([_, quantity]) => quantity > 0)
      .map(([optionId, quantity]) => {
        const option = options.find(opt => opt.id === optionId);
        return {
          option_id: optionId,
          quantity,
          name: option?.name || '',
          price: option?.price || 0
        };
      });
    
    onSubmit(selectedOptionsArray);
  };

  const formatPrice = (price: number) => {
    const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('additionalOptions')}
        </h2>
        <p className="text-gray-600">
          {t('step5')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {options.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noOptionsAvailable')}
            </h3>
            <p className="text-gray-600">
              {t('noOptionsAvailableDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {options.map((option) => {
              const quantity = selectedOptions[option.id] || 0;
              const isMaxReached = option.max_quantity && quantity >= option.max_quantity;
              
              return (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{option.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg font-semibold text-blue-600">
                          {formatPrice(option.price)}
                        </span>
                        {option.price_type === 'percentage' && (
                          <span className="text-sm text-gray-500 ml-2">%</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(option.id, -1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(option.id, 1)}
                        disabled={!!isMaxReached}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {option.max_quantity && (
                    <p className="text-xs text-gray-500">
                      {t('maxQuantity')}: {option.max_quantity}
                    </p>
                  )}
                  
                  {quantity > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t('subtotal')}:</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(option.price * quantity)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('previous')}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('next')}
          </button>
        </div>
      </form>
    </div>
  );
} 