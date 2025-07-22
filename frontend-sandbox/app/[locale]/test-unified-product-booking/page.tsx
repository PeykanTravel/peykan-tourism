'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import UnifiedProductPage from '../../../components/products/UnifiedProductPage';
import UnifiedBookingFlow from '../../../components/booking/UnifiedBookingFlow';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../lib/contexts/ToastContext';
import Link from 'next/link';

export default function TestUnifiedProductBookingPage() {
  const t = useTranslations('common');
  const { showToast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const sampleProducts = [
    {
      id: 'tour-1', 
      type: 'tour' as const, 
      title: 'تور کاشان و قمصر',
      description: 'سفر یک روزه به شهر تاریخی کاشان و روستای زیبای قمصر با بازدید از باغ فین، خانه‌های تاریخی و کارگاه‌های گلاب‌گیری.',
      short_description: 'سفر یک روزه به شهر تاریخی کاشان و روستای زیبای قمصر', 
      price: 850000, 
      currency: 'IRR', 
      images: ['/images/kashan.jpg'], 
      location: 'کاشان، ایران', 
      duration: '1 روز', 
      rating: 4.8, 
      review_count: 156, 
      is_featured: true
    },
    {
      id: 'event-1', 
      type: 'event' as const, 
      title: 'کنسرت موسیقی سنتی ایرانی',
      description: 'اجرای موسیقی سنتی ایرانی با هنرمندان برجسته در تالار وحدت تهران. این کنسرت شامل اجرای قطعات کلاسیک موسیقی ایرانی و آواز سنتی خواهد بود.',
      short_description: 'اجرای موسیقی سنتی ایرانی با هنرمندان برجسته', 
      price: 200000, 
      currency: 'IRR', 
      images: ['/images/concert.jpg'], 
      location: 'تهران، ایران', 
      duration: '3 ساعت', 
      rating: 4.9, 
      review_count: 89, 
      is_popular: true
    },
    {
      id: 'transfer-1', 
      type: 'transfer' as const, 
      title: 'ترانسفر فرودگاه امام خمینی',
      description: 'سرویس ترانسفر از فرودگاه امام خمینی به مرکز تهران با خودروهای لوکس و رانندگان حرفه‌ای. شامل حمل چمدان و خدمات VIP.',
      short_description: 'سرویس ترانسفر از فرودگاه امام خمینی به مرکز تهران', 
      price: 350000, 
      currency: 'IRR', 
      images: ['/images/airport-transfer.jpg'], 
      location: 'تهران، ایران', 
      duration: '45 دقیقه', 
      rating: 4.7, 
      review_count: 234, 
      is_featured: true
    }
  ];

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setShowBooking(false);
    setBookingResult(null);
  };

  const handleBookingStart = () => {
    setShowBooking(true);
  };

  const handleBookingComplete = (bookingData: any) => {
    setBookingResult(bookingData);
    setShowBooking(false);
    showToast('رزرو با موفقیت انجام شد!', 'success');
  };

  const handleBookingCancel = () => {
    setShowBooking(false);
    showToast('رزرو لغو شد', 'info');
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setShowBooking(false);
    setBookingResult(null);
  };

  if (showBooking && selectedProduct) {
    return (
      <UnifiedBookingFlow
        product={selectedProduct}
        onComplete={handleBookingComplete}
        onCancel={handleBookingCancel}
      />
    );
  }

  if (selectedProduct && !showBooking) {
    return (
      <UnifiedProductPage
        product={selectedProduct}
        onBookingStart={handleBookingStart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2 md:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            تست سیستم یکپارچه رزرو
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            انتخاب محصول و تست فلو کامل رزرو
          </p>
        </div>

        {/* Navigation to other test pages */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
                تست‌های دیگر:
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/fa/test-enhanced-tour-booking">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    تست تور پیشرفته
                  </Button>
                </Link>
                <Link href="/fa/test-enhanced-event-booking">
                  <Button className="bg-purple-600 text-white hover:bg-purple-700">
                    تست ایونت پیشرفته
                  </Button>
                </Link>
                <Link href="/fa/test-transfer-booking">
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    تست ترانسفر
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Selection */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                انتخاب محصول برای تست
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sampleProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {product.type === 'tour' ? 'تور' : product.type === 'event' ? 'ایونت' : 'ترانسفر'}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {product.short_description}
                      </p>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Booking Result */}
        {bookingResult && (
          <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
                رزرو با موفقیت انجام شد!
              </h3>
              <div className="space-y-2 text-green-700 dark:text-green-300">
                <p><strong>محصول:</strong> {bookingResult.product.title}</p>
                <p><strong>نوع:</strong> {bookingResult.product.type}</p>
                <p><strong>تاریخ تکمیل:</strong> {new Date(bookingResult.completedAt).toLocaleString('fa-IR')}</p>
              </div>
              <Button
                onClick={handleBackToProducts}
                className="mt-4 bg-green-600 text-white hover:bg-green-700"
              >
                بازگشت به محصولات
              </Button>
            </div>
          </Card>
        )}

        {/* System Information */}
        <Card className="bg-gray-100 dark:bg-gray-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              اطلاعات سیستم:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p><strong>معماری:</strong> سیستم یکپارچه رزرو</p>
                <p><strong>کامپوننت اصلی:</strong> UnifiedBookingFlow</p>
                <p><strong>کامپوننت محصول:</strong> UnifiedProductPage</p>
              </div>
              <div>
                <p><strong>پشتیبانی محصولات:</strong> تور، ایونت، ترانسفر</p>
                <p><strong>مراحل پویا:</strong> بر اساس نوع محصول</p>
                <p><strong>قیمت‌گذاری:</strong> پویا و قابل تنظیم</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Architecture Benefits */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
              مزایای این معماری:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 dark:text-blue-300">
              <div>
                <p>✅ فلو یکپارچه برای همه محصولات</p>
                <p>✅ کامپوننت‌های قابل استفاده مجدد</p>
                <p>✅ قیمت‌گذاری پویا و انعطاف‌پذیر</p>
              </div>
              <div>
                <p>✅ UI/UX یکسان و حرفه‌ای</p>
                <p>✅ قابلیت توسعه آسان</p>
                <p>✅ نگهداری ساده و بهینه</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 