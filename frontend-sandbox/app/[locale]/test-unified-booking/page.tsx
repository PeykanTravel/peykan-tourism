'use client';

import React from 'react';
import UnifiedBookingPage from '../../../components/booking/UnifiedBookingPage';
import { UnifiedProductConfig } from '@/lib/types/unified-booking';

// Sample tour configuration
const sampleTourConfig: UnifiedProductConfig = {
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
          options: [
            { value: 'eco', label: 'اکو (اقتصادی)', price: 100000 },
            { value: 'normal', label: 'عادی', price: 150000 },
            { value: 'vip', label: 'VIP', price: 250000 },
            { value: 'vvip', label: 'VVIP', price: 350000 }
          ]
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
          name: 'date',
          type: 'date',
          label: 'تاریخ',
          required: true,
          placeholder: 'انتخاب تاریخ'
        },
        {
          name: 'time',
          type: 'time',
          label: 'ساعت',
          required: true,
          placeholder: 'انتخاب ساعت'
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
          validation: { min: 1, max: 10 }
        },
        {
          name: 'child',
          type: 'number',
          label: 'کودک',
          required: false,
          placeholder: 'تعداد کودک',
          validation: { min: 0, max: 10 }
        },
        {
          name: 'infant',
          type: 'number',
          label: 'نوزاد',
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
      fields: [
        {
          name: 'insurance',
          type: 'checkbox',
          label: 'بیمه مسافرتی',
          required: false
        },
        {
          name: 'guide',
          type: 'checkbox',
          label: 'راهنمای تخصصی',
          required: false
        },
        {
          name: 'meal',
          type: 'checkbox',
          label: 'وعده غذایی',
          required: false
        }
      ],
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
          name: 'specialRequests',
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
      let total = product.base_price || 0;
      
      // Variant pricing
      if (formData.variant) {
        const variantPrices = {
          eco: 100000,
          normal: 150000,
          vip: 250000,
          vvip: 350000
        };
        total = variantPrices[formData.variant as keyof typeof variantPrices] || total;
      }
      
      // Participants pricing
      const participants = (formData.adult || 0) + (formData.child || 0) * 0.7;
      total *= participants;
      
      // Options pricing
      if (formData.insurance) total += 50000;
      if (formData.guide) total += 100000;
      if (formData.meal) total += 75000;
      
      return total;
    },
    calculateBreakdown: (product: any, formData: any) => {
      const basePrice = product.base_price || 0;
      const optionsTotal = (formData.insurance ? 50000 : 0) + 
                          (formData.guide ? 100000 : 0) + 
                          (formData.meal ? 75000 : 0);
      
      return {
        basePrice,
        optionsTotal,
        total: basePrice + optionsTotal,
        currency: product.currency || 'USD'
      };
    }
  },
  validation: {
    checkAvailability: true,
    validateCapacity: true,
    validateCutoffTime: true
  }
};

// Sample tour data
const sampleTourData = {
  id: 'tour-1',
  title: 'تور کوه دماوند',
  description: 'تور یک روزه کوه دماوند با امکانات کامل',
  base_price: 150000,
  currency: 'IRR',
  image: '/images/damavand.jpg',
  variants: [
    { id: 'eco', name: 'اکو', base_price: 100000 },
    { id: 'normal', name: 'عادی', base_price: 150000 },
    { id: 'vip', name: 'VIP', base_price: 250000 },
    { id: 'vvip', name: 'VVIP', base_price: 350000 }
  ]
};

export default function TestUnifiedBookingPage() {
  const handleBookingComplete = async (booking: any) => {
    console.log('Booking completed:', booking);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    alert('رزرو با موفقیت تکمیل شد!');
  };

  return (
    <UnifiedBookingPage
      productType="tour"
      productId={sampleTourData.id}
      productData={sampleTourData}
      config={sampleTourConfig}
      onBookingComplete={handleBookingComplete}
    />
  );
} 