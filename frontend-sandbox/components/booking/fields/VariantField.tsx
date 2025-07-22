'use client';

import React, { useState } from 'react';
import { Package, Star, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  description: string;
  base_price: number;
  capacity: number;
  is_active: boolean;
  includes_transfer: boolean;
  includes_guide: boolean;
  includes_meal: boolean;
  includes_photographer: boolean;
  extended_hours: number;
  private_transfer: boolean;
  expert_guide: boolean;
  special_meal: boolean;
  pricing?: Array<{
    age_group: string;
    factor: number;
    is_free: boolean;
  }>;
}

interface VariantFieldProps {
  value?: string;
  onChange: (value: string) => void;
  product: any;
  error?: string;
}

export default function VariantField({ value, onChange, product, error }: VariantFieldProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  // Mock variants - in real app, this would come from product.variants
  const variants: Variant[] = [
    {
      id: 'eco',
      name: 'اقتصادی',
      description: 'تور با امکانات پایه و قیمت مناسب',
      base_price: 400000,
      capacity: 20,
      is_active: true,
      includes_transfer: true,
      includes_guide: true,
      includes_meal: false,
      includes_photographer: false,
      extended_hours: 0,
      private_transfer: false,
      expert_guide: false,
      special_meal: false,
      pricing: [
        { age_group: 'adult', factor: 1.0, is_free: false },
        { age_group: 'child', factor: 0.7, is_free: false },
        { age_group: 'infant', factor: 0.0, is_free: true }
      ]
    },
    {
      id: 'normal',
      name: 'عادی',
      description: 'تور با امکانات کامل و کیفیت بالا',
      base_price: 500000,
      capacity: 15,
      is_active: true,
      includes_transfer: true,
      includes_guide: true,
      includes_meal: true,
      includes_photographer: false,
      extended_hours: 0,
      private_transfer: false,
      expert_guide: false,
      special_meal: false,
      pricing: [
        { age_group: 'adult', factor: 1.0, is_free: false },
        { age_group: 'child', factor: 0.7, is_free: false },
        { age_group: 'infant', factor: 0.0, is_free: true }
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      description: 'تور لوکس با امکانات ویژه و خدمات شخصی',
      base_price: 800000,
      capacity: 8,
      is_active: true,
      includes_transfer: true,
      includes_guide: true,
      includes_meal: true,
      includes_photographer: true,
      extended_hours: 2,
      private_transfer: true,
      expert_guide: true,
      special_meal: true,
      pricing: [
        { age_group: 'adult', factor: 1.0, is_free: false },
        { age_group: 'child', factor: 0.8, is_free: false },
        { age_group: 'infant', factor: 0.0, is_free: true }
      ]
    }
  ];

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    onChange(variant.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'transfer':
        return '🚗';
      case 'guide':
        return '👨‍💼';
      case 'meal':
        return '🍽️';
      case 'photographer':
        return '📸';
      case 'private':
        return '👑';
      case 'expert':
        return '⭐';
      case 'extended':
        return '⏰';
      default:
        return '✓';
    }
  };

  const getFeatures = (variant: Variant) => {
    const features = [];
    
    if (variant.includes_transfer) {
      features.push({
        name: 'ترانسفر',
        icon: getFeatureIcon('transfer'),
        highlight: variant.private_transfer ? 'خصوصی' : ''
      });
    }
    
    if (variant.includes_guide) {
      features.push({
        name: 'راهنما',
        icon: getFeatureIcon('guide'),
        highlight: variant.expert_guide ? 'متخصص' : ''
      });
    }
    
    if (variant.includes_meal) {
      features.push({
        name: 'وعده غذایی',
        icon: getFeatureIcon('meal'),
        highlight: variant.special_meal ? 'ویژه' : ''
      });
    }
    
    if (variant.includes_photographer) {
      features.push({
        name: 'عکاس',
        icon: getFeatureIcon('photographer'),
        highlight: ''
      });
    }
    
    if (variant.extended_hours > 0) {
      features.push({
        name: `${variant.extended_hours} ساعت اضافی`,
        icon: getFeatureIcon('extended'),
        highlight: ''
      });
    }
    
    return features;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Package className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          انتخاب پکیج
        </span>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="grid gap-4">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => handleVariantSelect(variant)}
            className={`w-full text-left p-6 rounded-lg border transition-all duration-200 ${
              selectedVariant?.id === variant.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {variant.name}
                  </h3>
                  {variant.id === 'vip' && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">VIP</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {variant.description}
                </p>
                
                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  {getFeatures(variant).map((feature, index) => (
                    <div key={`feature-${variant.id}-${index}`} className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">{feature.icon}</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature.name}
                        {feature.highlight && (
                          <span className="text-blue-600 dark:text-blue-400 text-xs mr-1">
                            ({feature.highlight})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(variant.base_price)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  تومان
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    حداکثر {variant.capacity} نفر
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                قیمت بر اساس سن:
              </div>
              <div className="flex space-x-4 text-sm">
                {variant.pricing?.map((price) => (
                  <div key={`pricing-${variant.id}-${price.age_group}`} className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-gray-300">
                      {price.age_group === 'adult' ? 'بزرگسال' : 
                       price.age_group === 'child' ? 'کودک' : 'نوزاد'}:
                    </span>
                    {price.is_free ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">رایگان</span>
                    ) : (
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatPrice(variant.base_price * price.factor)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selection indicator */}
            {selectedVariant?.id === variant.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {variants.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>هیچ پکیجی برای این تور موجود نیست</p>
        </div>
      )}
    </div>
  );
} 