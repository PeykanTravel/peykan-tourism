'use client';

import React, { useState, useEffect } from 'react';
import UnifiedBookingForm from './UnifiedBookingForm';
import { Product, ProductConfig } from '../../lib/types/product';
import { UnifiedProductConfig } from '../../lib/types/unified-booking';

interface TourBookingWrapperProps {
  tourData: any;
  onBookingComplete?: (booking: any) => void;
  className?: string;
}

export default function TourBookingWrapper({
  tourData,
  onBookingComplete,
  className = ''
}: TourBookingWrapperProps) {
  const [config, setConfig] = useState<UnifiedProductConfig | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Convert tour data to unified product format
    const unifiedProduct: Product = {
      id: tourData.id,
      type: 'tour',
      title: tourData.title,
      description: tourData.description,
      short_description: tourData.short_description,
      price: tourData.base_price || tourData.price,
      currency: tourData.currency || 'USD',
      images: tourData.images || [tourData.image],
      variants: tourData.variants,
      schedules: tourData.schedules,
      options: tourData.options,
             // Add other tour-specific fields
       duration: tourData.duration,
       location: tourData.location || 'تهران'
    };

    // Create unified configuration
    const unifiedConfig: UnifiedProductConfig = {
      type: 'tour',
      steps: [
        {
          id: 'variant',
          title: 'انتخاب پکیج',
          description: 'نوع پکیج مورد نظر خود را انتخاب کنید',
          fields: [
            {
              name: 'variant',
              type: 'select',
              label: 'پکیج',
              required: true,
              placeholder: 'انتخاب پکیج',
              options: tourData.variants?.map((variant: any) => ({
                value: variant.id,
                label: variant.name,
                price: variant.price || variant.base_price
              })) || []
            }
          ],
          isRequired: true
        },
        {
          id: 'schedule',
          title: 'انتخاب تاریخ',
          description: 'تاریخ و زمان سفر را انتخاب کنید',
          fields: [
            {
              name: 'schedule',
              type: 'select',
              label: 'تاریخ سفر',
              required: true,
              placeholder: 'انتخاب تاریخ',
              options: tourData.schedules?.map((schedule: any) => ({
                value: schedule.id,
                label: `${schedule.date} - ${schedule.time}`,
                price: schedule.price
              })) || []
            }
          ],
          isRequired: true
        },
        {
          id: 'participants',
          title: 'شرکت‌کنندگان',
          description: 'تعداد شرکت‌کنندگان را مشخص کنید',
          fields: [
            {
              name: 'adult',
              type: 'number',
              label: 'بزرگسال',
              required: true,
              placeholder: 'تعداد بزرگسال',
              validation: { min: 1, max: tourData.max_participants || 20 }
            },
            {
              name: 'child',
              type: 'number',
              label: 'کودک (2-12 سال)',
              required: false,
              placeholder: 'تعداد کودک',
              validation: { min: 0, max: tourData.max_participants || 20 }
            },
            {
              name: 'infant',
              type: 'number',
              label: 'نوزاد (0-2 سال)',
              required: false,
              placeholder: 'تعداد نوزاد',
              validation: { min: 0, max: 5 }
            }
          ],
          isRequired: true
        },
        {
          id: 'options',
          title: 'آپشن‌های اضافی',
          description: 'آپشن‌های مورد نظر را انتخاب کنید',
          fields: tourData.options?.map((option: any) => ({
            name: `option_${option.id}`,
            type: 'checkbox',
            label: option.name,
            required: false
          })) || [],
          isRequired: false
        },
        {
          id: 'contact',
          title: 'اطلاعات تماس',
          description: 'اطلاعات تماس خود را وارد کنید',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'نام و نام خانوادگی',
              required: true,
              placeholder: 'نام و نام خانوادگی'
            },
            {
              name: 'phone',
              type: 'text',
              label: 'شماره تلفن',
              required: true,
              placeholder: 'شماره تلفن'
            },
            {
              name: 'email',
              type: 'text',
              label: 'ایمیل',
              required: false,
              placeholder: 'ایمیل'
            },
            {
              name: 'special_requests',
              type: 'textarea',
              label: 'درخواست‌های ویژه',
              required: false,
              placeholder: 'درخواست‌های ویژه خود را بنویسید'
            }
          ],
          isRequired: true
        }
      ],
      pricing: {
        type: 'dynamic',
        calculatePrice: (product: any, formData: any) => {
          let total = 0;
          
          // Base price from variant
          if (formData.variant) {
            const variant = tourData.variants?.find((v: any) => v.id === formData.variant);
            if (variant) {
              total = variant.price || variant.base_price || 0;
            }
          } else {
            total = tourData.base_price || tourData.price || 0;
          }
          
          // Schedule price adjustment
          if (formData.schedule) {
            const schedule = tourData.schedules?.find((s: any) => s.id === formData.schedule);
            if (schedule && schedule.price) {
              total = schedule.price;
            }
          }
          
          // Participants pricing
          const participants = (formData.adult || 0) + (formData.child || 0) * 0.7;
          total *= participants;
          
          // Options pricing
          tourData.options?.forEach((option: any) => {
            if (formData[`option_${option.id}`]) {
              total += option.price || 0;
            }
          });
          
          return total;
        },
        calculateBreakdown: (product: any, formData: any) => {
          let basePrice = tourData.base_price || tourData.price || 0;
          let optionsTotal = 0;
          
          // Variant pricing
          if (formData.variant) {
            const variant = tourData.variants?.find((v: any) => v.id === formData.variant);
            if (variant) {
              basePrice = variant.price || variant.base_price || basePrice;
            }
          }
          
          // Schedule pricing
          if (formData.schedule) {
            const schedule = tourData.schedules?.find((s: any) => s.id === formData.schedule);
            if (schedule && schedule.price) {
              basePrice = schedule.price;
            }
          }
          
          // Options pricing
          tourData.options?.forEach((option: any) => {
            if (formData[`option_${option.id}`]) {
              optionsTotal += option.price || 0;
            }
          });
          
          return {
            basePrice,
            optionsTotal,
            total: basePrice + optionsTotal,
            currency: tourData.currency || 'USD'
          };
        }
      },
      validation: {
        checkAvailability: true,
        validateCapacity: true,
        validateCutoffTime: true
      }
    };

    setProduct(unifiedProduct);
    setConfig(unifiedConfig);
  }, [tourData]);

  if (!product || !config) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <UnifiedBookingForm
        product={product}
        config={config as any} // Type compatibility
        mode="multi-step"
        onBookingComplete={onBookingComplete || (() => {})}
      />
    </div>
  );
} 