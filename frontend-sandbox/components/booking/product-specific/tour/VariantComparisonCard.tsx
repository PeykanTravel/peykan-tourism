'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Check, Star, Users, Clock, MapPin, Bus, User, Camera, Utensils, Loader2, AlertCircle } from 'lucide-react';
import { tourService, TourVariant } from '../../../../lib/services/tourService';
import { PriceDisplay } from '../../../ui/Price';

interface VariantComparisonCardProps {
  variants: TourVariant[];
  selectedVariant?: string;
  onVariantSelect: (variantId: string) => void;
  currency?: string;
  tourId?: string;
  tourSlug?: string;
}

export default function VariantComparisonCard({
  variants,
  selectedVariant,
  onVariantSelect,
  currency = 'USD',
  tourId,
  tourSlug
}: VariantComparisonCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingData, setPricingData] = useState<Record<string, any>>({});

  const fetchPricingData = useCallback(async () => {
    if (!tourSlug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tour details to get pricing information
      const tourDetails = await tourService.fetchTourDetails(tourSlug);
      
      // Extract pricing data for each variant
      const pricing: Record<string, any> = {};
      tourDetails.variants.forEach(variant => {
        pricing[variant.id] = {
          base_price: variant.base_price,
          pricing: variant.pricing,
          features: {
            transfer: variant.includes_transfer,
            guide: variant.includes_guide,
            meal: variant.includes_meal,
            photographer: variant.includes_photographer,
            private_transfer: variant.private_transfer,
            expert_guide: variant.expert_guide,
            special_meal: variant.special_meal,
            extended_hours: variant.extended_hours
          }
        };
      });
      
      setPricingData(pricing);
    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError('خطا در دریافت اطلاعات قیمت‌گذاری');
    } finally {
      setLoading(false);
    }
  }, [tourSlug]);

  // Fetch pricing data when variants change
  useEffect(() => {
    if (tourSlug && variants.length > 0) {
      fetchPricingData();
    }
  }, [tourSlug, variants, fetchPricingData]);

  const getAgeGroupLabel = (ageGroup: string) => {
    switch (ageGroup) {
      case 'adult': return 'بزرگسال';
      case 'child': return 'کودک';
      case 'infant': return 'نوزاد';
      default: return ageGroup;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'transfer': return <Bus className="w-4 h-4" />;
      case 'guide': return <User className="w-4 h-4" />;
      case 'meal': return <Utensils className="w-4 h-4" />;
      case 'photographer': return <Camera className="w-4 h-4" />;
      default: return <Check className="w-4 h-4" />;
    }
  };

  const getFeatureLabel = (feature: string) => {
    switch (feature) {
      case 'transfer': return 'ترانسفر';
      case 'guide': return 'راهنما';
      case 'meal': return 'وعده غذایی';
      case 'photographer': return 'عکاس';
      case 'private_transfer': return 'ترانسفر خصوصی';
      case 'expert_guide': return 'راهنمای متخصص';
      case 'special_meal': return 'وعده غذایی ویژه';
      case 'extended_hours': return 'ساعت‌های اضافی';
      default: return feature;
    }
  };

  const renderFeatures = (variant: TourVariant) => {
    const featureList = [];
    
    // Basic features
    if (variant.includes_transfer) featureList.push('transfer');
    if (variant.includes_guide) featureList.push('guide');
    if (variant.includes_meal) featureList.push('meal');
    if (variant.includes_photographer) featureList.push('photographer');
    
    // Premium features
    if (variant.private_transfer) featureList.push('private_transfer');
    if (variant.expert_guide) featureList.push('expert_guide');
    if (variant.special_meal) featureList.push('special_meal');
    if (variant.extended_hours > 0) featureList.push('extended_hours');
    
    return featureList.map(feature => (
      <div key={feature} className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-1">
        {getFeatureIcon(feature)}
        <span className="mr-1">{getFeatureLabel(feature)}</span>
        {feature === 'extended_hours' && variant.extended_hours > 0 && (
          <span className="text-blue-600">(+{variant.extended_hours}h)</span>
        )}
      </div>
    ));
  };

  const renderPricing = (variant: TourVariant) => {
    const pricing = variant.pricing || [];
    
    if (pricing.length === 0) {
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          قیمت: <PriceDisplay amount={parseFloat(variant.base_price)} currency={currency} />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {pricing.map((price: any) => (
          <div key={price.id} className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {price.age_group_display}:
            </span>
            <span className="font-semibold">
              {price.is_free ? (
                <span className="text-green-600">رایگان</span>
              ) : (
                <PriceDisplay 
                  amount={price.factor * parseFloat(variant.base_price)} 
                  currency={currency} 
                />
              )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          انتخاب پکیج
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="mr-2 text-gray-600 dark:text-gray-300">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          انتخاب پکیج
        </h3>
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <span className="text-red-600 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        انتخاب پکیج
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant) => {
          const isSelected = selectedVariant === variant.id;
          const isActive = true; // همه variant ها فعال هستند
          
          return (
            <Card
              key={variant.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                !isActive ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => isActive && onVariantSelect(variant.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {variant.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {variant.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  {!isActive && (
                    <div className="flex-shrink-0">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        غیرفعال
                      </span>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  {renderPricing(variant)}
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    خدمات شامل:
                  </h5>
                  <div className="space-y-1">
                    {renderFeatures(variant)}
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Users className="w-4 h-4 mr-1" />
                  <span>ظرفیت: {variant.capacity} نفر</span>
                </div>

                {/* Select Button */}
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  disabled={!isActive}
                >
                  {isSelected ? 'انتخاب شده' : 'انتخاب این پکیج'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 