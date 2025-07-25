'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../../lib/contexts/AuthContext';
import { useCart } from '../../../../lib/hooks/useCart';
import { useTransferBookingStore } from '@/lib/stores/transferBookingStore';
import { BookingStep } from '@/lib/types/transfers';
import BookingSteps from './components/BookingSteps';
import RouteSelection from './components/RouteSelection';
import VehicleSelection from './components/VehicleSelection';
import DateTimeSelection from './components/DateTimeSelection';
import PassengerSelection from './components/PassengerSelection';
import OptionsSelection from './components/OptionsSelection';
import ContactForm from './components/ContactForm';
import BookingSummary from './components/BookingSummary';

const STEPS: { key: BookingStep; title: string; description: string }[] = [
  { key: 'route', title: 'انتخاب مسیر', description: 'مبدا و مقصد خود را انتخاب کنید' },
  { key: 'vehicle', title: 'انتخاب خودرو', description: 'نوع خودرو مناسب را انتخاب کنید' },
  { key: 'datetime', title: 'تاریخ و زمان', description: 'تاریخ و زمان سفر را مشخص کنید' },
  { key: 'passengers', title: 'مسافران و بار', description: 'تعداد مسافران و بار را وارد کنید' },
  { key: 'options', title: 'آپشن‌ها', description: 'آپشن‌های اضافی را انتخاب کنید' },
  { key: 'contact', title: 'اطلاعات تماس', description: 'اطلاعات تماس و آدرس‌ها را وارد کنید' },
  { key: 'summary', title: 'تایید نهایی', description: 'اطلاعات را بررسی و تایید کنید' },
];

export default function TransferBookingPage() {
  const t = useTranslations('transfers');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale as string;
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  
  // Get booking state from store
  const {
    current_step,
    setCurrentStep,
    isStepValid,
    getNextStep,
    getPreviousStep,
    calculatePrice,
    addToCart,
    clearBookingData,
    updateBookingData,
  } = useTransferBookingStore();

  // Initialize from URL params
  useEffect(() => {
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const route_id = searchParams.get('route_id');

    if (origin && destination && route_id) {
      // If we have route_id, we should fetch the route data
      // This will be handled by the RouteSelection component
    }
  }, [searchParams]);

  // Check for pending transfer booking after login
  useEffect(() => {
    if (isAuthenticated) {
      const completeBookingData = localStorage.getItem('completeTransferBooking');
      if (completeBookingData) {
        try {
          const bookingData = JSON.parse(completeBookingData);
          
          // Restore booking data to store
          updateBookingData({
            route_data: bookingData.route_data,
            vehicle_type: bookingData.vehicle_type,
            trip_type: bookingData.trip_type,
            outbound_date: bookingData.outbound_date,
            outbound_time: bookingData.outbound_time,
            return_date: bookingData.return_date,
            return_time: bookingData.return_time,
            passenger_count: bookingData.passenger_count,
            luggage_count: bookingData.luggage_count,
            selected_options: bookingData.selected_options,
            pickup_address: bookingData.pickup_address,
            dropoff_address: bookingData.dropoff_address,
            contact_name: bookingData.contact_name,
            contact_phone: bookingData.contact_phone,
            special_requirements: bookingData.special_requirements,
            pricing_breakdown: bookingData.pricing_breakdown,
            final_price: bookingData.final_price,
            current_step: 'summary'
          });
          
                     // Auto-complete the booking
           setTimeout(async () => {
             const result = await addToCart();
             if (result.success) {
               // Refresh cart to update navbar count
               await refreshCart();
               // Clear the stored booking data
               localStorage.removeItem('completeTransferBooking');
               // Redirect to cart with locale
               router.push(`/${locale}/cart`);
             } else {
               console.error('Failed to complete booking:', result.error);
               // Stay on current step for manual retry
               setCurrentStep('summary');
             }
           }, 1000);
          
        } catch (error) {
          console.error('Error processing pending booking:', error);
          localStorage.removeItem('completeTransferBooking');
        }
      }
    }
  }, [isAuthenticated, addToCart, updateBookingData, router, setCurrentStep]);

  // Navigation functions
  const nextStep = () => {
    const next = getNextStep();
    if (next) {
      setCurrentStep(next);
      
      // Auto-calculate price when moving to summary step
      if (next === 'summary') {
        calculatePrice();
      }
    }
  };

  const prevStep = () => {
    const prev = getPreviousStep();
    if (prev) {
      setCurrentStep(prev);
    }
  };

  const goToStep = (step: BookingStep) => {
    const currentIndex = STEPS.findIndex(s => s.key === current_step);
    const targetIndex = STEPS.findIndex(s => s.key === step);
    
    // Only allow going to:
    // 1. Previous steps (completed)
    // 2. Current step
    // 3. Next step (only if current step is valid)
    if (targetIndex < currentIndex || 
        targetIndex === currentIndex || 
        (targetIndex === currentIndex + 1 && isStepValid(current_step))) {
      setCurrentStep(step);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    const result = await addToCart();
    if (result.success) {
      // Refresh cart to update navbar count
      await refreshCart();
      router.push(`/${locale}/cart`);
    } else {
      // Handle error - could show a toast notification
      console.error('Failed to add to cart:', result.error);
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (current_step) {
      case 'route':
        return (
          <RouteSelection
            onNext={nextStep}
          />
        );
      case 'vehicle':
        return (
          <VehicleSelection
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'datetime':
        return (
          <DateTimeSelection
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'passengers':
        return (
          <PassengerSelection
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'options':
        return (
          <OptionsSelection
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'contact':
        return (
          <ContactForm
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'summary':
        return (
          <BookingSummary
            onBack={prevStep}
            onConfirm={handleConfirmBooking}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t('customTransferBooking')}
              </h1>
              <p className="text-sm text-gray-600">
                {t('bookYourTransferInSteps')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <BookingSteps
          steps={STEPS}
          currentStep={current_step}
          onStepClick={goToStep}
          isStepValid={isStepValid}
        />

        {/* Step Content */}
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
} 