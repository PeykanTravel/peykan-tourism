import { ProductConfig } from '@/lib/types/product';

// Tour Configuration
export const tourConfig: ProductConfig = {
  type: 'tour',
  steps: [
    {
      id: 'tour-selection',
      title: 'انتخاب تور',
      description: 'تور مورد نظر خود را انتخاب کنید',
      fields: ['tour'],
      isRequired: true
    },
    {
      id: 'variant-selection',
      title: 'انتخاب نوع پکیج',
      description: 'نوع پکیج خود را انتخاب کنید',
      fields: ['variant'],
      isRequired: true,
      component: 'VariantComparisonCard'
    },
    {
      id: 'schedule-selection',
      title: 'انتخاب برنامه زمانی',
      description: 'تاریخ و زمان سفر را انتخاب کنید',
      fields: ['date', 'time'],
      isRequired: true,
      component: 'ScheduleCalendar'
    },
    {
      id: 'participants',
      title: 'تعداد شرکت‌کنندگان',
      description: 'تعداد بزرگسالان، کودکان و نوزادان را مشخص کنید',
      fields: ['adults', 'children', 'infants'],
      isRequired: true
    },
    {
      id: 'options',
      title: 'گزینه‌های اضافی',
      description: 'گزینه‌های اضافی مورد نظر را انتخاب کنید',
      fields: ['insurance', 'guide', 'meal'],
      isRequired: false
    },
    {
      id: 'personal-info',
      title: 'اطلاعات شخصی',
      description: 'اطلاعات شخصی خود را وارد کنید',
      fields: ['name', 'phone', 'email', 'address'],
      isRequired: true
    },
    {
      id: 'payment',
      title: 'پرداخت',
      description: 'روش پرداخت خود را انتخاب کنید',
      fields: ['payment_method'],
      isRequired: true
    }
  ],
  pricing: {
    type: 'dynamic',
    calculatePrice: (basePrice: number, variant: any, participants: any, options: any[]) => {
      let total = basePrice;
      
      // Variant pricing
      if (variant?.type === 'premium') {
        total *= 1.5;
      }
      
      // Participants pricing
      total *= participants.adults;
      total *= participants.children * 0.7; // 30% discount for children
      // Infants are free
      
      // Options pricing
      options.forEach(optionId => {
        switch (optionId) {
          case 'insurance':
            total += 50000;
            break;
          case 'guide':
            total += 100000;
            break;
          case 'meal':
            total += 75000;
            break;
        }
      });
      
      return total;
    }
  }
};

// Event Configuration
export const eventConfig: ProductConfig = {
  type: 'event',
  steps: [
    {
      id: 'event-selection',
      title: 'انتخاب ایونت',
      description: 'ایونت مورد نظر خود را انتخاب کنید',
      fields: ['event'],
      isRequired: true
    },
    {
      id: 'performance-selection',
      title: 'انتخاب اجرا',
      description: 'تاریخ و زمان اجرا را انتخاب کنید',
      fields: ['performance'],
      isRequired: true,
      component: 'EventSchedule'
    },
    {
      id: 'ticket-selection',
      title: 'انتخاب نوع بلیط',
      description: 'نوع بلیط خود را انتخاب کنید',
      fields: ['ticket_type'],
      isRequired: true,
      component: 'TicketTypeSelector'
    },
    {
      id: 'section-selection',
      title: 'انتخاب سکشن',
      description: 'سکشن مورد نظر را انتخاب کنید',
      fields: ['section'],
      isRequired: true
    },
    {
      id: 'seat-selection',
      title: 'انتخاب صندلی',
      description: 'صندلی مورد نظر خود را انتخاب کنید',
      fields: ['seats'],
      isRequired: true,
      component: 'InteractiveSeatMap'
    },
    {
      id: 'options',
      title: 'گزینه‌های اضافی',
      description: 'گزینه‌های اضافی مورد نظر را انتخاب کنید',
      fields: ['parking', 'refreshments'],
      isRequired: false
    },
    {
      id: 'personal-info',
      title: 'اطلاعات شخصی',
      description: 'اطلاعات شخصی خود را وارد کنید',
      fields: ['name', 'phone', 'email'],
      isRequired: true
    },
    {
      id: 'payment',
      title: 'پرداخت',
      description: 'روش پرداخت خود را انتخاب کنید',
      fields: ['payment_method'],
      isRequired: true
    }
  ],
      pricing: {
      type: 'dynamic',
      calculatePrice: (basePrice: number, ticketType: any, section: any, seats: any[], options: any[]) => {
        let total = basePrice;
        
        // Ticket type pricing
        if (ticketType?.type === 'vip') {
          total *= 2;
        }
        
        // Section pricing
        if (section?.type === 'premium') {
          total *= 1.3;
        }
        
        // Seats pricing (per seat)
        total *= seats.length;
        
        // Options pricing
        options.forEach(optionId => {
          switch (optionId) {
            case 'parking':
              total += 25000;
              break;
            case 'refreshments':
              total += 35000;
              break;
          }
        });
        
        return total;
      }
    }
};

