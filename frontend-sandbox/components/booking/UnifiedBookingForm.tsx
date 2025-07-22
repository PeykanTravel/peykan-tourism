'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Calendar, Users, MapPin, Car, Ticket, Clock, Check } from 'lucide-react';
import { Product, ProductConfig, FormField } from '../../lib/types/product';
import { PriceDisplay } from '../ui/Price';

interface UnifiedBookingFormProps {
  product: Product;
  config: ProductConfig;
  mode?: 'inline' | 'modal' | 'multi-step';
  onBookingComplete: (booking: any) => void;
  onStepChange?: (step: number) => void;
  currentStep?: number;
  onFormDataChange?: (data: any) => void;
}

export default function UnifiedBookingForm({ 
  product, 
  config, 
  mode = 'multi-step',
  onBookingComplete,
  onStepChange,
  currentStep: externalCurrentStep,
  onFormDataChange
}: UnifiedBookingFormProps) {
  const [internalCurrentStep, setInternalCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use external current step if provided, otherwise use internal
  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalCurrentStep;
  const setCurrentStep = (step: number) => {
    if (externalCurrentStep !== undefined) {
      onStepChange?.(step);
    } else {
      setInternalCurrentStep(step);
    }
  };

  // Initialize form data based on product type
  useEffect(() => {
    const initialData: any = {};
    
    // Initialize based on product type
    if (product.type === 'tour') {
      initialData.variant = '';
      initialData.schedule = '';
      initialData.participants = { adult: 1, child: 0, infant: 0 };
      initialData.options = [];
    } else if (product.type === 'event') {
      initialData.performance = '';
      initialData.ticketType = '';
      initialData.section = '';
      initialData.seats = [];
    } else if (product.type === 'transfer') {
      initialData.route = '';
      initialData.vehicleType = '';
      initialData.passengers = 1;
      initialData.pickup = '';
      initialData.dropoff = '';
    }
    
    setFormData(initialData);
  }, [product]);

  const handleFieldChange = (fieldName: string, value: any) => {
    const newFormData = {
      ...formData,
      [fieldName]: value
    };
    
    setFormData(newFormData);
    
    // Notify parent component
    onFormDataChange?.(newFormData);
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const currentStepData = config.steps[step];
    if (!currentStepData) return true;

    const newErrors: Record<string, string> = {};

    // Validate required fields for current step
    currentStepData.fields.forEach((field: any) => {
      const fieldName = typeof field === 'string' ? field : field.name;
      const value = formData[fieldName];
      
      if (currentStepData.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[fieldName] = `${fieldName} الزامی است`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < config.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotalPrice = (): number => {
    return config.pricing.calculatePrice(product, formData);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      const booking = {
        productId: product.id,
        productType: product.type,
        ...formData,
        totalPrice: calculateTotalPrice(),
        currency: product.currency,
        timestamp: new Date().toISOString()
      };

      onBookingComplete(booking);
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ submit: 'خطا در ثبت رزرو' });
    }
  };

  const renderField = (fieldName: string, index: number) => {
    const currentStepData = config.steps[index];
    if (!currentStepData) {
      return null;
    }
    
    // Check if field exists in current step and get field config
    const fieldConfig = currentStepData.fields.find((field: any) => 
      typeof field === 'string' ? field === fieldName : field.name === fieldName
    );
    
    if (!fieldConfig) {
      return null;
    }
    
    // Get field type
    const fieldType = typeof fieldConfig === 'string' ? 'text' : (fieldConfig as any).type || 'text';

    const value = formData[fieldName];
    const error = errors[fieldName];

    switch (fieldType) {
      case 'variant':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              انتخاب پکیج
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.variants?.map((variant) => (
                <div
                  key={variant.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    value === variant.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  onClick={() => handleFieldChange('variant', variant.id)}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white">{variant.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{variant.description}</p>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {variant.price} {product.currency}
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'select':
        // Handle select fields with options
        const currentStepDataForSelect = config.steps[currentStep];
        const fieldConfigForSelect = currentStepDataForSelect?.fields.find((field: any) => 
          typeof field === 'object' && field.name === fieldName
        ) as any;
        
        if (fieldConfigForSelect && fieldConfigForSelect.options) {
          return (
            <div key={fieldName} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {fieldConfigForSelect.label || fieldName}
              </label>
              <select
                value={value || ''}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">{fieldConfigForSelect.placeholder || 'انتخاب کنید'}</option>
                {fieldConfigForSelect.options.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          );
        }
        break;

      case 'schedule':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              انتخاب تاریخ و زمان
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.schedules?.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    value === schedule.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  onClick={() => handleFieldChange('schedule', schedule.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{schedule.date}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{schedule.time}</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {schedule.available_capacity} نفر موجود
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'participants':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تعداد شرکت‌کنندگان
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['adult', 'child', 'infant'].map((ageGroup) => (
                <div key={ageGroup} className="text-center">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {ageGroup === 'adult' ? 'بزرگسال' : ageGroup === 'child' ? 'کودک' : 'نوزاد'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={value?.[ageGroup] || 0}
                    onChange={(e) => handleFieldChange('participants', {
                      ...value,
                      [ageGroup]: parseInt(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'adult':
      case 'child':
      case 'infant':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {fieldName === 'adult' ? 'بزرگسال' : fieldName === 'child' ? 'کودک' : 'نوزاد'}
            </label>
            <input
              type="number"
              min="0"
              value={value || 0}
              onChange={(e) => handleFieldChange(fieldName, parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'quantity':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تعداد
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={value || 1}
              onChange={(e) => handleFieldChange(fieldName, parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تاریخ
            </label>
            <input
              type="date"
              value={value || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'time':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ساعت
            </label>
            <input
              type="time"
              value={value || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              توضیحات
            </label>
            <textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'options':
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              گزینه‌های اضافی
            </label>
            <div className="space-y-3">
              {product.options?.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={value?.includes(option.id) || false}
                    onChange={(e) => {
                      const newOptions = e.target.checked
                        ? [...(value || []), option.id]
                        : (value || []).filter((id: string) => id !== option.id);
                      handleFieldChange('options', newOptions);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={option.id} className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                    {option.name} - {option.price} {product.currency}
                  </label>
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );

      case 'checkbox':
        // Handle checkbox options (like option_insurance, option_parking, etc.)
        if (fieldName.startsWith('option_')) {
          const optionId = fieldName.replace('option_', '');
          const option = product.options?.find(opt => opt.id === optionId);
          
          if (option) {
            return (
              <div key={fieldName} className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={fieldName}
                    checked={value || false}
                    onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={fieldName} className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                    {option.name} - {option.price} {product.currency}
                  </label>
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
            );
          }
        }
        // Fall through to default for other checkbox fields
        break;

      default:
        // Handle text fields (name, phone, email, etc.)
        return (
          <div key={fieldName} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {fieldName === 'name' ? 'نام و نام خانوادگی' :
               fieldName === 'phone' ? 'شماره تلفن' :
               fieldName === 'email' ? 'ایمیل' :
               fieldName === 'flight_number' ? 'شماره پرواز' :
               fieldName === 'special_requests' ? 'درخواست‌های ویژه' :
               fieldName === 'pickup_address' ? 'آدرس سوار شدن' :
               fieldName === 'dropoff_address' ? 'آدرس پیاده شدن' :
               fieldName}
            </label>
            {fieldName === 'special_requests' || fieldName === 'pickup_address' || fieldName === 'dropoff_address' ? (
              <textarea
                value={value || ''}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                rows={3}
                placeholder={fieldName === 'special_requests' ? 'درخواست‌های ویژه خود را بنویسید' :
                           fieldName === 'pickup_address' ? 'آدرس دقیق محل سوار شدن' :
                           'آدرس دقیق محل پیاده شدن'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <input
                type={fieldName === 'email' ? 'email' : fieldName === 'phone' ? 'tel' : 'text'}
                value={value || ''}
                onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                placeholder={fieldName === 'name' ? 'نام و نام خانوادگی' :
                           fieldName === 'phone' ? 'شماره تلفن' :
                           fieldName === 'email' ? 'ایمیل' :
                           fieldName === 'flight_number' ? 'شماره پرواز' : ''}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
    }
  };

  const getStepIcon = (step: any) => {
    switch (step.id) {
      case 'variant':
      case 'tour-selection':
        return Users;
      case 'schedule':
      case 'date-selection':
        return Calendar;
      case 'participants':
        return Users;
      case 'options':
        return Check;
      default:
        return Clock;
    }
  };

  if (!config.steps || config.steps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">هیچ مرحله‌ای برای این محصول تعریف نشده است</p>
      </div>
    );
  }

  const currentStepData = config.steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            مراحل رزرو
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} از {config.steps.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {config.steps.map((step, index) => {
            const Icon = getStepIcon(step);
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isActive = index <= currentStep;
            
            return (
              <div key={`step-${step.id}-${index}`} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white' 
                        : isActive 
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 text-center ${
                    isCurrent 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : isActive 
                        ? 'text-gray-600 dark:text-gray-300' 
                        : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < config.steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    isActive ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Content */}
      <Card className="bg-white dark:bg-gray-800">
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentStepData?.title}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {currentStepData?.description}
          </p>
          
          {currentStepData?.fields.map((field: any) => {
            const fieldName = typeof field === 'string' ? field : field.name;
            return (
              <div key={fieldName}>
                {renderField(fieldName, currentStep)}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Pricing Summary */}
      {currentStep > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">قیمت کل:</h4>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            <PriceDisplay amount={calculateTotalPrice()} currency={product.currency} />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>قبلی</span>
        </Button>

        {currentStep < config.steps.length - 1 ? (
          <Button
            onClick={nextStep}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <span>بعدی</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4" />
            <span>تکمیل رزرو</span>
          </Button>
        )}
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}
    </div>
  );
} 