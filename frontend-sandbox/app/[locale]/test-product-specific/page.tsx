'use client';

import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ProductSpecificSelector } from '../../../components/booking/ProductSpecificComponents';

export default function TestProductSpecificPage() {
  const [selectedProduct, setSelectedProduct] = useState<'tour' | 'event' | 'transfer'>('tour');
  const [formData, setFormData] = useState<any>({});

  // Sample data for each product type
  const tourData = {
    selectedVariant: formData.variant,
    selectedSchedule: formData.schedule,
    variants: [
      {
        id: 'eco',
        name: 'اکو (اقتصادی)',
        base_price: 100000,
        features: ['راهنمای محلی', 'صبحانه', 'بیمه پایه']
      },
      {
        id: 'normal',
        name: 'عادی',
        base_price: 150000,
        features: ['راهنمای تخصصی', 'صبحانه و ناهار', 'بیمه کامل', 'تجهیزات']
      },
      {
        id: 'vip',
        name: 'VIP',
        base_price: 250000,
        features: ['راهنمای خصوصی', 'تمام وعده‌ها', 'بیمه کامل', 'تجهیزات حرفه‌ای', 'عکاس']
      }
    ],
    schedules: [
      { id: 'schedule-1', date: '2024-01-15', time: '06:00', available_capacity: 20 },
      { id: 'schedule-2', date: '2024-01-20', time: '06:00', available_capacity: 15 },
      { id: 'schedule-3', date: '2024-01-25', time: '06:00', available_capacity: 20 }
    ]
  };

  const eventData = {
    selectedTicketType: formData.ticketType,
    selectedSeats: formData.seats || [],
    ticket_types: [
      { id: 'bronze', name: 'برنز', price: 150000, description: 'صندلی‌های معمولی' },
      { id: 'silver', name: 'نقره‌ای', price: 250000, description: 'صندلی‌های بهتر' },
      { id: 'gold', name: 'طلایی', price: 350000, description: 'صندلی‌های VIP' },
      { id: 'platinum', name: 'پلاتین', price: 500000, description: 'صندلی‌های ویژه' }
    ]
  };

  const transferData = {
    selectedRoute: formData.route,
    selectedVehicle: formData.vehicle,
    tripType: formData.tripType,
    routes: [
      { id: 'route-1', origin: 'فرودگاه امام خمینی', destination: 'تهران مرکز', base_price: 250000, duration: '45 دقیقه' },
      { id: 'route-2', origin: 'تهران مرکز', destination: 'فرودگاه امام خمینی', base_price: 250000, duration: '45 دقیقه' },
      { id: 'route-3', origin: 'فرودگاه امام خمینی', destination: 'شهرک غرب', base_price: 300000, duration: '60 دقیقه' }
    ],
    vehicle_types: [
      { id: 'sedan', name: 'سدان', capacity: 4, price_multiplier: 1.0 },
      { id: 'suv', name: 'SUV', capacity: 6, price_multiplier: 1.3 },
      { id: 'van', name: 'ون', capacity: 12, price_multiplier: 1.8 },
      { id: 'luxury', name: 'لوکس', capacity: 4, price_multiplier: 2.5 }
    ]
  };

  const handleSelect = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    console.log(`Selected ${field}:`, value);
  };

  const getProductData = () => {
    switch (selectedProduct) {
      case 'tour':
        return { ...tourData, selectedVariant: formData.variant, selectedSchedule: formData.schedule };
      case 'event':
        return { ...eventData, selectedTicketType: formData.ticketType, selectedSeats: formData.seats || [] };
      case 'transfer':
        return { ...transferData, selectedRoute: formData.route, selectedVehicle: formData.vehicle, tripType: formData.tripType };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          تست UI مخصوص هر محصول
        </h1>
        
        {/* Product Type Selector */}
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              انتخاب نوع محصول
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => setSelectedProduct('tour')}
                className={`${selectedProduct === 'tour' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                تور
              </Button>
              <Button
                onClick={() => setSelectedProduct('event')}
                className={`${selectedProduct === 'event' ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                رویداد
              </Button>
              <Button
                onClick={() => setSelectedProduct('transfer')}
                className={`${selectedProduct === 'transfer' ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                ترانسفر
              </Button>
            </div>
          </Card>
        </div>

        {/* Product Specific UI */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {selectedProduct === 'tour' && 'تور - انتخاب پکیج و تاریخ'}
            {selectedProduct === 'event' && 'رویداد - انتخاب بلیط و صندلی'}
            {selectedProduct === 'transfer' && 'ترانسفر - انتخاب مسیر و خودرو'}
          </h2>
          
          <ProductSpecificSelector
            productType={selectedProduct}
            data={getProductData()}
            onSelect={handleSelect}
          />
        </Card>

        {/* Form Data Display */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              داده‌های انتخاب شده
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              راهنمای استفاده
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>• هر محصول UI مخصوص خودش را دارد</p>
              <p>• تور: کارت‌های پکیج + تقویم تاریخ</p>
              <p>• رویداد: نقشه صندلی + کارت‌های بلیط</p>
              <p>• ترانسفر: نقشه مسیر + کارت‌های خودرو + انتخاب رفت/برگشت</p>
              <p>• همه در یک سیستم یکپارچه کار می‌کنند</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 