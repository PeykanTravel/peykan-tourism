/**
 * Options Selector Component
 * 
 * Component for selecting additional options for events
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Plus, Minus } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface EventOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'addon' | 'upgrade';
  max_quantity?: number;
}

interface OptionsSelectorProps {
  eventId: string;
  onOptionsSelected: (options: { optionId: string; quantity: number }[]) => void;
}

export default function OptionsSelector({ 
  eventId, 
  onOptionsSelected 
}: OptionsSelectorProps) {
  const t = useTranslations('optionsSelector');
  const [options, setOptions] = useState<EventOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOptions();
  }, [eventId]);

  useEffect(() => {
    const selectedArray = Object.entries(selectedOptions)
      .filter(([_, quantity]) => quantity > 0)
      .map(([optionId, quantity]) => ({ optionId, quantity }));
    onOptionsSelected(selectedArray);
  }, [selectedOptions, onOptionsSelected]);

  const fetchOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock data for demo
      const mockOptions: EventOption[] = [
        {
          id: '1',
          name: 'Premium Seating',
          description: 'Upgrade to premium seating with better view and comfort',
          price: 25,
          type: 'upgrade',
          max_quantity: 1,
        },
        {
          id: '2',
          name: 'Program Booklet',
          description: 'Get a detailed program booklet with artist information',
          price: 10,
          type: 'addon',
          max_quantity: 5,
        },
        {
          id: '3',
          name: 'Refreshments Package',
          description: 'Includes drinks and snacks during intermission',
          price: 15,
          type: 'addon',
          max_quantity: 3,
        },
        {
          id: '4',
          name: 'Meet & Greet',
          description: 'Exclusive meet and greet session with the artists',
          price: 50,
          type: 'addon',
          max_quantity: 2,
        },
        {
          id: '5',
          name: 'Parking Pass',
          description: 'Reserved parking spot at the venue',
          price: 8,
          type: 'addon',
          max_quantity: 1,
        },
      ];

      setOptions(mockOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions(prev => {
      const currentQuantity = prev[optionId] || 0;
      const option = options.find(opt => opt.id === optionId);
      
      if (!option) return prev;

      if (currentQuantity === 0) {
        return { ...prev, [optionId]: 1 };
      } else {
        const newQuantity = currentQuantity - 1;
        if (newQuantity === 0) {
          const { [optionId]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [optionId]: newQuantity };
      }
    });
  };

  const handleQuantityChange = (optionId: string, newQuantity: number) => {
    const option = options.find(opt => opt.id === optionId);
    if (!option) return;

    const maxQuantity = option.max_quantity || 10;
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    setSelectedOptions(prev => {
      if (clampedQuantity === 0) {
        const { [optionId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [optionId]: clampedQuantity };
    });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedOptions).reduce((total, [optionId, quantity]) => {
      const option = options.find(opt => opt.id === optionId);
      return total + (option?.price || 0) * quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-error-600">
            <p>{error}</p>
            <Button onClick={fetchOptions} className="mt-4">
              {t('retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (options.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-neutral-500">{t('noOptions')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {options.map(option => {
            const quantity = selectedOptions[option.id] || 0;
            const isSelected = quantity > 0;

            return (
              <div
                key={option.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-neutral-900">{option.name}</h4>
                      {option.type === 'upgrade' && (
                        <span className="px-2 py-1 text-xs bg-warning-100 text-warning-700 rounded">
                          {t('upgrade')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mt-1">{option.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-semibold text-primary-600">
                        ${option.price}
                      </span>
                      {option.max_quantity && option.max_quantity > 1 && (
                        <span className="text-xs text-neutral-500">
                          {t('maxQuantity')}: {option.max_quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {option.max_quantity && option.max_quantity > 1 ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(option.id, quantity - 1)}
                          disabled={quantity === 0}
                          className="p-1 rounded-full hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(option.id, quantity + 1)}
                          disabled={quantity >= option.max_quantity}
                          className="p-1 rounded-full hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleOptionToggle(option.id)}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            {t('selected')}
                          </>
                        ) : (
                          t('select')
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <div className="flex justify-between text-sm">
                      <span>{t('subtotal')}</span>
                      <span className="font-medium">${option.price * quantity}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {Object.keys(selectedOptions).length > 0 && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              {t('selectedOptions')}
            </h4>
            <div className="space-y-2">
              {Object.entries(selectedOptions).map(([optionId, quantity]) => {
                const option = options.find(opt => opt.id === optionId);
                if (!option) return null;

                return (
                  <div key={optionId} className="flex justify-between text-sm">
                    <span>
                      {option.name} {quantity > 1 && `× ${quantity}`}
                    </span>
                    <span>${option.price * quantity}</span>
                  </div>
                );
              })}
              <hr className="my-2" />
              <div className="flex justify-between font-medium">
                <span>{t('total')}</span>
                <span>${getTotalPrice()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 