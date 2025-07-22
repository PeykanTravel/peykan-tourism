'use client';

import React, { useState, useEffect } from 'react';
import UnifiedBookingForm from './UnifiedBookingForm';
import { Product, ProductConfig } from '../../lib/types/product';
import { UnifiedProductConfig } from '../../lib/types/unified-booking';

interface EventBookingWrapperProps {
  eventData: any;
  onBookingComplete?: (booking: any) => void;
  className?: string;
}

export default function EventBookingWrapper({
  eventData,
  onBookingComplete,
  className = ''
}: EventBookingWrapperProps) {
  const [config, setConfig] = useState<UnifiedProductConfig | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Convert event data to unified product format
    const unifiedProduct: Product = {
      id: eventData.id,
      type: 'event',
      title: eventData.title,
      description: eventData.description,
      short_description: eventData.short_description,
      price: eventData.base_price || eventData.price,
      currency: eventData.currency || 'USD',
      images: eventData.images || [eventData.image],
      performances: eventData.performances,
      ticket_types: eventData.ticket_types,
      sections: eventData.sections,
      options: eventData.options,
      duration: eventData.duration,
      location: eventData.location || eventData.venue || 'تهران'
    };

    // Create unified configuration
    const unifiedConfig: UnifiedProductConfig = {
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
              options: eventData.performances?.map((performance: any) => ({
                value: performance.id,
                label: `${performance.date} - ${performance.time}`,
                price: performance.price
              })) || []
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
              options: eventData.ticket_types?.map((ticket: any) => ({
                value: ticket.id,
                label: ticket.name,
                price: ticket.price
              })) || []
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
              options: eventData.sections?.map((section: any) => ({
                value: section.id,
                label: section.name,
                price: section.price_multiplier
              })) || []
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
          id: 'seats',
          title: 'انتخاب صندلی',
          description: 'صندلی‌های مورد نظر را انتخاب کنید',
          fields: [
            {
              name: 'seats',
              type: 'text',
              label: 'صندلی‌های انتخاب شده',
              required: false,
              placeholder: 'صندلی‌ها به صورت خودکار انتخاب می‌شوند'
            }
          ],
          isRequired: false
        },
        {
          id: 'options',
          title: 'آپشن‌های اضافی',
          description: 'آپشن‌های مورد نظر را انتخاب کنید',
          fields: eventData.options?.map((option: any) => ({
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
          
          // Base price from ticket type
          if (formData.ticket_type) {
            const ticketType = eventData.ticket_types?.find((t: any) => t.id === formData.ticket_type);
            if (ticketType) {
              total = ticketType.price || 0;
            }
          } else {
            total = eventData.base_price || eventData.price || 0;
          }
          
          // Section multiplier
          if (formData.section) {
            const section = eventData.sections?.find((s: any) => s.id === formData.section);
            if (section) {
              total *= section.price_multiplier || 1;
            }
          }
          
          // Quantity
          const quantity = formData.quantity || 1;
          total *= quantity;
          
          // Options pricing
          eventData.options?.forEach((option: any) => {
            if (formData[`option_${option.id}`]) {
              total += option.price || 0;
            }
          });
          
          return total;
        },
        calculateBreakdown: (product: any, formData: any) => {
          let basePrice = eventData.base_price || eventData.price || 0;
          let optionsTotal = 0;
          
          // Ticket type pricing
          if (formData.ticket_type) {
            const ticketType = eventData.ticket_types?.find((t: any) => t.id === formData.ticket_type);
            if (ticketType) {
              basePrice = ticketType.price || basePrice;
            }
          }
          
          // Section multiplier
          if (formData.section) {
            const section = eventData.sections?.find((s: any) => s.id === formData.section);
            if (section) {
              basePrice *= section.price_multiplier || 1;
            }
          }
          
          // Quantity
          const quantity = formData.quantity || 1;
          basePrice *= quantity;
          
          // Options pricing
          eventData.options?.forEach((option: any) => {
            if (formData[`option_${option.id}`]) {
              optionsTotal += option.price || 0;
            }
          });
          
          return {
            basePrice,
            optionsTotal,
            total: basePrice + optionsTotal,
            currency: eventData.currency || 'USD'
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
  }, [eventData]);

  if (!product || !config) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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