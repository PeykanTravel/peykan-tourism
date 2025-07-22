'use client';

import React from 'react';
import UnifiedBookingPage from '../../../components/booking/UnifiedBookingPage';
import { UnifiedProductConfig } from '@/lib/types/unified-booking';

// Sample event data with realistic structure
const sampleEventData = {
  id: 'event-concert-1',
  title: 'کنسرت موسیقی سنتی ایران',
  description: 'یک شب خاطره‌انگیز با موسیقی سنتی ایران و هنرمندان برجسته',
  short_description: 'کنسرت موسیقی سنتی',
  base_price: 200000,
  currency: 'IRR',
  image: '/images/concert.jpg',
  duration: '3 ساعت',
  location: 'تالار وحدت',
  venue: 'تالار وحدت تهران',
  max_participants: 500,
  performances: [
    {
      id: 'performance-1',
      date: '2024-01-20',
      time: '19:00',
      venue: 'تالار وحدت',
      available_seats: 500
    },
    {
      id: 'performance-2',
      date: '2024-01-25',
      time: '19:00',
      venue: 'تالار وحدت',
      available_seats: 400
    },
    {
      id: 'performance-3',
      date: '2024-01-30',
      time: '19:00',
      venue: 'تالار وحدت',
      available_seats: 500
    }
  ],
  ticket_types: [
    {
      id: 'bronze',
      name: 'برنز',
      description: 'صندلی‌های معمولی',
      price: 150000,
      benefits: ['ورود به سالن', 'صندلی معمولی']
    },
    {
      id: 'silver',
      name: 'نقره‌ای',
      description: 'صندلی‌های بهتر',
      price: 250000,
      benefits: ['ورود به سالن', 'صندلی بهتر', 'نوشیدنی رایگان']
    },
    {
      id: 'gold',
      name: 'طلایی',
      description: 'صندلی‌های VIP',
      price: 350000,
      benefits: ['ورود به سالن', 'صندلی VIP', 'نوشیدنی رایگان', 'پارکینگ رایگان']
    },
    {
      id: 'platinum',
      name: 'پلاتین',
      description: 'صندلی‌های ویژه',
      price: 500000,
      benefits: ['ورود به سالن', 'صندلی ویژه', 'نوشیدنی رایگان', 'پارکینگ رایگان', 'ملاقات با هنرمندان']
    }
  ],
  sections: [
    {
      id: 'section-a',
      name: 'بخش A',
      description: 'بخش جلو سالن',
      price_multiplier: 1.2,
      available_seats: 100
    },
    {
      id: 'section-b',
      name: 'بخش B',
      description: 'بخش وسط سالن',
      price_multiplier: 1.0,
      available_seats: 200
    },
    {
      id: 'section-c',
      name: 'بخش C',
      description: 'بخش عقب سالن',
      price_multiplier: 0.8,
      available_seats: 200
    }
  ],
  options: [
    {
      id: 'parking',
      name: 'پارکینگ رایگان',
      description: 'پارکینگ رایگان در محل',
      price: 50000,
      type: 'service'
    },
    {
      id: 'refreshment',
      name: 'نوشیدنی و خوراکی',
      description: 'پکیج نوشیدنی و خوراکی',
      price: 75000,
      type: 'addon'
    },
    {
      id: 'meet_artist',
      name: 'ملاقات با هنرمندان',
      description: 'ملاقات خصوصی با هنرمندان',
      price: 150000,
      type: 'service'
    },
    {
      id: 'backstage',
      name: 'بک استیج',
      description: 'بازدید از پشت صحنه',
      price: 100000,
      type: 'service'
    }
  ],
  included_services: [
    'ورود به سالن',
    'صندلی رزرو شده',
    'بروشور برنامه'
  ],
  excluded_services: [
    'نوشیدنی و خوراکی',
    'پارکینگ',
    'ملاقات با هنرمندان'
  ],
  artists: [
    'استاد محمد رضا شجریان',
    'استاد حسین علیزاده',
    'استاد کیهان کلهر'
  ],
  program: [
    {
      time: '19:00',
      activity: 'ورود حضار'
    },
    {
      time: '19:30',
      activity: 'شروع برنامه'
    },
    {
      time: '20:00',
      activity: 'اجرای موسیقی سنتی'
    },
    {
      time: '21:30',
      activity: 'استراحت'
    },
    {
      time: '22:00',
      activity: 'ادامه برنامه'
    },
    {
      time: '23:00',
      activity: 'پایان برنامه'
    }
  ],
  cancellation_policy: 'لغو تا 24 ساعت قبل از اجرا بدون هزینه'
};

