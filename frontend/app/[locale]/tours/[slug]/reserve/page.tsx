/**
 * Tour Reservation Page
 * 
 * This page implements the tour reservation flow following DDD principles
 * and Clean Architecture patterns.
 * 
 * Responsibilities:
 * - Handle tour-specific reservation logic
 * - Manage participant selection and scheduling
 * - Coordinate with reservation domain services
 * - Provide user-friendly interface for tour booking
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Domain Services
import { reservationService } from '@/lib/services/reservationService';
import { toursService } from '@/lib/services/toursService';

// UI Components
import ReservationLayout from '@/components/reservation/ReservationLayout';
import TourVariantSelector from '@/components/tours/TourVariantSelector';
import ScheduleSelector from '@/components/tours/ScheduleSelector';
import ParticipantSelector from '@/components/tours/ParticipantSelector';
import OptionsSelector from '@/components/tours/OptionsSelector';
import PricingSummary from '@/components/reservation/PricingSummary';
import CustomerInfoForm from '@/components/reservation/CustomerInfoForm';

// Domain Types
interface TourReservationState {
  tourId: string;
  variantId: string | null;
  scheduleId: string | null;
  participants: Record<string, number>;
  selectedOptions: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    specialRequirements: string;
  };
  pricing: {
    base_price: number;
    variant_price: number;
    options_total: number;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    discount_amount: number;
    discount_code: string;
  } | null;
  availability: {
    available: boolean;
    message: string;
    details?: any;
  } | null;
}

interface ReservationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

// Reservation Steps Configuration
const RESERVATION_STEPS: ReservationStep[] = [
  {
    id: 'variant',
    title: 'Select Tour Package',
    description: 'Choose your tour variant',
    isCompleted: false,
    isActive: true,
    isDisabled: false,
  },
  {
    id: 'schedule',
    title: 'Select Date & Time',
    description: 'Choose your preferred schedule',
    isCompleted: false,
    isActive: false,
    isDisabled: true,
  },
  {
    id: 'participants',
    title: 'Select Participants',
    description: 'Choose number of participants',
    isCompleted: false,
    isActive: false,
    isDisabled: true,
  },
  {
    id: 'options',
    title: 'Add Options',
    description: 'Select additional services',
    isCompleted: false,
    isActive: false,
    isDisabled: true,
  },
  {
    id: 'customer',
    title: 'Customer Information',
    description: 'Enter your details',
    isCompleted: false,
    isActive: false,
    isDisabled: true,
  },
  {
    id: 'review',
    title: 'Review & Confirm',
    description: 'Review your booking',
    isCompleted: false,
    isActive: false,
    isDisabled: true,
  },
];

export default function TourReservationPage() {
  const t = useTranslations('tourReservation');
  const params = useParams();
  const router = useRouter();
  
  // State Management
  const [currentStep, setCurrentStep] = useState('variant');
  const [steps, setSteps] = useState(RESERVATION_STEPS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reservationState, setReservationState] = useState<TourReservationState>({
    tourId: params.slug as string,
    variantId: null,
    scheduleId: null,
    participants: {},
    selectedOptions: [],
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      specialRequirements: '',
    },
    pricing: null,
    availability: null,
  });

  // Tour Data
  const [tour, setTour] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [tourOptions, setTourOptions] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);

  // Effects
  useEffect(() => {
    loadTourData();
  }, [params.slug]);

  useEffect(() => {
    if (reservationState.variantId) {
      loadSchedules();
      loadPricing();
    }
  }, [reservationState.variantId]);

  useEffect(() => {
    updateSteps();
  }, [currentStep, reservationState]);

  // Data Loading Functions
  const loadTourData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tourData = await toursService.getTourBySlug(params.slug as string);
      setTour(tourData);
      
      const variantsData = await toursService.getTourVariants(tourData.id);
      setVariants(variantsData);
      
      const optionsData = await toursService.getTourOptions(tourData.id);
      setTourOptions(optionsData);
      
    } catch (err) {
      setError(t('errors.loadTourFailed'));
      console.error('Failed to load tour data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const schedulesData = await reservationService.getAvailableSchedules(
        reservationState.tourId,
        reservationState.variantId!,
        startDate,
        endDate
      );
      setSchedules(schedulesData);
      
    } catch (err) {
      setError(t('errors.loadSchedulesFailed'));
      console.error('Failed to load schedules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPricing = async () => {
    try {
      const pricingData = await toursService.getTourPricing(
        reservationState.tourId,
        reservationState.variantId!
      );
      setPricing(pricingData);
    } catch (err) {
      console.error('Failed to load pricing:', err);
    }
  };

  // Step Management
  const updateSteps = () => {
    const updatedSteps = steps.map((step) => {
      let isCompleted = false;
      let isActive = step.id === currentStep;
      let isDisabled = false;

      switch (step.id) {
        case 'variant':
          isCompleted = !!reservationState.variantId;
          isDisabled = false;
          break;
        case 'schedule':
          isCompleted = !!reservationState.scheduleId;
          isDisabled = !reservationState.variantId;
          break;
        case 'participants':
          isCompleted = Object.values(reservationState.participants).some(count => count > 0);
          isDisabled = !reservationState.scheduleId;
          break;
        case 'options':
          isCompleted = true; // Optional step
          isDisabled = Object.values(reservationState.participants).every(count => count === 0);
          break;
        case 'customer':
          isCompleted = !!(
            reservationState.customerInfo.name &&
            reservationState.customerInfo.email &&
            reservationState.customerInfo.phone
          );
          isDisabled = Object.values(reservationState.participants).every(count => count === 0);
          break;
        case 'review':
          isCompleted = false;
          isDisabled = !(
            reservationState.customerInfo.name &&
            reservationState.customerInfo.email &&
            reservationState.customerInfo.phone
          );
          break;
      }

      return { ...step, isCompleted, isActive, isDisabled };
    });

    setSteps(updatedSteps);
  };

  // Event Handlers
  const handleVariantSelect = useCallback((variantId: string) => {
    setReservationState(prev => ({
      ...prev,
      variantId,
      scheduleId: null, // Reset schedule when variant changes
      participants: {}, // Reset participants when variant changes
      selectedOptions: [], // Reset options when variant changes
    }));
    
    setCurrentStep('schedule');
  }, []);

  const handleScheduleSelect = useCallback((scheduleId: string) => {
    setReservationState(prev => ({
      ...prev,
      scheduleId,
      participants: {}, // Reset participants when schedule changes
    }));
    
    setCurrentStep('participants');
  }, []);

  const handleParticipantsChange = useCallback((participants: Record<string, number>) => {
    setReservationState(prev => ({
      ...prev,
      participants,
    }));
    
    // Calculate pricing
    calculatePricing(participants, reservationState.selectedOptions);
  }, [reservationState.selectedOptions]);

  const handleOptionsChange = useCallback((options: any[]) => {
    setReservationState(prev => ({
      ...prev,
      selectedOptions: options,
    }));
    
    // Calculate pricing
    calculatePricing(reservationState.participants, options);
  }, [reservationState.participants]);

  const handleCustomerInfoChange = useCallback((customerInfo: any) => {
    setReservationState(prev => ({
      ...prev,
      customerInfo,
    }));
  }, []);

  const handleStepChange = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step && !step.isDisabled) {
      setCurrentStep(stepId);
    }
  }, [steps]);

  const handleBack = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      if (!prevStep.isDisabled) {
        setCurrentStep(prevStep.id);
      }
    }
  }, [currentStep, steps]);

  const handleNext = useCallback(() => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (!nextStep.isDisabled) {
        setCurrentStep(nextStep.id);
      }
    }
  }, [currentStep, steps]);

  // Business Logic Functions
  const calculatePricing = async (participants: Record<string, number>, options: any[]) => {
    if (!reservationState.variantId || Object.values(participants).every(count => count === 0)) {
      setReservationState(prev => ({ ...prev, pricing: null }));
      return;
    }

    try {
      const pricing = await reservationService.calculatePricing({
        product_type: 'tour',
        tour_id: reservationState.tourId,
        variant_id: reservationState.variantId,
        participants,
        selected_options: options,
        discount_code: '',
      });

      setReservationState(prev => ({ ...prev, pricing }));
    } catch (err) {
      console.error('Failed to calculate pricing:', err);
    }
  };

  const handleReservationSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const selectedSchedule = schedules.find(s => s.id === reservationState.scheduleId);
      const totalParticipants = Object.values(reservationState.participants).reduce((sum, count) => sum + count, 0);

      // Check availability
      const availability = await reservationService.checkAvailability({
        product_type: 'tour',
        tour_id: reservationState.tourId,
        variant_id: reservationState.variantId!,
        booking_date: selectedSchedule?.date,
        booking_time: selectedSchedule?.start_time,
        participants: reservationState.participants,
      });

      if (!availability.available) {
        setError(availability.message);
        return;
      }

      // Create reservation
      const reservation = await reservationService.createReservation({
        items: [{
          product_type: 'tour',
          product_id: reservationState.tourId,
          product_title: tour.title,
          product_slug: tour.slug,
          booking_date: selectedSchedule?.date,
          booking_time: selectedSchedule?.start_time,
          quantity: totalParticipants,
          unit_price: reservationState.pricing!.base_price / totalParticipants,
          total_price: reservationState.pricing!.total_amount,
          currency: reservationState.pricing!.currency,
          variant_id: reservationState.variantId,
          variant_name: variants.find(v => v.id === reservationState.variantId)?.name,
          selected_options: reservationState.selectedOptions,
          options_total: reservationState.pricing!.options_total,
          booking_data: {
            tour_id: reservationState.tourId,
            variant_id: reservationState.variantId,
            schedule_id: reservationState.scheduleId,
            participants: reservationState.participants,
          },
        }],
        customer_name: reservationState.customerInfo.name,
        customer_email: reservationState.customerInfo.email,
        customer_phone: reservationState.customerInfo.phone,
        special_requirements: reservationState.customerInfo.specialRequirements,
      });

      // Redirect to confirmation page
      router.push(`/orders/${reservation.reservation_number}`);

    } catch (err) {
      setError(t('errors.reservationFailed'));
      console.error('Failed to create reservation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'variant':
        return (
          <TourVariantSelector
            variants={variants}
            selectedVariantId={reservationState.variantId}
            onSelect={handleVariantSelect}
            tour={tour}
          />
        );

      case 'schedule':
        return (
          <ScheduleSelector
            schedules={schedules}
            selectedScheduleId={reservationState.scheduleId}
            onSelect={handleScheduleSelect}
            variant={variants.find(v => v.id === reservationState.variantId)}
          />
        );

      case 'participants':
        return (
          <ParticipantSelector
            pricing={pricing}
            participants={reservationState.participants}
            onParticipantsChange={handleParticipantsChange}
            maxParticipants={variants.find(v => v.id === reservationState.variantId)?.max_participants}
          />
        );

      case 'options':
        return (
          <OptionsSelector
            options={tourOptions}
            selectedOptions={reservationState.selectedOptions}
            onOptionsChange={handleOptionsChange}
          />
        );

      case 'customer':
        return (
          <CustomerInfoForm
            customerInfo={reservationState.customerInfo}
            onCustomerInfoChange={handleCustomerInfoChange}
          />
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">{t('review.title')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{tour?.title}</h4>
                  <p className="text-gray-600">
                    {variants.find(v => v.id === reservationState.variantId)?.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t('review.schedule')}</h4>
                  <p className="text-gray-600">
                    {schedules.find(s => s.id === reservationState.scheduleId)?.date} at{' '}
                    {schedules.find(s => s.id === reservationState.scheduleId)?.start_time}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t('review.participants')}</h4>
                  <p className="text-gray-600">
                    {Object.entries(reservationState.participants)
                      .filter(([_, count]) => count > 0)
                      .map(([type, count]) => `${type}: ${count}`)
                      .join(', ')}
                  </p>
                </div>
                {reservationState.selectedOptions.length > 0 && (
                  <div>
                    <h4 className="font-medium">{t('review.options')}</h4>
                    <p className="text-gray-600">
                      {reservationState.selectedOptions.map(o => 
                        `${o.name} (x${o.quantity})`
                      ).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {reservationState.pricing && (
              <PricingSummary pricing={reservationState.pricing} />
            )}
            
            <button
              onClick={handleReservationSubmit}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isLoading ? t('review.confirming') : t('review.confirm')}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!tour && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.tourNotFound')}</h1>
          <button
            onClick={() => router.push('/tours')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {t('errors.backToTours')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReservationLayout
      currentStep={currentStep}
      steps={steps}
      onStepChange={handleStepChange}
      onBack={handleBack}
      onNext={handleNext}
      isLoading={isLoading}
      error={error}
    >
      {renderStepContent()}
    </ReservationLayout>
  );
} 