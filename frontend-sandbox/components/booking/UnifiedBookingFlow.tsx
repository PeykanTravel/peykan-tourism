'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { getProductConfig } from '@/lib/config/productConfigs';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle,
  MapPin,
  Calendar,
  Users,
  Settings,
  CreditCard,
  ArrowRight,
  Clock,
  Car,
  Ticket,
  Star
} from 'lucide-react';

interface BookingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
}

interface Product {
  id: string;
  type: 'tour' | 'event' | 'transfer';
  title: string;
  price: number;
  currency: string;
}

interface UnifiedBookingFlowProps {
  product: Product;
  onComplete: (bookingData: any) => void;
  onCancel: () => void;
}

export default function UnifiedBookingFlow({
  product,
  onComplete,
  onCancel
}: UnifiedBookingFlowProps) {
  const t = useTranslations('booking');
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState<any>({
    selectedVariant: null,
    selectedDate: null,
    selectedTime: null,
    participants: { adults: 1, children: 0, infants: 0 },
    selectedOptions: [],
    personalInfo: {},
    paymentMethod: 'credit_card'
  });

  // Get product configuration
  const productConfig = getProductConfig(product.type);
  const steps = productConfig.steps;

  const updateStepStatus = (stepIndex: number, isCompleted: boolean) => {
    const updatedSteps = steps.map((step, index) => ({
      ...step,
      isCompleted: index < stepIndex ? true : step.isCompleted,
      isActive: index === stepIndex
    }));
    
    if (isCompleted) {
      updatedSteps[stepIndex].isCompleted = true;
    }
    
    return updatedSteps;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const updatedSteps = updateStepStatus(currentStep, true);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (stepIndex <= currentStep || steps[stepIndex].isCompleted) {
      setCurrentStep(stepIndex);
    }
  };

  const handleComplete = () => {
    onComplete({
      product,
      ...bookingData,
      completedAt: new Date().toISOString()
    });
  };

  const updateBookingData = (field: string, value: any) => {
    setBookingData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];
    
    switch (currentStepData.id) {
      case 'tour-selection':
      case 'event-selection':
      case 'route-selection':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mb-4">
                {product.type === 'tour' && <MapPin className="w-16 h-16 text-blue-600 mx-auto" />}
                {product.type === 'event' && <Ticket className="w-16 h-16 text-purple-600 mx-auto" />}
                {product.type === 'transfer' && <Car className="w-16 h-16 text-green-600 mx-auto" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{product.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {product.type === 'tour' ? 'تور انتخاب شده' : 
                     product.type === 'event' ? 'ایونت انتخاب شده' : 'ترانسفر انتخاب شده'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'variant-selection':
      case 'vehicle-selection':
      case 'ticket-selection':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Settings className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.type === 'tour' && (
                <>
                  <Card className="p-4 cursor-pointer hover:border-blue-300 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">پکیج استاندارد</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">شامل راهنما و حمل و نقل</p>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}
                    </div>
                  </Card>
                  <Card className="p-4 cursor-pointer hover:border-blue-300 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">پکیج پریمیوم</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">شامل راهنما، حمل و نقل و غذا</p>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fa-IR').format(product.price * 1.5)} {product.currency}
                    </div>
                  </Card>
                </>
              )}
              
              {product.type === 'event' && (
                <>
                  <Card className="p-4 cursor-pointer hover:border-purple-300 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">بلیط عادی</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">دسترسی عمومی</p>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}
                    </div>
                  </Card>
                  <Card className="p-4 cursor-pointer hover:border-purple-300 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">بلیط VIP</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">دسترسی ویژه و خدمات اضافی</p>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {new Intl.NumberFormat('fa-IR').format(product.price * 2)} {product.currency}
                    </div>
                  </Card>
                </>
              )}
              
              {product.type === 'transfer' && (
                <>
                  <Card className="p-4 cursor-pointer hover:border-green-300 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">خودرو اقتصادی</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">مناسب برای 4 نفر</p>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}
                    </div>
                  </Card>
                  <Card className="p-4 cursor-pointer hover:border-green-300 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">خودرو لوکس</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">مناسب برای 6 نفر</p>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('fa-IR').format(product.price * 1.8)} {product.currency}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        );

      case 'schedule-selection':
      case 'performance-selection':
      case 'date-time-selection':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">انتخاب تاریخ</h4>
                <div className="space-y-2">
                  {['امروز', 'فردا', 'پس‌فردا'].map((date, index) => (
                    <button
                      key={date}
                      className="w-full p-3 text-left border rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{date}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('fa-IR')}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">انتخاب زمان</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                    <button
                      key={time}
                      className="p-2 border rounded-lg hover:border-blue-300 transition-colors text-sm"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'participants':
      case 'passengers':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { type: 'adults', label: 'بزرگسالان', description: '11 سال به بالا' },
                { type: 'children', label: 'کودکان', description: '2-10 سال' },
                { type: 'infants', label: 'نوزادان', description: '0-2 سال' }
              ].map(({ type, label, description }) => (
                <Card key={type} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-300">
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {bookingData.participants[type]}
                      </span>
                      <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-blue-300">
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'options':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Settings className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'insurance', name: 'بیمه مسافرتی', price: 50000, description: 'پوشش کامل بیمه' },
                { id: 'guide', name: 'راهنمای خصوصی', price: 100000, description: 'راهنمای اختصاصی' },
                { id: 'meal', name: 'وعده غذایی', price: 75000, description: 'شامل ناهار و شام' }
              ].map((option) => (
                <Card key={option.id} className="p-4 cursor-pointer hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{option.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {new Intl.NumberFormat('fa-IR').format(option.price)} {product.currency}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'personal-info':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="شماره تلفن خود را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ایمیل
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ایمیل خود را وارد کنید"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  آدرس
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="آدرس خود را وارد کنید"
                />
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {currentStepData.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 cursor-pointer hover:border-red-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-red-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">کارت اعتباری</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">پرداخت امن با کارت</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 cursor-pointer hover:border-red-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <Star className="w-8 h-8 text-red-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">پرداخت نقدی</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">پرداخت در محل</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">خلاصه سفارش</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">قیمت پایه:</span>
                  <span className="font-medium">{new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">تعداد نفرات:</span>
                  <span className="font-medium">{bookingData.participants.adults + bookingData.participants.children + bookingData.participants.infants} نفر</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">گزینه‌های اضافی:</span>
                  <span className="font-medium">0 {product.currency}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>مجموع:</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('fa-IR').format(product.price)} {product.currency}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300">
              {t('stepNotImplemented')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('booking')} - {product.title}
          </h1>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center min-w-0">
              <button
                onClick={() => handleStepClick(index)}
                className={`flex items-center space-x-2 p-2 rounded-lg transition-colors whitespace-nowrap ${
                  step.isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : step.isCompleted
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
              >
                {step.isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                <span className="hidden sm:inline text-sm font-medium">
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="bg-white dark:bg-gray-800 mb-6">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t('previous')}</span>
        </Button>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('step')} {currentStep + 1} {t('of')} {steps.length}
        </div>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleComplete}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <span>{t('complete')}</span>
            <CheckCircle className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2"
          >
            <span>{t('next')}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 