// Unified event configuration
const eventConfig: UnifiedProductConfig = {
  type: 'event',
  steps: [
    {
      id: 'performance',
      title: 'انتخاب اجرا',
      description: 'تاریخ و زمان اجرا را انتخاب کنید',
      fields: [
        {
          name: 'performance',
          type: 'select',
          label: 'اجرا',
          required: true,
          placeholder: 'انتخاب اجرا',
          options: sampleEventData.performances.map(performance => ({
            value: performance.id,
            label: `${performance.date} - ${performance.time}`,
            price: 0
          }))
        }
      ],
      isRequired: true
    },
    {
      id: 'ticket_type',
      title: 'نوع بلیط',
      description: 'نوع بلیط مورد نظر را انتخاب کنید',
      fields: [
        {
          name: 'ticket_type',
          type: 'select',
          label: 'نوع بلیط',
          required: true,
          placeholder: 'انتخاب نوع بلیط',
          options: sampleEventData.ticket_types.map(ticket => ({
            value: ticket.id,
            label: ticket.name,
            price: ticket.price
          }))
        }
      ],
      isRequired: true
    },
    {
      id: 'section',
      title: 'انتخاب بخش',
      description: 'بخش مورد نظر را انتخاب کنید',
      fields: [
        {
          name: 'section',
          type: 'select',
          label: 'بخش',
          required: true,
          placeholder: 'انتخاب بخش',
          options: sampleEventData.sections.map(section => ({
            value: section.id,
            label: section.name,
            price: section.price_multiplier
          }))
        }
      ],
      isRequired: true
    },
    {
      id: 'quantity',
      title: 'تعداد بلیط',
      description: 'تعداد بلیط مورد نیاز را مشخص کنید',
      fields: [
        {
          name: 'quantity',
          type: 'number',
          label: 'تعداد بلیط',
          required: true,
          placeholder: 'تعداد بلیط',
          validation: { min: 1, max: 10 }
        }
      ],
      isRequired: true
    },
    {
      id: 'options',
      title: 'آپشن‌های اضافی',
      description: 'آپشن‌های مورد نظر را انتخاب کنید',
      fields: sampleEventData.options.map(option => ({
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
      
      // Base price from ticket type
      if (formData.ticket_type) {
        const ticketType = sampleEventData.ticket_types.find(t => t.id === formData.ticket_type);
        if (ticketType) {
          total = ticketType.price;
        }
      } else {
        total = sampleEventData.base_price;
      }
      
      // Section multiplier
      if (formData.section) {
        const section = sampleEventData.sections.find(s => s.id === formData.section);
        if (section) {
          total *= section.price_multiplier;
        }
      }
      
      // Quantity
      const quantity = formData.quantity || 1;
      total *= quantity;
      
      // Options pricing
      sampleEventData.options.forEach(option => {
        if (formData[`option_${option.id}`]) {
          total += option.price;
        }
      });
      
      return total;
    },
    calculateBreakdown: (product: any, formData: any) => {
      let basePrice = sampleEventData.base_price;
      let optionsTotal = 0;
      
      // Ticket type pricing
      if (formData.ticket_type) {
        const ticketType = sampleEventData.ticket_types.find(t => t.id === formData.ticket_type);
        if (ticketType) {
          basePrice = ticketType.price;
        }
      }
      
      // Section multiplier
      if (formData.section) {
        const section = sampleEventData.sections.find(s => s.id === formData.section);
        if (section) {
          basePrice *= section.price_multiplier;
        }
      }
      
      // Quantity
      const quantity = formData.quantity || 1;
      basePrice *= quantity;
      
      // Options pricing
      sampleEventData.options.forEach(option => {
        if (formData[`option_${option.id}`]) {
          optionsTotal += option.price;
        }
      });
      
      return {
        basePrice,
        optionsTotal,
        total: basePrice + optionsTotal,
        currency: sampleEventData.currency
      };
    }
  },
  validation: {
    checkAvailability: true,
    validateCapacity: true,
    validateCutoffTime: true
  }
};

export default function TestUnifiedEventBookingPage() {
  const handleBookingComplete = async (booking: any) => {
    console.log('Event booking completed:', booking);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    alert('رزرو رویداد با موفقیت تکمیل شد!');
  };

  return (
    <UnifiedBookingPage
      productType="event"
      productId={sampleEventData.id}
      productData={sampleEventData}
      config={eventConfig}
      onBookingComplete={handleBookingComplete}
    />
  );
} 