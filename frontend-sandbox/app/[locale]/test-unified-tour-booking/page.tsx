'use client';

import React from 'react';
import UnifiedBookingPage from '../../../components/booking/UnifiedBookingPage';
import { UnifiedProductConfig } from '@/lib/types/unified-booking';

// Sample tour data with realistic structure
const sampleTourData = {
  id: 'tour-damavand-1',
  title: 'تور کوه دماوند',
  description: 'صعود به بلندترین قله ایران با امکانات کامل و راهنمای تخصصی',
  short_description: 'تور یک روزه کوه دماوند',
  base_price: 150000,
  currency: 'IRR',
  image: '/images/damavand.jpg',
  duration: '1 روز',
  location: 'کوه دماوند',
  max_participants: 20,
  difficulty_level: 'متوسط',
  variants: [
    {
      id: 'eco',
      name: 'اکو (اقتصادی)',
      base_price: 100000,
      features: ['راهنمای محلی', 'صبحانه', 'بیمه پایه'],
      capacity: 25
    },
    {
      id: 'normal',
      name: 'عادی',
      base_price: 150000,
      features: ['راهنمای تخصصی', 'صبحانه و ناهار', 'بیمه کامل', 'تجهیزات'],
      capacity: 20
    },
    {
      id: 'vip',
      name: 'VIP',
      base_price: 250000,
      features: ['راهنمای خصوصی', 'تمام وعده‌ها', 'بیمه کامل', 'تجهیزات حرفه‌ای', 'عکاس'],
      capacity: 10
    },
    {
      id: 'vvip',
      name: 'VVIP',
      base_price: 350000,
      features: ['راهنمای خصوصی', 'تمام وعده‌ها', 'بیمه کامل', 'تجهیزات حرفه‌ای', 'عکاس', 'هلیکوپتر'],
      capacity: 5
    }
  ],
  schedules: [
    {
      id: 'schedule-1',
      date: '2024-01-15',
      time: '06:00',
      available_capacity: 20,
      total_capacity: 20
    },
    {
      id: 'schedule-2',
      date: '2024-01-20',
      time: '06:00',
      available_capacity: 15,
      total_capacity: 20
    },
    {
      id: 'schedule-3',
      date: '2024-01-25',
      time: '06:00',
      available_capacity: 20,
      total_capacity: 20
    }
  ],
  options: [
    {
      id: 'insurance',
      name: 'بیمه مسافرتی',
      description: 'بیمه کامل مسافرتی با پوشش حوادث',
      price: 50000,
      type: 'addon'
    },
    {
      id: 'guide',
      name: 'راهنمای تخصصی',
      description: 'راهنمای تخصصی کوهنوردی',
      price: 100000,
      type: 'service'
    },
    {
      id: 'meal',
      name: 'وعده غذایی اضافی',
      description: 'شام کامل در کوه',
      price: 75000,
      type: 'addon'
    },
    {
      id: 'equipment',
      name: 'تجهیزات حرفه‌ای',
      description: 'کرامپون، کلنگ و تجهیزات ایمنی',
      price: 120000,
      type: 'service'
    }
  ],
  included_services: [
    'راهنمای محلی',
    'صبحانه',
    'بیمه پایه',
    'حمل و نقل'
  ],
  excluded_services: [
    'ناهار و شام',
    'تجهیزات شخصی',
    'هزینه‌های شخصی'
  ],
  itinerary: [
    {
      time: '06:00',
      activity: 'حرکت از تهران'
    },
    {
      time: '08:00',
      activity: 'رسیدن به پای کوه'
    },
    {
      time: '08:30',
      activity: 'شروع صعود'
    },
    {
      time: '14:00',
      activity: 'رسیدن به قله'
    },
    {
      time: '15:00',
      activity: 'شروع فرود'
    },
    {
      time: '18:00',
      activity: 'بازگشت به تهران'
    }
  ],
  requirements: [
    'کفش مناسب کوهنوردی',
    'لباس گرم',
    'آب کافی',
    'سطح آمادگی جسمانی متوسط'
  ],
  cancellation_policy: 'لغو تا 48 ساعت قبل از سفر بدون هزینه'
};

// Unified tour configuration
const tourConfig: UnifiedProductConfig = {
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
          options: sampleTourData.variants.map(variant => ({
            value: variant.id,
            label: variant.name,
            price: variant.base_price
          }))
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
          options: sampleTourData.schedules.map(schedule => ({
            value: schedule.id,
            label: `${schedule.date} - ${schedule.time}`,
            price: 0
          }))
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
          validation: { min: 1, max: sampleTourData.max_participants }
        },
        {
          name: 'child',
          type: 'number',
          label: 'کودک (2-12 سال)',
          required: false,
          placeholder: 'تعداد کودک',
          validation: { min: 0, max: sampleTourData.max_participants }
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
      fields: sampleTourData.options.map(option => ({
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
        const variant = sampleTourData.variants.find(v => v.id === formData.variant);
        if (variant) {
          total = variant.base_price;
        }
      } else {
        total = sampleTourData.base_price;
      }
      
      // Participants pricing
      const participants = (formData.adult || 0) + (formData.child || 0) * 0.7;
      total *= participants;
      
      // Options pricing
      sampleTourData.options.forEach(option => {
        if (formData[`option_${option.id}`]) {
          total += option.price;
        }
      });
      
      return total;
    },
    calculateBreakdown: (product: any, formData: any) => {
      let basePrice = sampleTourData.base_price;
      let optionsTotal = 0;
      
      // Variant pricing
      if (formData.variant) {
        const variant = sampleTourData.variants.find(v => v.id === formData.variant);
        if (variant) {
          basePrice = variant.base_price;
        }
      }
      
      // Participants
      const participants = (formData.adult || 0) + (formData.child || 0) * 0.7;
      basePrice *= participants;
      
      // Options pricing
      sampleTourData.options.forEach(option => {
        if (formData[`option_${option.id}`]) {
          optionsTotal += option.price;
        }
      });
      
      return {
        basePrice,
        optionsTotal,
        total: basePrice + optionsTotal,
        currency: sampleTourData.currency
      };
    }
  },
  validation: {
    checkAvailability: true,
    validateCapacity: true,
    validateCutoffTime: true
  }
};

export default function TestUnifiedTourBookingPage() {
  const handleBookingComplete = async (booking: any) => {
    console.log('Tour booking completed:', booking);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    alert('رزرو تور با موفقیت تکمیل شد!');
  };

  return (
    <UnifiedBookingPage
      productType="tour"
      productId={sampleTourData.id}
      productData={sampleTourData}
      config={tourConfig}
      onBookingComplete={handleBookingComplete}
    />
  );
} 