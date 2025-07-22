'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star,
  Clock,
  MapPin,
  Users,
  Calendar,
  Ticket
} from 'lucide-react';
import UnifiedBookingSidebar from '../../../components/booking/UnifiedBookingSidebar';
import { BookingState } from '../../../lib/types/unified-booking';

// Mock Event Data
interface EventTicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  available_quantity: number;
  max_quantity_per_order: number;
}

interface EventSchedule {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_capacity: number;
  current_capacity: number;
  available_capacity: number;
  is_full: boolean;
}

interface EventOption {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'addon' | 'service' | 'feature';
}

interface Event {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  venue: string;
  currency: string;
  images: string[];
  duration_hours: number;
  max_capacity: number;
  average_rating?: number;
  review_count?: number;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  ticketTypes: EventTicketType[];
  schedules: EventSchedule[];
  options: EventOption[];
}

export default function TestEventBookingPage() {
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventData();
  }, []);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEvent: Event = {
        id: 'event-1',
        title: 'کنسرت موسیقی سنتی ایران',
        description: 'یک شب خاطره‌انگیز با موسیقی سنتی ایران و اجرای گروه‌های برجسته موسیقی',
        short_description: 'کنسرت موسیقی سنتی ایران',
        location: 'تهران، ایران',
        venue: 'تالار وحدت',
        currency: 'USD',
        images: ['/images/concert.jpg'],
        duration_hours: 3,
        max_capacity: 500,
        average_rating: 4.7,
        review_count: 89,
        category: {
          id: 'cat-1',
          name: 'موسیقی',
          description: 'رویدادهای موسیقی'
        },
        ticketTypes: [
          {
            id: 'ticket-1',
            name: 'بلیط عادی',
            description: 'صندلی عادی در سالن',
            price: 50,
            currency: 'USD',
            available_quantity: 200,
            max_quantity_per_order: 10
          },
          {
            id: 'ticket-2',
            name: 'بلیط VIP',
            description: 'صندلی VIP با خدمات ویژه',
            price: 120,
            currency: 'USD',
            available_quantity: 50,
            max_quantity_per_order: 4
          },
          {
            id: 'ticket-3',
            name: 'بلیط پریمیوم',
            description: 'صندلی پریمیوم با بهترین دید',
            price: 200,
            currency: 'USD',
            available_quantity: 30,
            max_quantity_per_order: 2
          }
        ],
        schedules: [
          {
            id: 'schedule-1',
            start_date: '2024-03-15',
            end_date: '2024-03-15',
            start_time: '19:00:00',
            end_time: '22:00:00',
            is_available: true,
            max_capacity: 500,
            current_capacity: 150,
            available_capacity: 350,
            is_full: false
          },
          {
            id: 'schedule-2',
            start_date: '2024-03-16',
            end_date: '2024-03-16',
            start_time: '20:00:00',
            end_time: '23:00:00',
            is_available: true,
            max_capacity: 500,
            current_capacity: 80,
            available_capacity: 420,
            is_full: false
          }
        ],
        options: [
          {
            id: 'parking',
            name: 'پارکینگ',
            description: 'پارکینگ اختصاصی در محل رویداد',
            price: 10,
            currency: 'USD',
            type: 'service'
          },
          {
            id: 'refreshments',
            name: 'نوشیدنی و تنقلات',
            description: 'بسته نوشیدنی و تنقلات',
            price: 15,
            currency: 'USD',
            type: 'addon'
          },
          {
            id: 'meet_greet',
            name: 'ملاقات با هنرمندان',
            description: 'فرصت ملاقات و عکس با هنرمندان',
            price: 30,
            currency: 'USD',
            type: 'service'
          }
        ]
      };
      
      setEventData(mockEvent);
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError('خطا در دریافت اطلاعات رویداد');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingState: BookingState) => {
    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Event booking submitted:', bookingState);
    
    // Here you would typically:
    // 1. Send to backend API
    // 2. Add to cart
    // 3. Redirect to cart page
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">رویداد یافت نشد</h1>
            <p className="text-gray-600 mb-8">{error || 'رویداد مورد نظر یافت نشد'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{eventData.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span>{eventData.average_rating?.toFixed(1) || 'N/A'} ({eventData.review_count || 0} نظر)</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{eventData.duration_hours} ساعت</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>حداکثر {eventData.max_capacity} نفر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">اطلاعات رویداد</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">مدت زمان: {eventData.duration_hours} ساعت</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">ظرفیت: {eventData.max_capacity} نفر</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">محل: {eventData.venue}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">دسته‌بندی: {eventData.category?.name}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">توضیحات</h3>
                <p className="text-gray-700 leading-relaxed">{eventData.description}</p>
              </div>
            </div>

            {/* Ticket Types */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">انواع بلیط</h2>
              <div className="space-y-4">
                {eventData.ticketTypes?.map((ticketType) => (
                  <div key={ticketType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{ticketType.name}</h3>
                        <p className="text-gray-600 mt-1">{ticketType.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Ticket className="w-4 h-4 mr-1" />
                          <span>موجودی: {ticketType.available_quantity} بلیط</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {ticketType.price} {ticketType.currency}
                        </div>
                        <div className="text-sm text-gray-500">قیمت هر بلیط</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Options */}
            {eventData.options && eventData.options.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">آپشن‌های اضافی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventData.options.map((option) => (
                    <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{option.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {option.price} {option.currency}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{option.type}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Unified Booking Sidebar */}
          <div className="lg:col-span-1">
            <UnifiedBookingSidebar
              productType="event"
              productId={eventData.id}
              productData={eventData}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 