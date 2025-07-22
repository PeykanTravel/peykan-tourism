'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star,
  Clock,
  Users,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { tourService, Tour } from '../../../lib/services/tourService';
import UnifiedBookingSidebar from '../../../components/booking/UnifiedBookingSidebar';
import { BookingState } from '../../../lib/types/unified-booking';

export default function TestEnhancedTourBookingPage() {
  const [tourData, setTourData] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const TOUR_SLUG = 'damavand-mountain-tour';

  useEffect(() => {
    fetchTourData();
  }, []);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tour = await tourService.fetchTourDetails(TOUR_SLUG);
      setTourData(tour);
    } catch (err) {
      console.error('Error fetching tour data:', err);
      setError('خطا در دریافت اطلاعات تور');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingState: BookingState) => {
    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Booking submitted:', bookingState);
    
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
  if (error || !tourData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">تور یافت نشد</h1>
            <p className="text-gray-600 mb-8">{error || 'تور مورد نظر یافت نشد'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{tourData.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span>{tourData.average_rating?.toFixed(1) || 'N/A'} ({tourData.review_count || 0} نظر)</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{tourData.duration_hours} ساعت</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>حداکثر {tourData.max_participants} نفر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tour Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">اطلاعات تور</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">مدت زمان: {tourData.duration_hours} ساعت</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">ظرفیت: {tourData.min_participants}-{tourData.max_participants} نفر</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">دسته‌بندی: {tourData.category?.name}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">توضیحات</h3>
                <p className="text-gray-700 leading-relaxed">{tourData.description}</p>
              </div>
            </div>

            {/* Tour Variants */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">پکیج‌های تور</h2>
              <div className="space-y-4">
                {tourData.variants?.map((variant) => (
                  <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{variant.name}</h3>
                        <p className="text-gray-600 mt-1">{variant.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          {variant.includes_transfer && (
                            <span className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              ترانسفر
                            </span>
                          )}
                          {variant.includes_guide && (
                            <span className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              راهنما
                            </span>
                          )}
                          {variant.includes_meal && (
                            <span className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              وعده غذایی
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {parseFloat(variant.base_price)} {tourData.currency}
                        </div>
                        <div className="text-sm text-gray-500">قیمت پایه</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Itinerary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">برنامه سفر</h2>
              <div className="space-y-4">
                {tourData.itinerary?.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{item.duration_minutes} دقیقه</span>
                        <MapPin className="w-4 h-4 mr-1 ml-4" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tour Options */}
            {tourData.options && tourData.options.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">آپشن‌های اضافی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tourData.options.map((option) => (
                    <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{option.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{option.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {option.price} {option.currency || tourData.currency}
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
              productType="tour"
              productId={tourData.id}
              productData={tourData}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 