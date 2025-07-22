'use client';

import React, { useState, useEffect } from 'react';
import UnifiedBookingForm from './UnifiedBookingForm';
import { Product, ProductConfig } from '../../lib/types/product';
import { UnifiedProductConfig } from '../../lib/types/unified-booking';

interface TransferBookingWrapperProps {
  transferData: any;
  onBookingComplete?: (booking: any) => void;
  className?: string;
}

export default function TransferBookingWrapper({
  transferData,
  onBookingComplete,
  className = ''
}: TransferBookingWrapperProps) {
  const [config, setConfig] = useState<UnifiedProductConfig | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Convert transfer data to unified product format
    const unifiedProduct: Product = {
      id: transferData.id,
      type: 'transfer',
      title: transferData.title,
      description: transferData.description,
      short_description: transferData.short_description,
      price: transferData.base_price || transferData.price,
      currency: transferData.currency || 'USD',
      images: transferData.images || [transferData.image],
      routes: transferData.routes,
      vehicle_types: transferData.vehicle_types,
      options: transferData.options,
      duration: transferData.duration,
      location: transferData.location || 'تهران'
    };

    // Create unified configuration
    const unifiedConfig: UnifiedProductConfig = {
      type: 'transfer',
      steps: [
        {
          id: 'route',
          title: 'انتخاب مسیر',
          description: 'مبدا و مقصد خود را انتخاب کنید',
          fields: [
            {
              name: 'route',
              type: 'select',
              label: 'مسیر',
              required: true,
              placeholder: 'انتخاب مسیر',
              options: transferData.routes?.map((route: any) => ({
                value: route.id,
                label: `${route.origin} به ${route.destination}`,
                price: route.base_price
              })) || []
            }
          ],
          isRequired: true
        },
        {
          id: 'vehicle',
          title: 'انتخاب خودرو',
          description: 'نوع خودرو مورد نظر را انتخاب کنید',
          fields: [
            {
              name: 'vehicle_type',
              type: 'select',
              label: 'نوع خودرو',
              required: true,
              placeholder: 'انتخاب خودرو',
              options: transferData.vehicle_types?.map((vehicle: any) => ({
                value: vehicle.id,
                label: `${vehicle.name} (${vehicle.capacity} نفر)`,
                price: vehicle.price_multiplier
              })) || []
            }
          ],
          isRequired: true
        },
        {
          id: 'datetime',
          title: 'تاریخ و زمان',
          description: 'تاریخ و زمان سفر را انتخاب کنید',
          fields: [
            {
              name: 'date',
              type: 'date',
              label: 'تاریخ سفر',
              required: true,
              placeholder: 'انتخاب تاریخ'
            },
            {
              name: 'time',
              type: 'time',
              label: 'ساعت سفر',
              required: true,
              placeholder: 'انتخاب ساعت'
            }
          ],
          isRequired: true
        },
        {
          id: 'passengers',
          title: 'مسافران',
          description: 'تعداد مسافران را مشخص کنید',
          fields: [
            {
              name: 'passengers',
              type: 'number',
              label: 'تعداد مسافر',
              required: true,
              placeholder: 'تعداد مسافر',
              validation: { min: 1, max: 12 }
            }
          ],
          isRequired: true
        },
        {
          id: 'pickup_dropoff',
          title: 'نقاط سوار و پیاده',
          description: 'آدرس دقیق سوار و پیاده شدن را وارد کنید',
          fields: [
            {
              name: 'pickup_address',
              type: 'textarea',
              label: 'آدرس سوار شدن',
              required: true,
              placeholder: 'آدرس دقیق محل سوار شدن'
            },
            {
              name: 'dropoff_address',
              type: 'textarea',
              label: 'آدرس پیاده شدن',
              required: true,
              placeholder: 'آدرس دقیق محل پیاده شدن'
            }
          ],
          isRequired: true
        },
        {
          id: 'options',
          title: 'آپشن‌های اضافی',
          description: 'آپشن‌های مورد نظر را انتخاب کنید',
          fields: transferData.options?.map((option: any) => ({
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
              name: 'flight_number',
              type: 'text',
              label: 'شماره پرواز (اختیاری)',
              required: false,
              placeholder: 'شماره پرواز'
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
          
          // Base price from route
          if (formData.route) {
            const route = transferData.routes?.find((r: any) => r.id === formData.route);
            if (route) {
              total = route.base_price || 0;
            }
          } else {
            total = transferData.base_price || transferData.price || 0;
          }
          
          // Vehicle multiplier
          if (formData.vehicle_type) {
            const vehicle = transferData.vehicle_types?.find((v: any) => v.id === formData.vehicle_type);
            if (vehicle) {
              total *= vehicle.price_multiplier || 1;
            }
          }
          
          // Passengers (some vehicles have per-passenger pricing)
          const passengers = formData.passengers || 1;
          // For most transfers, price is per vehicle, not per passenger
          // But some luxury vehicles might have per-passenger pricing
          
          // Options pricing
          transferData.options?.forEach((option: any) => {
            if (formData[`option_${option.id}`]) {
              total += option.price || 0;
            }
          });
          
          return total;
        },
        calculateBreakdown: (product: any, formData: any) => {
          let basePrice = transferData.base_price || transferData.price || 0;
          let optionsTotal = 0;
          
          // Route pricing
          if (formData.route) {
            const route = transferData.routes?.find((r: any) => r.id === formData.route);
            if (route) {
              basePrice = route.base_price || basePrice;
            }
          }
          
          // Vehicle multiplier
          if (formData.vehicle_type) {
            const vehicle = transferData.vehicle_types?.find((v: any) => v.id === formData.vehicle_type);
            if (vehicle) {
              basePrice *= vehicle.price_multiplier || 1;
            }
          }
          
          // Options pricing
          transferData.options?.forEach((option: any) => {
            if (formData[`option_${option.id}`]) {
              optionsTotal += option.price || 0;
            }
          });
          
          return {
            basePrice,
            optionsTotal,
            total: basePrice + optionsTotal,
            currency: transferData.currency || 'USD'
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
  }, [transferData]);

  if (!product || !config) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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