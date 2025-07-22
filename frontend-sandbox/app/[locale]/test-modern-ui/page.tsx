'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AdvancedCard, TourCard, EventCard, TransferCard } from '../../../components/ui/AdvancedCard';
import { ModernProductSpecificSelector } from '../../../components/booking/ModernProductSpecificComponents';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Share2, 
  Eye,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function TestModernUIPage() {
  const [selectedProduct, setSelectedProduct] = useState<'tour' | 'event' | 'transfer'>('tour');
  const [formData, setFormData] = useState<any>({});
  const [showFeatures, setShowFeatures] = useState(false);

  // Sample data for each product type
  const tourData = {
    selectedVariant: formData.variant,
    selectedSchedule: formData.schedule,
    variants: [
      {
        id: 'eco',
        name: 'اکو (اقتصادی)',
        base_price: 100000,
        features: ['راهنمای محلی', 'صبحانه', 'بیمه پایه'],
        capacity: 25
      },
      {
        id: 'normal',
        name: 'عادی',
        base_price: 150000,
        features: ['راهنمای تخصصی', 'صبحانه و ناهار', 'بیمه کامل', 'تجهیزات'],
        capacity: 20
      },
      {
        id: 'vip',
        name: 'VIP',
        base_price: 250000,
        features: ['راهنمای خصوصی', 'تمام وعده‌ها', 'بیمه کامل', 'تجهیزات حرفه‌ای', 'عکاس'],
        capacity: 10
      }
    ],
    schedules: [
      { id: 'schedule-1', date: '2024-01-15', time: '06:00', available_capacity: 20, total_capacity: 20 },
      { id: 'schedule-2', date: '2024-01-20', time: '06:00', available_capacity: 15, total_capacity: 20 },
      { id: 'schedule-3', date: '2024-01-25', time: '06:00', available_capacity: 20, total_capacity: 20 }
    ]
  };

  const eventData = {
    selectedTicketType: formData.ticketType,
    selectedSeats: formData.seats || [],
    ticket_types: [
      { 
        id: 'bronze', 
        name: 'برنز', 
        price: 150000, 
        description: 'صندلی‌های معمولی',
        features: ['دسترسی عمومی', 'صندلی معمولی']
      },
      { 
        id: 'silver', 
        name: 'نقره‌ای', 
        price: 250000, 
        description: 'صندلی‌های بهتر',
        features: ['دسترسی بهتر', 'صندلی راحت‌تر', 'نوشیدنی رایگان']
      },
      { 
        id: 'gold', 
        name: 'طلایی', 
        price: 350000, 
        description: 'صندلی‌های VIP',
        features: ['دسترسی VIP', 'صندلی لوکس', 'نوشیدنی و خوراکی', 'پارکینگ رایگان']
      },
      { 
        id: 'platinum', 
        name: 'پلاتین', 
        price: 500000, 
        description: 'صندلی‌های ویژه',
        features: ['دسترسی ویژه', 'صندلی لوکس', 'نوشیدنی و خوراکی', 'پارکینگ رایگان', 'ملاقات با هنرمندان']
      }
    ]
  };

  const transferData = {
    selectedRoute: formData.route,
    selectedVehicle: formData.vehicle,
    tripType: formData.tripType,
    routes: [
      { 
        id: 'route-1', 
        origin: 'فرودگاه امام خمینی', 
        destination: 'تهران مرکز', 
        base_price: 250000, 
        duration: '45 دقیقه' 
      },
      { 
        id: 'route-2', 
        origin: 'تهران مرکز', 
        destination: 'فرودگاه امام خمینی', 
        base_price: 250000, 
        duration: '45 دقیقه' 
      },
      { 
        id: 'route-3', 
        origin: 'فرودگاه امام خمینی', 
        destination: 'شهرک غرب', 
        base_price: 300000, 
        duration: '60 دقیقه' 
      }
    ],
    vehicle_types: [
      { 
        id: 'sedan', 
        name: 'سدان', 
        capacity: 4, 
        price_multiplier: 1.0,
        features: ['تهویه مطبوع', 'رادیو']
      },
      { 
        id: 'suv', 
        name: 'SUV', 
        capacity: 6, 
        price_multiplier: 1.3,
        features: ['تهویه مطبوع', 'رادیو', 'فضای بیشتر']
      },
      { 
        id: 'van', 
        name: 'ون', 
        capacity: 12, 
        price_multiplier: 1.8,
        features: ['تهویه مطبوع', 'رادیو', 'فضای زیاد', 'مناسب گروه‌ها']
      },
      { 
        id: 'luxury', 
        name: 'لوکس', 
        capacity: 4, 
        price_multiplier: 2.5,
        features: ['تهویه مطبوع', 'رادیو', 'چرم', 'سرویس ویژه']
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl md:text-6xl font-bold">UI مدرن و پیشرفته</h1>
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              تجربه کاربری مدرن و انیمیشن‌های پیشرفته برای سیستم رزرو یکپارچه
            </p>
          </motion.div>
        </div>
        
        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 w-16 h-16 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute top-32 right-32 w-12 h-12 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-white/10 rounded-full"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Product Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              انتخاب نوع محصول
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'tour', name: 'تور', color: 'blue', icon: '🗺️' },
                { id: 'event', name: 'رویداد', color: 'purple', icon: '🎭' },
                { id: 'transfer', name: 'ترانسفر', color: 'green', icon: '🚗' }
              ].map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 text-center ${
                      selectedProduct === product.id
                        ? `bg-${product.color}-500 text-white shadow-lg`
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedProduct(product.id as any)}
                  >
                    <div className="text-4xl mb-3">{product.icon}</div>
                    <div className="text-lg font-bold">{product.name}</div>
                    <div className="text-sm opacity-80 mt-1">
                      {selectedProduct === product.id ? 'انتخاب شده' : 'کلیک کنید'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Modern Product Specific UI */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProduct === 'tour' && 'تور - انتخاب پکیج و تاریخ'}
                {selectedProduct === 'event' && 'رویداد - انتخاب بلیط و صندلی'}
                {selectedProduct === 'transfer' && 'ترانسفر - انتخاب مسیر و خودرو'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFeatures(!showFeatures)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>ویژگی‌ها</span>
                </button>
              </div>
            </div>
            
            <ModernProductSpecificSelector
              productType={selectedProduct}
              data={getProductData()}
              onSelect={handleSelect}
            />
          </div>
        </motion.div>

        {/* Features Showcase */}
        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  ویژگی‌های مدرن
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'انیمیشن‌های پیشرفته',
                      description: 'انیمیشن‌های نرم و طبیعی با Framer Motion',
                      icon: '✨',
                      color: 'blue'
                    },
                    {
                      title: 'طراحی واکنش‌گرا',
                      description: 'سازگار با تمام دستگاه‌ها و اندازه‌ها',
                      icon: '📱',
                      color: 'green'
                    },
                    {
                      title: 'Dark Mode',
                      description: 'پشتیبانی کامل از حالت تاریک',
                      icon: '🌙',
                      color: 'purple'
                    },
                    {
                      title: 'تعامل پیشرفته',
                      description: 'Hover effects و micro-interactions',
                      icon: '🎯',
                      color: 'red'
                    },
                    {
                      title: 'Performance',
                      description: 'بهینه‌سازی شده برای سرعت بالا',
                      icon: '⚡',
                      color: 'yellow'
                    },
                    {
                      title: 'Accessibility',
                      description: 'دسترسی‌پذیر برای همه کاربران',
                      icon: '♿',
                      color: 'indigo'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AdvancedCard
                        variant="glassmorphism"
                        hoverEffect="lift"
                        animation="fadeIn"
                        className="h-full"
                      >
                        <div className="text-center space-y-4">
                          <div className="text-4xl">{feature.icon}</div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {feature.description}
                          </p>
                        </div>
                      </AdvancedCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Data Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              داده‌های انتخاب شده
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">آماده برای استفاده!</h2>
            <p className="text-xl text-blue-100 mb-6">
              سیستم رزرو یکپارچه با UI مدرن آماده است
            </p>
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <span>شروع کنید</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                <span>مشاهده مستندات</span>
                <CheckCircle className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 