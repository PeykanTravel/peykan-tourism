'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import UnifiedBookingForm from '../../../components/booking/UnifiedBookingForm';
import { getProductConfig } from '../../../lib/config/productConfigs';
import { Product } from '../../../lib/types/product';
import { useToast } from '../../../lib/contexts/ToastContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import Link from 'next/link';

export default function TestTourBookingPage() {
  const t = useTranslations('common');
  const { showToast } = useToast();
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Sample tour data
  const sampleTour: Product = {
    id: 'tour-test-1',
    type: 'tour',
    title: 'تور کاشان و ابیانه',
    short_description: 'یک روز کامل در شهرهای تاریخی',
    description: 'سفر یک روزه به شهرهای تاریخی کاشان و ابیانه با بازدید از جاذبه‌های گردشگری و تجربه فرهنگ محلی',
    location: 'کاشان، ابیانه',
    price: 400000,
    currency: 'تومان',
    images: ['/images/placeholder.jpg'],
    variants: [
      {
        id: 'eco',
        name: 'اقتصادی',
        description: 'تور با امکانات پایه و قیمت مناسب',
        price: 400000,
        features: ['حمل و نقل', 'راهنما', 'ناهار'],
        capacity: 20,
        pricing: [
          { age_group: 'adult', factor: 1.0, is_free: false },
          { age_group: 'child', factor: 0.7, is_free: false },
          { age_group: 'infant', factor: 0.0, is_free: true }
        ]
      },
      {
        id: 'normal',
        name: 'عادی',
        description: 'تور با امکانات کامل و کیفیت بالا',
        price: 500000,
        features: ['حمل و نقل', 'راهنما', 'ناهار', 'عکاس'],
        capacity: 15,
        pricing: [
          { age_group: 'adult', factor: 1.0, is_free: false },
          { age_group: 'child', factor: 0.7, is_free: false },
          { age_group: 'infant', factor: 0.0, is_free: true }
        ]
      },
      {
        id: 'vip',
        name: 'VIP',
        description: 'تور لوکس با امکانات ویژه و خدمات شخصی',
        price: 800000,
        features: ['حمل و نقل VIP', 'راهنمای حرفه‌ای', 'ناهار لوکس', 'عکاس', 'بیمه'],
        capacity: 8,
        pricing: [
          { age_group: 'adult', factor: 1.0, is_free: false },
          { age_group: 'child', factor: 0.8, is_free: false },
          { age_group: 'infant', factor: 0.0, is_free: true }
        ]
      }
    ],
    schedules: [
      {
        id: 'schedule-1',
        date: '2024-02-15',
        time: '08:00-18:00',
        available_capacity: 15,
        total_capacity: 20
      },
      {
        id: 'schedule-2',
        date: '2024-02-16',
        time: '09:00-19:00',
        available_capacity: 20,
        total_capacity: 20
      },
      {
        id: 'schedule-3',
        date: '2024-02-17',
        time: '07:30-17:30',
        available_capacity: 12,
        total_capacity: 15
      }
    ],
    options: [
      {
        id: 'guide',
        name: 'راهنمای تور',
        description: 'راهنمای حرفه‌ای و مجرب',
        price: 50000,
        type: 'service'
      },
      {
        id: 'insurance',
        name: 'بیمه مسافرتی',
        description: 'پوشش بیمه‌ای کامل',
        price: 30000,
        type: 'addon'
      },
      {
        id: 'meal',
        name: 'وعده غذایی',
        description: 'ناهار در رستوران محلی',
        price: 80000,
        type: 'service'
      },
      {
        id: 'photographer',
        name: 'عکاس حرفه‌ای',
        description: 'عکاسی از لحظات خاص',
        price: 120000,
        type: 'service'
      }
    ]
  };

  const handleBookingComplete = (booking: any) => {
    setBookingResult(booking);
    showToast(`تور ${sampleTour.title} با موفقیت رزرو شد!`, 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              تست سیستم رزرو تور
            </h1>
            <Link href="/fa/test-basic-features">
              <Button variant="outline">
                بازگشت به صفحه تست
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            این صفحه برای تست سیستم یکپارچه رزرو تور طراحی شده است
          </p>
        </div>

        {/* Product Info */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {sampleTour.images && sampleTour.images[0] && (
                <div className="flex-shrink-0">
                  <img
                    src={sampleTour.images[0]}
                    alt={sampleTour.title}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {sampleTour.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {sampleTour.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>قیمت پایه: {new Intl.NumberFormat('fa-IR').format(sampleTour.price)} تومان</span>
                  <span>•</span>
                  <span>ظرفیت: تا 20 نفر</span>
                  <span>•</span>
                  <span>مدت: 1 روز</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  فرم رزرو تور
                </h3>
                <UnifiedBookingForm
                  product={sampleTour}
                  config={getProductConfig('tour')}
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tour Features */}
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  ویژگی‌های تور
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>بازدید از خانه‌های تاریخی کاشان</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>گشت در باغ فین</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>بازدید از روستای قمصر</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>ترانسفر رفت و برگشت</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Pricing Info */}
            <Card>
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  اطلاعات قیمت
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">بزرگسال:</span>
                    <span className="font-medium">100% قیمت</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">کودک (2-12):</span>
                    <span className="font-medium">70% قیمت</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">نوزاد (0-2):</span>
                    <span className="font-medium text-green-600">رایگان</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Result */}
            {bookingResult && (
              <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                    نتیجه رزرو
                  </h4>
                  <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                    <div className="flex justify-between">
                      <span>شماره رزرو:</span>
                      <span className="font-mono">{bookingResult.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>قیمت کل:</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('fa-IR').format(bookingResult.totalPrice)} تومان
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 