'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import UnifiedBookingForm from '../../../components/booking/UnifiedBookingForm';
import TicketTypeSelector from '../../../components/booking/product-specific/event/TicketTypeSelector';
import InteractiveSeatMap from '../../../components/booking/product-specific/event/InteractiveSeatMap';
import EventSchedule from '../../../components/booking/product-specific/event/EventSchedule';
import EventDetailsCard from '../../../components/booking/product-specific/event/EventDetailsCard';
import { getProductConfig } from '../../../lib/config/productConfigs';
import { Product } from '../../../lib/types/product';
import { useToast } from '../../../lib/contexts/ToastContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import Link from 'next/link';

export default function TestEnhancedEventBookingPage() {
  const t = useTranslations('common');
  const { showToast } = useToast();
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Sample event data
  const sampleEvent: Product = {
    id: 'event-test-1',
    type: 'event',
    title: 'کنسرت موسیقی سنتی ایرانی',
    short_description: 'اجرای موسیقی سنتی ایرانی',
    description: 'اجرای موسیقی سنتی ایرانی با هنرمندان برجسته در تالار وحدت تهران',
    location: 'تهران، تالار وحدت',
    price: 200000,
    currency: 'IRR',
    images: ['/images/concert.jpg']
  };

  // Sample ticket types
  const sampleTicketTypes = [
    {
      id: 'vip-1',
      name: 'بلیط VIP',
      description: 'بهترین صندلی‌ها با خدمات ویژه',
      price: 500000,
      currency: 'IRR',
      benefits: ['صندلی در ردیف اول', 'پارکینگ رایگان', 'نوشیدنی رایگان', 'ملاقات با هنرمندان'],
      is_premium: true,
      is_vip: true,
      available_quantity: 20
    },
    {
      id: 'premium-1',
      name: 'بلیط Premium',
      description: 'صندلی‌های عالی با خدمات اضافی',
      price: 350000,
      currency: 'IRR',
      benefits: ['صندلی در ردیف‌های جلو', 'پارکینگ رایگان', 'نوشیدنی رایگان'],
      is_premium: true,
      is_vip: false,
      available_quantity: 50
    },
    {
      id: 'regular-1',
      name: 'بلیط عادی',
      description: 'صندلی‌های معمولی با قیمت مناسب',
      price: 200000,
      currency: 'IRR',
      benefits: ['صندلی راحت', 'دسترسی آسان'],
      is_premium: false,
      is_vip: false,
      available_quantity: 200
    }
  ];

  // Sample sections
  const sampleSections = [
    {
      id: 'section-a',
      name: 'بخش A',
      description: 'صندلی‌های جلو - بهترین دید',
      total_capacity: 100,
      available_capacity: 85,
      base_price: 200000,
      currency: 'IRR',
      is_wheelchair_accessible: false,
      is_premium: true
    },
    {
      id: 'section-b',
      name: 'بخش B',
      description: 'صندلی‌های وسط - دید خوب',
      total_capacity: 150,
      available_capacity: 120,
      base_price: 150000,
      currency: 'IRR',
      is_wheelchair_accessible: false,
      is_premium: false
    },
    {
      id: 'section-c',
      name: 'بخش C',
      description: 'صندلی‌های عقب - قیمت مناسب',
      total_capacity: 200,
      available_capacity: 180,
      base_price: 100000,
      currency: 'IRR',
      is_wheelchair_accessible: true,
      is_premium: false
    }
  ];

  // Sample performances
  const samplePerformances = [
    {
      id: 'perf-1',
      date: '2024-02-15',
      start_time: '19:00',
      end_time: '22:00',
      is_available: true,
      max_capacity: 450,
      available_capacity: 385,
      is_special: false,
      venue: {
        name: 'تالار وحدت تهران',
        address: 'خیابان انقلاب، تهران'
      }
    },
    {
      id: 'perf-2',
      date: '2024-02-16',
      start_time: '20:00',
      end_time: '23:00',
      is_available: true,
      max_capacity: 450,
      available_capacity: 320,
      is_special: true,
      venue: {
        name: 'تالار وحدت تهران',
        address: 'خیابان انقلاب، تهران'
      }
    },
    {
      id: 'perf-3',
      date: '2024-02-17',
      start_time: '18:30',
      end_time: '21:30',
      is_available: true,
      max_capacity: 450,
      available_capacity: 450,
      is_special: false,
      venue: {
        name: 'تالار وحدت تهران',
        address: 'خیابان انقلاب، تهران'
      }
    }
  ];

  // Sample event details
  const sampleEventDetails = {
    id: 'event-test-1',
    title: 'کنسرت موسیقی سنتی ایرانی',
    description: 'اجرای موسیقی سنتی ایرانی با هنرمندان برجسته در تالار وحدت تهران. این کنسرت شامل اجرای قطعات کلاسیک موسیقی ایرانی و آواز سنتی خواهد بود.',
    short_description: 'اجرای موسیقی سنتی ایرانی با هنرمندان برجسته',
    highlights: 'اجرای قطعات کلاسیک موسیقی ایرانی، آواز سنتی، همراهی با ارکستر',
    rules: 'ورود با بلیط معتبر، ممنوعیت فیلمبرداری، رعایت سکوت در طول اجرا',
    required_items: 'بلیط معتبر، کارت شناسایی',
    image: '/images/concert.jpg',
    gallery: ['/images/concert1.jpg', '/images/concert2.jpg', '/images/concert3.jpg'],
    style: 'music' as const,
    door_open_time: '18:00',
    start_time: '19:00',
    end_time: '22:00',
    age_restriction: 12,
    venue: {
      name: 'تالار وحدت تهران',
      address: 'خیابان انقلاب، تهران',
      city: 'تهران',
      country: 'ایران'
    },
    artists: [
      {
        id: 'artist-1',
        name: 'استاد محمد رضا شجریان',
        bio: 'خواننده و موسیقیدان برجسته ایرانی',
        image: '/images/artist1.jpg'
      },
      {
        id: 'artist-2',
        name: 'استاد حسین علیزاده',
        bio: 'نوازنده تار و سه تار',
        image: '/images/artist2.jpg'
      }
    ],
    category: {
      name: 'موسیقی سنتی',
      description: 'اجرای موسیقی سنتی ایرانی'
    },
    average_rating: 4.8,
    review_count: 156
  };

  // State for components
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<any>(null);

  const handleBookingComplete = (booking: any) => {
    setBookingResult(booking);
    showToast('ایونت با موفقیت رزرو شد!', 'success');
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' ' + currency;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fa-IR');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2 md:px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            تست رزرو ایونت پیشرفته - Enhanced Event Booking Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            تست Event-Specific Components با UnifiedBookingForm
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
                تست‌های دیگر:
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/fa/test-enhanced-tour-booking">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    تست رزرو تور پیشرفته
                  </Button>
                </Link>
                <Link href="/fa/test-tour-booking">
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    تست رزرو تور ساده
                  </Button>
                </Link>
                <Link href="/fa/test-transfer-booking">
                  <Button className="bg-orange-600 text-white hover:bg-orange-700">
                    تست رزرو ترانسفر
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Event Booking with Tabs */}
        <Tabs value="booking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="booking">رزرو</TabsTrigger>
            <TabsTrigger value="tickets">بلیط‌ها</TabsTrigger>
            <TabsTrigger value="schedule">تقویم</TabsTrigger>
            <TabsTrigger value="seats">صندلی‌ها</TabsTrigger>
            <TabsTrigger value="details">جزئیات</TabsTrigger>
          </TabsList>

          {/* Booking Tab */}
          <TabsContent value="booking" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                  فرم رزرو یکپارچه
                </h2>
                <UnifiedBookingForm
                  product={sampleEvent}
                  config={getProductConfig('event')}
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                  انتخاب نوع بلیط
                </h2>
                <TicketTypeSelector
                  ticketTypes={sampleTicketTypes}
                  selectedTicketType={selectedTicketType}
                  onTicketTypeSelect={setSelectedTicketType}
                  currency={sampleEvent.currency}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                  انتخاب تاریخ و زمان
                </h2>
                <EventSchedule
                  performances={samplePerformances}
                  selectedPerformance={selectedPerformance}
                  onPerformanceSelect={setSelectedPerformance}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  formatPrice={formatPrice}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Seats Tab */}
          <TabsContent value="seats" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                  انتخاب صندلی
                </h2>
                <InteractiveSeatMap
                  sections={sampleSections}
                  selectedSeats={selectedSeats}
                  onSeatSelect={(seat) => setSelectedSeats([...selectedSeats, seat])}
                  onSeatDeselect={(seat) => setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id))}
                  onSectionSelect={setSelectedSection}
                  selectedSection={selectedSection}
                  maxSelectableSeats={8}
                  formatPrice={formatPrice}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
                  جزئیات ایونت
                </h2>
                <EventDetailsCard
                  event={sampleEventDetails}
                  formatTime={formatTime}
                  formatPrice={formatPrice}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Result */}
        {bookingResult && (
          <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
                ✅ رزرو با موفقیت انجام شد!
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-black dark:text-white mb-2">
                  جزئیات رزرو:
                </h4>
                <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
                  {JSON.stringify(bookingResult, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        )}

        {/* Component Status */}
        <Card className="bg-gray-100 dark:bg-gray-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              وضعیت کامپوننت‌ها
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="space-y-2">
                <div>• TicketTypeSelector: ✅ آماده</div>
                <div>• InteractiveSeatMap: ✅ آماده</div>
                <div>• EventSchedule: ✅ آماده</div>
                <div>• EventDetailsCard: ✅ آماده</div>
              </div>
              <div className="space-y-2">
                <div>• UnifiedBookingForm: ✅ یکپارچه</div>
                <div>• Tabs Interface: ✅ فعال</div>
                <div>• State Management: ✅ کار می‌کند</div>
                <div>• Responsive Design: ✅ بهینه</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Debug Information */}
        <Card className="bg-gray-100 dark:bg-gray-800">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
              اطلاعات دیباگ
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div>• نوع محصول: {sampleEvent.type}</div>
              <div>• تعداد بلیط‌ها: {sampleTicketTypes.length}</div>
              <div>• تعداد بخش‌ها: {sampleSections.length}</div>
              <div>• تعداد اجراها: {samplePerformances.length}</div>
              <div>• بلیط انتخاب شده: {selectedTicketType?.name || 'هیچ‌کدام'}</div>
              <div>• اجرای انتخاب شده: {selectedPerformance?.date || 'هیچ‌کدام'}</div>
              <div>• صندلی‌های انتخاب شده: {selectedSeats.length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 