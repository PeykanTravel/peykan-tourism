'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Package, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTransferBookingStore } from '@/lib/stores/transferBookingStore';
import { useTransferOptions } from '@/lib/hooks/useTransfers';
import { useCurrency } from '@/lib/currency-context';

interface OptionsSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export default function OptionsSelection({ onNext, onBack }: OptionsSelectionProps) {
  const t = useTranslations('transfers');
  const { currency, convertCurrency } = useCurrency();
  
  // Get booking state from store
  const {
    route_data,
    vehicle_type,
    selected_options,
    setOptions,
    isStepValid,
  } = useTransferBookingStore();

  // Helper function to format price with currency
  const formatPrice = (amount: number, fromCurrency: string = 'USD') => {
    const convertedAmount = convertCurrency(amount, fromCurrency, currency);
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'TRY': '₺',
      'IRR': 'ریال',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${convertedAmount.toFixed(2)}`;
  };

  // Fetch options from API
  const { data: optionsResponse, error: optionsError, isLoading: optionsLoading } = useTransferOptions();
  
  // Local state for form inputs
  const [localSelectedOptions, setLocalSelectedOptions] = useState(
    selected_options || []
  );
  const [availableOptions, setAvailableOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get available options from API
  useEffect(() => {
    if (optionsResponse?.results) {
      setAvailableOptions(optionsResponse.results);
    }
    setLoading(false);
  }, [optionsResponse]);

  // Handle option selection (checkbox style)
  const handleOptionToggle = (optionId: string) => {
    const existingIndex = localSelectedOptions.findIndex(opt => opt.option_id === optionId);
    const newSelectedOptions = [...localSelectedOptions];
    
    if (existingIndex >= 0) {
      // Remove option if already selected
      newSelectedOptions.splice(existingIndex, 1);
    } else {
      // Find the option details from available options
      const optionDetails = availableOptions.find(opt => opt.id === optionId);
      
      // Add option with complete details
      newSelectedOptions.push({ 
        option_id: optionId, 
        quantity: 1,
        name: optionDetails?.name,
        price: optionDetails?.price ? parseFloat(optionDetails.price) : undefined,
        description: optionDetails?.description
      });
    }
    
    setLocalSelectedOptions(newSelectedOptions);
    setOptions(newSelectedOptions);
  };

  // Check if option is selected
  const isOptionSelected = (optionId: string) => {
    return localSelectedOptions.some(opt => opt.option_id === optionId);
  };

  // Handle next step
  const handleNext = () => {
    if (isStepValid('options')) {
      onNext();
    }
  };

  // Check if form is valid
  const isValid = isStepValid('options');

  if (!route_data || !vehicle_type) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('selectOptions')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('step5')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('noVehicleSelected')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('pleaseSelectVehicleFirst')}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('backToVehicleSelection')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('selectOptions')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('step5')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('selectOptions')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {t('step5')}
        </p>
        
        {/* Route and Vehicle Info */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
            <span className="font-medium">{route_data.origin}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{route_data.destination}</span>
          </div>
          <div className="text-sm text-blue-700">
            {t('vehicle')}: {vehicle_type}
          </div>
        </div>
      </div>

      {/* Available Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('availableOptions')}
        </h3>

        {availableOptions.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('noOptionsAvailable')}
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              {t('noOptionsDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableOptions.map((option) => {
              const isSelected = isOptionSelected(option.id);
              
              return (
                <div
                  key={option.id}
                  className={`
                    p-4 border rounded-lg transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{option.name}</h4>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{option.description}</p>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(parseFloat(option.price))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => handleOptionToggle(option.id)}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-colors
                          ${isSelected
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-300'
                          }
                        `}
                      >
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-current rounded-sm"></div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Options Summary */}
      {localSelectedOptions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('selectedOptions')}
          </h3>
          
          <div className="space-y-3">
            {localSelectedOptions.map((selectedOption) => {
              const option = availableOptions.find(opt => opt.id === selectedOption.option_id);
              if (!option) return null;
              
              return (
                <div key={selectedOption.option_id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium">{option.name}</span>
                  </div>
                  <span className="font-medium">
                    {formatPrice(parseFloat(option.price))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('previous')}
          </button>
          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {t('next')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 