// Transfer Configuration
export const transferConfig: ProductConfig = {
  type: 'transfer',
  steps: [
    {
      id: 'route-selection',
      title: 'انتخاب مسیر',
      description: 'مبدا و مقصد خود را انتخاب کنید',
      fields: ['origin', 'destination'],
      isRequired: true
    },
    {
      id: 'vehicle-selection',
      title: 'انتخاب نوع خودرو',
      description: 'نوع خودرو مورد نظر را انتخاب کنید',
      fields: ['vehicle_type'],
      isRequired: true
    },
    {
      id: 'trip-type',
      title: 'نوع سفر',
      description: 'نوع سفر خود را انتخاب کنید',
      fields: ['trip_type'],
      isRequired: true
    },
    {
      id: 'date-time-selection',
      title: 'انتخاب تاریخ و زمان',
      description: 'تاریخ و زمان سفر را انتخاب کنید',
      fields: ['date', 'time'],
      isRequired: true
    },
    {
      id: 'passengers',
      title: 'تعداد مسافران',
      description: 'تعداد مسافران و چمدان‌ها را مشخص کنید',
      fields: ['passengers', 'luggage'],
      isRequired: true
    },
    {
      id: 'pickup-dropoff',
      title: 'آدرس تحویل و تحویل',
      description: 'آدرس دقیق تحویل و تحویل را وارد کنید',
      fields: ['pickup_address', 'dropoff_address'],
      isRequired: true
    },
    {
      id: 'options',
      title: 'گزینه‌های اضافی',
      description: 'گزینه‌های اضافی مورد نظر را انتخاب کنید',
      fields: ['meet_greet', 'child_seat', 'wheelchair'],
      isRequired: false
    },
    {
      id: 'personal-info',
      title: 'اطلاعات شخصی',
      description: 'اطلاعات شخصی خود را وارد کنید',
      fields: ['name', 'phone', 'email'],
      isRequired: true
    },
    {
      id: 'payment',
      title: 'پرداخت',
      description: 'روش پرداخت خود را انتخاب کنید',
      fields: ['payment_method'],
      isRequired: true
    }
  ],
      pricing: {
      type: 'dynamic',
      calculatePrice: (basePrice: number, route: any, vehicleType: any, tripType: any, passengers: number, options: any[]) => {
        let total = basePrice;
        
        // Route pricing
        if (route?.distance > 50) {
          total *= 1.2; // 20% extra for long distance
        }
        
        // Vehicle type pricing
        if (vehicleType?.type === 'luxury') {
          total *= 1.8;
        }
        
        // Trip type pricing
        if (tripType === 'round_trip') {
          total *= 1.6; // 60% extra for round trip
        }
        
        // Passengers pricing
        if (passengers > 4) {
          total *= 1.3; // 30% extra for more than 4 passengers
        }
        
        // Options pricing
        options.forEach(optionId => {
          switch (optionId) {
            case 'meet_greet':
              total += 30000;
              break;
            case 'child_seat':
              total += 15000;
              break;
            case 'wheelchair':
              total += 25000;
              break;
          }
        });
        
        return total;
      }
    }
};

// Export all configurations
export const productConfigs = {
  tour: tourConfig,
  event: eventConfig,
  transfer: transferConfig
};

// Factory function to get product configuration
export function getProductConfig(type: 'tour' | 'event' | 'transfer') {
  switch (type) {
    case 'tour':
      return tourConfig;
    case 'event':
      return eventConfig;
    case 'transfer':
      return transferConfig;
    default:
      throw new Error(`Unknown product type: ${type}`);
  }
} 