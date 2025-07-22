'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star,
  Clock,
  MapPin,
  Users,
  Car,
  Route
} from 'lucide-react';
import UnifiedBookingSidebar from '../../../components/booking/UnifiedBookingSidebar';
import { BookingState } from '../../../lib/types/unified-booking';

// Mock Transfer Data
interface TransferRoute {
  id: string;
  name: string;
  description: string;
  origin: string;
  destination: string;
  basePrice: number;
  currency: string;
  duration_minutes: number;
  distance_km: number;
}

interface TransferVehicle {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  currency: string;
  type: 'sedan' | 'suv' | 'van' | 'bus';
  features: string[];
}

interface TransferSchedule {
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

interface TransferOption {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'addon' | 'service' | 'feature';
}

interface Transfer {
  id: string;
  title: string;
  description: string;
  short_description: string;
  location: string;
  currency: string;
  images: string[];
  average_rating?: number;
  review_count?: number;
  category?: {
    id: string;
    name: string;
    description: string;
  };
  routes: TransferRoute[];
  vehicles: TransferVehicle[];
  schedules: TransferSchedule[];
  options: TransferOption[];
}

export default function TestTransferBookingPage() {
  const [transferData, setTransferData] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransferData();
  }, []);

  const fetchTransferData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransfer: Transfer = {
        id: 'transfer-1',
        title: 'ترانسفر فرودگاه امام خمینی',
        description: 'خدمات ترانسفر حرفه‌ای از فرودگاه امام خمینی به مرکز تهران و برعکس',
        short_description: 'ترانسفر فرودگاه امام خمینی',
        location: 'تهران، ایران',
        currency: 'USD',
        images: ['/images/airport-transfer.jpg'],
        average_rating: 4.8,
        review_count: 234,
        category: {
          id: 'cat-1',
          name: 'ترانسفر',
          description: 'خدمات ترانسفر'
        },
        routes: [
          {
            id: 'route-1',
            name: 'فرودگاه امام خمینی - مرکز تهران',
            description: 'مسیر مستقیم از فرودگاه به مرکز شهر',
            origin: 'فرودگاه امام خمینی',
            destination: 'مرکز تهران',
            basePrice: 25,
            currency: 'USD',
            duration_minutes: 45,
            distance_km: 35
          },
          {
            id: 'route-2',
            name: 'مرکز تهران - فرودگاه امام خمینی',
            description: 'مسیر مستقیم از مرکز شهر به فرودگاه',
            origin: 'مرکز تهران',
            destination: 'فرودگاه امام خمینی',
            basePrice: 25,
            currency: 'USD',
            duration_minutes: 45,
            distance_km: 35
          },
          {
            id: 'route-3',
            name: 'فرودگاه امام خمینی - شمال تهران',
            description: 'مسیر به مناطق شمالی تهران',
            origin: 'فرودگاه امام خمینی',
            destination: 'شمال تهران',
            basePrice: 35,
            currency: 'USD',
            duration_minutes: 60,
            distance_km: 50
          }
        ],
        vehicles: [
          {
            id: 'vehicle-1',
            name: 'سدان اقتصادی',
            description: 'ماشین سدان برای 4 مسافر',
            capacity: 4,
            price: 0,
            currency: 'USD',
            type: 'sedan',
            features: ['تهویه مطبوع', 'WiFi', 'آب معدنی']
          },
          {
            id: 'vehicle-2',
            name: 'SUV لوکس',
            description: 'ماشین SUV برای 6 مسافر',
            capacity: 6,
            price: 15,
            currency: 'USD',
            type: 'suv',
            features: ['تهویه مطبوع', 'WiFi', 'آب معدنی', 'صندلی چرمی']
          },
          {
            id: 'vehicle-3',
            name: 'ون بزرگ',
            description: 'ون برای گروه‌های بزرگ',
            capacity: 12,
            price: 25,
            currency: 'USD',
            type: 'van',
            features: ['تهویه مطبوع', 'WiFi', 'آب معدنی', 'صندلی راحت']
          }
        ],
        schedules: [
          {
            id: 'schedule-1',
            start_date: '2024-03-15',
            end_date: '2024-03-15',
            start_time: '08:00:00',
            end_time: '20:00:00',
            is_available: true,
            max_capacity: 50,
            current_capacity: 15,
            available_capacity: 35,
            is_full: false
          },
          {
            id: 'schedule-2',
            start_date: '2024-03-16',
            end_date: '2024-03-16',
            start_time: '06:00:00',
            end_time: '22:00:00',
            is_available: true,
            max_capacity: 50,
            current_capacity: 8,
            available_capacity: 42,
            is_full: false
          }
        ],
        options: [
          {
            id: 'meet_greet',
            name: 'استقبال در فرودگاه',
            description: 'راننده با تابلو نام شما در فرودگاه منتظر خواهد بود',
            price: 5,
            currency: 'USD',
            type: 'service'
          },
          {
            id: 'child_seat',
            name: 'صندلی کودک',
            description: 'صندلی مخصوص کودک (0-12 سال)',
            price: 3,
            currency: 'USD',
            type: 'addon'
          },
          {
            id: 'priority',
            name: 'اولویت رزرو',
            description: 'اولویت در رزرو و تایید سریع',
            price: 8,
            currency: 'USD',
            type: 'service'
          }
        ]
      };
      
      setTransferData(mockTransfer);
    } catch (err) {
      console.error('Error fetching transfer data:', err);
      setError('خطا در دریافت اطلاعات ترانسفر');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingState: BookingState) => {
    // Simulate booking submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Transfer booking submitted:', bookingState);
    
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
  if (error || !transferData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">ترانسفر یافت نشد</h1>
            <p className="text-gray-600 mb-8">{error || 'ترانسفر مورد نظر یافت نشد'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{transferData.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-lg">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                <span>{transferData.average_rating?.toFixed(1) || 'N/A'} ({transferData.review_count || 0} نظر)</span>
              </div>
              <div className="flex items-center">
                <Car className="w-5 h-5 mr-2" />
                <span>ترانسفر حرفه‌ای</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Transfer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">اطلاعات ترانسفر</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">محل: {transferData.location}</span>
                </div>
                <div className="flex items-center">
                  <Car className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">دسته‌بندی: {transferData.category?.name}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">توضیحات</h3>
                <p className="text-gray-700 leading-relaxed">{transferData.description}</p>
              </div>
            </div>

            {/* Transfer Routes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">مسیرهای موجود</h2>
              <div className="space-y-4">
                {transferData.routes?.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                        <p className="text-gray-600 mt-1">{route.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{route.origin} → {route.destination}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{route.duration_minutes} دقیقه</span>
                          </div>
                          <div className="flex items-center">
                            <Route className="w-4 h-4 mr-1" />
                            <span>{route.distance_km} کیلومتر</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {route.basePrice} {route.currency}
                        </div>
                        <div className="text-sm text-gray-500">قیمت پایه</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer Vehicles */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">انواع وسایل نقلیه</h2>
              <div className="space-y-4">
                {transferData.vehicles?.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                        <p className="text-gray-600 mt-1">{vehicle.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span>ظرفیت: {vehicle.capacity} نفر</span>
                          </div>
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-1" />
                            <span className="capitalize">{vehicle.type}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">ویژگی‌ها:</h4>
                          <div className="flex flex-wrap gap-2">
                            {vehicle.features.map((feature, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {vehicle.price > 0 ? `+${vehicle.price}` : 'رایگان'} {vehicle.currency}
                        </div>
                        <div className="text-sm text-gray-500">اضافه‌هزینه</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfer Options */}
            {transferData.options && transferData.options.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">آپشن‌های اضافی</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transferData.options.map((option) => (
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
              productType="transfer"
              productId={transferData.id}
              productData={transferData}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 