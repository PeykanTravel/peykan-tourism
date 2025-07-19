/**
 * Tour Variant Selector Component
 * 
 * Component for selecting tour variants/packages
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Check, Star } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TourVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  max_participants: number;
  includes: string[];
  excludes: string[];
}

interface TourVariantSelectorProps {
  variants: TourVariant[];
  selectedVariantId: string | null;
  onVariantSelect: (variantId: string) => void;
}

export default function TourVariantSelector({
  variants,
  selectedVariantId,
  onVariantSelect,
}: TourVariantSelectorProps) {
  const t = useTranslations('tourVariantSelector');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;

            return (
              <div
                key={variant.id}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => onVariantSelect(variant.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-neutral-900">{variant.name}</h4>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{variant.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Includes */}
                      <div>
                        <h5 className="text-sm font-medium text-success-700 mb-2 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          {t('includes')}
                        </h5>
                        <ul className="space-y-1">
                          {variant.includes.map((item, index) => (
                            <li key={index} className="text-sm text-neutral-600 flex items-center">
                              <div className="w-1 h-1 bg-success-500 rounded-full mr-2"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Excludes */}
                      <div>
                        <h5 className="text-sm font-medium text-neutral-700 mb-2">
                          {t('excludes')}
                        </h5>
                        <ul className="space-y-1">
                          {variant.excludes.map((item, index) => (
                            <li key={index} className="text-sm text-neutral-600 flex items-center">
                              <div className="w-1 h-1 bg-neutral-400 rounded-full mr-2"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      ${variant.price}
                    </div>
                    <div className="text-sm text-neutral-500 mb-2">
                      {t('perPerson')}
                    </div>
                    <div className="text-sm text-neutral-600 mb-3">
                      {variant.duration}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {t('maxParticipants')}: {variant.max_participants}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-700 font-medium">
                        {t('selected')}
                      </span>
                      <Button size="sm" variant="outline">
                        {t('change')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedVariantId && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-700">
                  {t('selectedVariant')}
                </h4>
                <p className="text-sm text-primary-600">
                  {variants.find(v => v.id === selectedVariantId)?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-600">
                  ${variants.find(v => v.id === selectedVariantId)?.price}
                </div>
                <div className="text-sm text-primary-500">
                  {t('perPerson')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 