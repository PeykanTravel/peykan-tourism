'use client';

import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import MainContent from './MainContent';
import BookingSidebar from './BookingSidebar';
import { 
  ProgressStep, 
  BookingSummary, 
  BookingState,
  UnifiedProductConfig 
} from '@/lib/types/unified-booking';

interface UnifiedBookingPageProps {
  productType: 'tour' | 'event' | 'transfer';
  productId: string;
  productData: any;
  config: UnifiedProductConfig;
  onBookingComplete?: (booking: any) => void;
  className?: string;
}

export default function UnifiedBookingPage({
  productType,
  productId,
  productData,
  config,
  onBookingComplete,
  className = ''
}: UnifiedBookingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProceeding, setIsProceeding] = useState(false);

  // Initialize progress steps from config
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);

  useEffect(() => {
    const steps: ProgressStep[] = config.steps.map((step, index) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      isCompleted: false,
      isActive: index === 0,
      isDisabled: false
    }));
    setProgressSteps(steps);
  }, [config]);

  // Initialize booking summary
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    productInfo: {
      id: productId,
      title: productData.title || 'محصول',
      image: productData.image,
      type: productType,
      basePrice: productData.base_price || productData.price || 0,
      currency: productData.currency || 'USD'
    },
    selectedOptions: [],
    pricing: {
      basePrice: productData.base_price || productData.price || 0,
      optionsTotal: 0,
      total: productData.base_price || productData.price || 0,
      currency: productData.currency || 'USD'
    },
    totalPrice: productData.base_price || productData.price || 0,
    currency: productData.currency || 'USD'
  });

  // Update progress steps based on current step
  useEffect(() => {
    setProgressSteps(prev => prev.map((step, index) => ({
      ...step,
      isCompleted: index < currentStep,
      isActive: index === currentStep,
      isDisabled: index > currentStep
    })));
  }, [currentStep]);

  // Handle step navigation
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Handle form data changes
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Update booking summary based on form data
    updateBookingSummary(field, value);
  };

  // Update booking summary
  const updateBookingSummary = (field: string, value: any) => {
    setBookingSummary(prev => {
      const newSummary = { ...prev };

      // Update based on field type
      switch (field) {
        case 'variant':
          if (productData.variants) {
            const variant = productData.variants.find((v: any) => v.id === value);
            if (variant) {
              newSummary.productInfo.basePrice = variant.base_price || variant.price;
              newSummary.pricing.basePrice = variant.base_price || variant.price;
            }
          }
          break;

        case 'participants':
          if (value && typeof value === 'object') {
            newSummary.participants = value;
            // Recalculate pricing based on participants
            const totalParticipants = (value.adult || 0) + (value.child || 0) + (value.infant || 0);
            newSummary.pricing.basePrice = (productData.base_price || productData.price || 0) * totalParticipants;
          }
          break;

        case 'schedule':
          if (value && typeof value === 'object') {
            newSummary.schedule = {
              date: value.date,
              time: value.time
            };
          }
          break;

        case 'seats':
          if (Array.isArray(value)) {
            newSummary.seats = value;
            // Recalculate pricing based on seats
            const seatsTotal = value.reduce((sum: number, seat: any) => sum + (seat.price || 0), 0);
            newSummary.pricing.basePrice = seatsTotal;
          }
          break;

        case 'selectedOptions':
          if (Array.isArray(value)) {
            newSummary.selectedOptions = value;
            const optionsTotal = value.reduce((sum: number, option: any) => 
              sum + ((option.price || 0) * (option.quantity || 1)), 0);
            newSummary.pricing.optionsTotal = optionsTotal;
          }
          break;
      }

      // Recalculate total
      newSummary.pricing.total = newSummary.pricing.basePrice + newSummary.pricing.optionsTotal;
      newSummary.totalPrice = newSummary.pricing.total;

      return newSummary;
    });
  };

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const currentStepConfig = config.steps[currentStep];
    if (!currentStepConfig) return true;

    const newErrors: Record<string, string> = {};

    // Validate required fields
    currentStepConfig.fields.forEach((field: any) => {
      const fieldName = typeof field === 'string' ? field : field.name;
      const fieldLabel = typeof field === 'string' ? field : field.label || field.name;
      const fieldRequired = typeof field === 'string' ? false : field.required || false;
      const value = formData[fieldName];
      
      if (fieldRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[fieldName] = `${fieldLabel} الزامی است`;
      }

      // Additional validation
      if (typeof field !== 'string' && field.validation) {
        if (field.validation.min && value < field.validation.min) {
          newErrors[fieldName] = `${fieldLabel} باید حداقل ${field.validation.min} باشد`;
        }
        if (field.validation.max && value > field.validation.max) {
          newErrors[fieldName] = `${fieldLabel} باید حداکثر ${field.validation.max} باشد`;
        }
        if (field.validation.custom) {
          const customError = field.validation.custom(value);
          if (customError) {
            newErrors[fieldName] = customError;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle proceed to next step
  const handleProceed = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === config.steps.length - 1) {
      // Final step - complete booking
      await handleCompleteBooking();
    } else {
      // Move to next step
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle booking completion
  const handleCompleteBooking = async () => {
    setIsProceeding(true);
    
    try {
      const bookingData = {
        productId,
        productType,
        formData,
        summary: bookingSummary,
        timestamp: new Date().toISOString()
      };

      // Call completion callback
      if (onBookingComplete) {
        await onBookingComplete(bookingData);
      }

      // Here you would typically:
      // 1. Send to backend API
      // 2. Add to cart
      // 3. Redirect to cart page
      
      console.log('Booking completed:', bookingData);
      
    } catch (error) {
      console.error('Booking completion failed:', error);
      setErrors({ submit: 'خطا در تکمیل رزرو' });
    } finally {
      setIsProceeding(false);
    }
  };

  // Render current step content
  const renderCurrentStepContent = () => {
    const currentStepConfig = config.steps[currentStep];
    if (!currentStepConfig) return null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {currentStepConfig.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {currentStepConfig.description}
          </p>
        </div>

        <div className="space-y-4">
          {currentStepConfig.fields.map((field: any) => {
            const fieldName = typeof field === 'string' ? field : field.name;
            const fieldLabel = typeof field === 'string' ? field : field.label || field.name;
            const fieldRequired = typeof field === 'string' ? false : field.required || false;
            
            return (
              <div key={fieldName}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {fieldLabel}
                  {fieldRequired && <span className="text-red-500 mr-1">*</span>}
                </label>
                
                {/* Render field based on type */}
                {renderField(field)}
                
                {errors[fieldName] && (
                  <p className="mt-1 text-sm text-red-600">{errors[fieldName]}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render form field
  const renderField = (field: any) => {
    const fieldName = typeof field === 'string' ? field : field.name;
    const fieldType = typeof field === 'string' ? 'text' : field.type || 'text';
    const value = formData[fieldName];
    const error = errors[fieldName];

    switch (fieldType) {
      case 'text':
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFormDataChange(fieldName, e.target.value)}
            placeholder={typeof field === 'string' ? '' : field.placeholder}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={fieldType === 'textarea' ? 4 : 1}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleFormDataChange(fieldName, parseInt(e.target.value) || 0)}
            placeholder={typeof field === 'string' ? '' : field.placeholder}
            min={typeof field === 'string' ? undefined : field.validation?.min}
            max={typeof field === 'string' ? undefined : field.validation?.max}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFormDataChange(fieldName, e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{typeof field === 'string' ? 'انتخاب کنید' : field.placeholder || 'انتخاب کنید'}</option>
            {typeof field !== 'string' && field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFormDataChange(fieldName, e.target.value)}
            placeholder={typeof field === 'string' ? '' : field.placeholder}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar
            steps={progressSteps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <MainContent
              currentStep={currentStep}
              totalSteps={config.steps.length}
              productType={productType}
            >
              {renderCurrentStepContent()}
            </MainContent>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar
              summary={bookingSummary}
              currentStep={currentStep}
              totalSteps={config.steps.length}
              onProceed={handleProceed}
              isProceeding={isProceeding}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 