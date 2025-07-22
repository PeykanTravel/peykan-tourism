'use client';

import React from 'react';
import UnifiedBookingPage from '../../../components/booking/UnifiedBookingPage';
import { UnifiedProductConfig } from '@/lib/types/unified-booking';

// Sample transfer data with realistic structure
const sampleTransferData = {
  id: 'transfer-airport-1',
  title: 'ترانسفر فرودگاه امام خمینی',
  description: 'خدمات ترانسفر حرفه‌ای از فرودگاه امام خمینی به تهران و برعکس',
  short_description: 'ترانسفر فرودگاه',
  base_price: 250000,
  currency: 'IRR',
  image: '/images/transfer.jpg',
  duration: '45 دقیقه',
  location: 'تهران',
  max_participants: 12,
  routes: [
    {
      id: 'route-1',
      origin: 'فرودگاه امام خمینی',
      destination: 'تهران مرکز',
      distance: 45,
      duration: '45 دقیقه',
      base_price: 250000
    },
    {
      id: 'route-2',
      origin: 'تهران مرکز',
      destination: 'فرودگاه امام خمینی',
      distance: 45,
      duration: '45 دقیقه',
      base_price: 250000
    },
    {
      id: 'route-3',
      origin: 'فرودگاه امام خمینی',
      destination: 'شهرک غرب',
      distance: 55,
      duration: '60 دقیقه',
      base_price: 300000
    },
    {
      id: 'route-4',
      origin: 'شهرک غرب',
      destination: 'فرودگاه امام خمینی',
      distance: 55,
      duration: '60 دقیقه',
      base_price: 300000
    }
  ],
  vehicle_types: [
    {
      id: 'sedan',
      name: 'سدان',
      description: 'خودروی معمولی برای 4 نفر',
      capacity: 4,
      price_multiplier: 1.0,
      features: ['تهویه مطبوع', 'صندلی راحت', 'راننده حرفه‌ای']
    },
    {
      id: 'suv',
      name: 'SUV',
      description: 'خودروی بزرگ برای 6 نفر',
      capacity: 6,
      price_multiplier: 1.3,
      features: ['تهویه مطبوع', 'صندلی راحت', 'راننده حرفه‌ای', 'فضای بیشتر']
    },
    {
      id: 'van',
      name: 'ون',
      description: 'خودروی ون برای 12 نفر',
      capacity: 12,
      price_multiplier: 1.8,
      features: ['تهویه مطبوع', 'صندلی راحت', 'راننده حرفه‌ای', 'فضای زیاد', 'باربند']
    },
    {
      id: 'luxury',
      name: 'لوکس',
      description: 'خودروی لوکس برای 4 نفر',
      capacity: 4,
      price_multiplier: 2.5,
      features: ['تهویه مطبوع', 'صندلی چرم', 'راننده حرفه‌ای', 'سرویس لوکس', 'WiFi']
    }
  ],
  options: [
    {
      id: 'meet_greet',
      name: 'ملاقات در گیت',
      description: 'ملاقات راننده در گیت فرودگاه',
      price: 50000,
      type: 'service'
    },
    {
      id: 'flight_tracking',
      name: 'پیگیری پرواز',
      description: 'پیگیری خودکار پرواز و تنظیم زمان',
      price: 30000,
      type: 'service'
    },
    {
      id: 'child_seat',
      name: 'صندلی کودک',
      description: 'صندلی مخصوص کودک',
      price: 25000,
      type: 'addon'
    },
    {
      id: 'extra_wait',
      name: 'انتظار اضافی',
      description: 'انتظار تا 2 ساعت اضافی',
      price: 75000,
      type: 'service'
    },
    {
      id: 'wifi',
      name: 'WiFi رایگان',
      description: 'دسترسی به اینترنت رایگان',
      price: 20000,
      type: 'addon'
    },
    {
      id: 'refreshment',
      name: 'نوشیدنی رایگان',
      description: 'نوشیدنی و خوراکی رایگان',
      price: 35000,
      type: 'addon'
    }
  ],
  included_services: [
    'حمل و نقل',
    'راننده حرفه‌ای',
    'بیمه مسافر',
    'سرویس تمیز'
  ],
  excluded_services: [
    'نوشیدنی و خوراکی',
    'صندلی کودک',
    'انتظار اضافی',
    'ملاقات در گیت'
  ],
  pickup_points: [
    'گیت 1 فرودگاه',
    'گیت 2 فرودگاه',
    'گیت 3 فرودگاه',
    'پارکینگ کوتاه مدت',
    'پارکینگ بلند مدت'
  ],
  dropoff_points: [
    'هتل‌های مرکز تهران',
    'ایستگاه‌های مترو',
    'ترمینال‌های اتوبوس',
    'آدرس شخصی'
  ],
  cancellation_policy: 'لغو تا 2 ساعت قبل از سفر بدون هزینه'
};

// Unified transfer configuration
const transferConfig: UnifiedProductConfig = {
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
          options: sampleTransferData.routes.map(route => ({
            value: route.id,
            label: `${route.origin} به ${route.destination}`,
            price: route.base_price
          }))
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
          options: sampleTransferData.vehicle_types.map(vehicle => ({
            value: vehicle.id,
            label: `${vehicle.name} (${vehicle.capacity} نفر)`,
            price: vehicle.price_multiplier
          }))
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
      fields: sampleTransferData.options.map(option => ({
        name: `option_${option.id}`,
        type: 'checkbox',
        label: option.name,
        required: false
      })),
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
        const route = sampleTransferData.routes.find(r => r.id === formData.route);
        if (route) {
          total = route.base_price;
        }
      } else {
        total = sampleTransferData.base_price;
      }
      
      // Vehicle multiplier
      if (formData.vehicle_type) {
        const vehicle = sampleTransferData.vehicle_types.find(v => v.id === formData.vehicle_type);
        if (vehicle) {
          total *= vehicle.price_multiplier;
        }
      }
      
      // Options pricing
      sampleTransferData.options.forEach(option => {
        if (formData[`option_${option.id}`]) {
          total += option.price;
        }
      });
      
      return total;
    },
    calculateBreakdown: (product: any, formData: any) => {
      let basePrice = sampleTransferData.base_price;
      let optionsTotal = 0;
      
      // Route pricing
      if (formData.route) {
        const route = sampleTransferData.routes.find(r => r.id === formData.route);
        if (route) {
          basePrice = route.base_price;
        }
      }
      
      // Vehicle multiplier
      if (formData.vehicle_type) {
        const vehicle = sampleTransferData.vehicle_types.find(v => v.id === formData.vehicle_type);
        if (vehicle) {
          basePrice *= vehicle.price_multiplier;
        }
      }
      
      // Options pricing
      sampleTransferData.options.forEach(option => {
        if (formData[`option_${option.id}`]) {
          optionsTotal += option.price;
        }
      });
      
      return {
        basePrice,
        optionsTotal,
        total: basePrice + optionsTotal,
        currency: sampleTransferData.currency
      };
    }
  },
  validation: {
    checkAvailability: true,
    validateCapacity: true,
    validateCutoffTime: true
  }
};

export default function TestUnifiedTransferBookingPage() {
  const handleBookingComplete = async (booking: any) => {
    console.log('Transfer booking completed:', booking);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    alert('رزرو ترانسفر با موفقیت تکمیل شد!');
  };

  return (
    <UnifiedBookingPage
      productType="transfer"
      productId={sampleTransferData.id}
      productData={sampleTransferData}
      config={transferConfig}
      onBookingComplete={handleBookingComplete}
    />
  );
} 