/**
 * Event Reservation Page
 * 
 * This page implements the event reservation flow following DDD principles
 * and Clean Architecture patterns.
 * 
 * Responsibilities:
 * - Handle event-specific reservation logic
 * - Manage seat selection and availability
 * - Coordinate with reservation domain services
 * - Provide user-friendly interface for event booking
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Domain Services
import { reservationService } from '@/lib/services/reservationService';
import { eventsService } from '@/lib/services/eventsService';

// UI Components
import ReservationLayout from '@/components/reservation/ReservationLayout';
import SeatSelection from '@/components/events/SeatSelection';
import PerformanceSelector from '@/components/events/PerformanceSelector';
import OptionsSelector from '@/components/events/OptionsSelector';
import PricingSummary from '@/components/reservation/PricingSummary';
import CustomerInfoForm from '@/components/reservation/CustomerInfoForm';

// Domain Types
interface EventReservationState {
  eventId: string;
  performanceId: string | null;
  selectedSeats: Array<{
    id: string;
    seat_number: string;
    row_number: string;
    section: string;
    price: number;
  }>;
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
    id: 'performance',
    title: 'Select Performance',
    description: 'Choose date and time',
    isCompleted: false,
    isActive: true,
    isDisabled: false,
  },
  {
    id: 'seats',
    title: 'Select Seats',
    description: 'Choose your seats',
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

export default function EventReservationPage() {
  const t = useTranslations('eventReservation');
  const params = useParams();
  const router = useRouter();
  
  // State Management
  const [currentStep, setCurrentStep] = useState('performance');
  const [steps, setSteps] = useState(RESERVATION_STEPS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reservationState, setReservationState] = useState<EventReservationState>({
    eventId: params.slug as string,
    performanceId: null,
    selectedSeats: [],
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

  // Event Data
  const [event, setEvent] = useState<any>(null);
  const [performances, setPerformances] = useState<any[]>([]);
  const [availableSeats, setAvailableSeats] = useState<any[]>([]);
  const [eventOptions, setEventOptions] = useState<any[]>([]);

  // Effects
  useEffect(() => {
    loadEventData();
  }, [params.slug]);

  useEffect(() => {
    if (reservationState.performanceId) {
      loadAvailableSeats();
    }
  }, [reservationState.performanceId]);

  useEffect(() => {
    updateSteps();
  }, [currentStep, reservationState]);

  // Data Loading Functions
  const loadEventData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const eventData = await eventsService.getEventBySlug(params.slug as string);
      setEvent(eventData);
      
      const performancesData = await eventsService.getEventPerformances(eventData.id);
      setPerformances(performancesData);
      
      const optionsData = await eventsService.getEventOptions(eventData.id);
      setEventOptions(optionsData);
      
    } catch (err) {
      setError(t('errors.loadEventFailed'));
      console.error('Failed to load event data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSeats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const seats = await reservationService.getAvailableSeats(
        reservationState.eventId,
        reservationState.performanceId!
      );
      setAvailableSeats(seats);
      
    } catch (err) {
      setError(t('errors.loadSeatsFailed'));
      console.error('Failed to load available seats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step Management
  const updateSteps = () => {
    const updatedSteps = steps.map((step, index) => {
      let isCompleted = false;
      let isActive = step.id === currentStep;
      let isDisabled = false;

      switch (step.id) {
        case 'performance':
          isCompleted = !!reservationState.performanceId;
          isDisabled = false;
          break;
        case 'seats':
          isCompleted = reservationState.selectedSeats.length > 0;
          isDisabled = !reservationState.performanceId;
          break;
        case 'options':
          isCompleted = true; // Optional step
          isDisabled = reservationState.selectedSeats.length === 0;
          break;
        case 'customer':
          isCompleted = !!(
            reservationState.customerInfo.name &&
            reservationState.customerInfo.email &&
            reservationState.customerInfo.phone
          );
          isDisabled = reservationState.selectedSeats.length === 0;
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
  const handlePerformanceSelect = useCallback((performanceId: string) => {
    setReservationState(prev => ({
      ...prev,
      performanceId,
      selectedSeats: [], // Reset seats when performance changes
      selectedOptions: [], // Reset options when performance changes
    }));
    
    // Move to next step
    setCurrentStep('seats');
  }, []);

  const handleSeatSelection = useCallback((seats: any[]) => {
    setReservationState(prev => ({
      ...prev,
      selectedSeats: seats,
    }));
    
    // Calculate pricing
    calculatePricing(seats, reservationState.selectedOptions);
  }, [reservationState.selectedOptions]);

  const handleOptionsChange = useCallback((options: any[]) => {
    setReservationState(prev => ({
      ...prev,
      selectedOptions: options,
    }));
    
    // Calculate pricing
    calculatePricing(reservationState.selectedSeats, options);
  }, [reservationState.selectedSeats]);

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
  const calculatePricing = async (seats: any[], options: any[]) => {
    if (!reservationState.performanceId || seats.length === 0) {
      setReservationState(prev => ({ ...prev, pricing: null }));
      return;
    }

    try {
      const pricing = await reservationService.calculatePricing({
        product_type: 'event',
        event_id: reservationState.eventId,
        performance_id: reservationState.performanceId,
        selected_seats: seats,
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

      // Check availability
      const availability = await reservationService.checkAvailability({
        product_type: 'event',
        event_id: reservationState.eventId,
        performance_id: reservationState.performanceId!,
        seat_ids: reservationState.selectedSeats.map(s => s.id),
        booking_date: event?.performances?.find((p: any) => p.id === reservationState.performanceId)?.date,
        booking_time: event?.performances?.find((p: any) => p.id === reservationState.performanceId)?.start_time,
      });

      if (!availability.available) {
        setError(availability.message);
        return;
      }

      // Create reservation
      const reservation = await reservationService.createReservation({
        items: [{
          product_type: 'event',
          product_id: reservationState.eventId,
          product_title: event.title,
          product_slug: event.slug,
          booking_date: event?.performances?.find((p: any) => p.id === reservationState.performanceId)?.date,
          booking_time: event?.performances?.find((p: any) => p.id === reservationState.performanceId)?.start_time,
          quantity: reservationState.selectedSeats.length,
          unit_price: reservationState.pricing!.base_price / reservationState.selectedSeats.length,
          total_price: reservationState.pricing!.total_amount,
          currency: reservationState.pricing!.currency,
          selected_options: reservationState.selectedOptions,
          options_total: reservationState.pricing!.options_total,
          booking_data: {
            event_id: reservationState.eventId,
            performance_id: reservationState.performanceId,
            seat_ids: reservationState.selectedSeats.map(s => s.id),
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
      case 'performance':
        return (
          <PerformanceSelector
            performances={performances}
            selectedPerformanceId={reservationState.performanceId}
            onSelect={handlePerformanceSelect}
            event={event}
          />
        );

      case 'seats':
        return (
          <SeatSelection
            availableSeats={availableSeats}
            selectedSeats={reservationState.selectedSeats}
            onSelectionChange={handleSeatSelection}
            performance={performances.find(p => p.id === reservationState.performanceId)}
          />
        );

      case 'options':
        return (
          <OptionsSelector
            options={eventOptions}
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
                  <h4 className="font-medium">{event?.title}</h4>
                  <p className="text-gray-600">
                    {performances.find(p => p.id === reservationState.performanceId)?.date} at{' '}
                    {performances.find(p => p.id === reservationState.performanceId)?.start_time}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t('review.seats')}</h4>
                  <p className="text-gray-600">
                    {reservationState.selectedSeats.map(s => 
                      `${s.section} - Row ${s.row_number}, Seat ${s.seat_number}`
                    ).join(', ')}
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

  if (!event && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.eventNotFound')}</h1>
          <button
            onClick={() => router.push('/events')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {t('errors.backToEvents')}
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