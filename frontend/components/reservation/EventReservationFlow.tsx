'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Star } from 'lucide-react';
import { useReservationStore } from '@/lib/stores/reservationStore';
import ReservationLayout from './ReservationLayout';
import ReservationSteps from './ReservationSteps';
import PricingSummary from './PricingSummary';
import SeatMap from '../events/SeatMap';
import PerformanceSelector from '../events/PerformanceSelector';

interface EventReservationFlowProps {
  event: any;
  onComplete: (reservationData: any) => void;
}

export default function EventReservationFlow({ event, onComplete }: EventReservationFlowProps) {
  const t = useTranslations('eventReservation');
  const params = useParams();
  const locale = params.locale as string;
  
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    isLoading,
    setLoading,
    error,
    setError
  } = useReservationStore();

  // Event-specific state
  const [selectedPerformance, setSelectedPerformance] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [pricingBreakdown, setPricingBreakdown] = useState<any>(null);

  // Define steps for event reservation
  const steps = [
    {
      id: 1,
      title: t('selectPerformance'),
      description: t('chooseDateTime'),
      isComplete: !!selectedPerformance,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: t('selectSeats'),
      description: t('chooseSectionAndSeats'),
      isComplete: selectedSeats.length > 0,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: t('addOptions'),
      description: t('selectAdditionalServices'),
      isComplete: true, // Options are optional
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: t('reviewAndConfirm'),
      description: t('reviewBookingDetails'),
      isComplete: false,
      isActive: currentStep === 4
    }
  ];

  // Handle performance selection
  const handlePerformanceSelect = (performance: any) => {
    setSelectedPerformance(performance);
    setSelectedSection(null);
    setSelectedSeats([]);
    setSelectedTicketType(null);
    nextStep();
  };

  // Handle section selection
  const handleSectionSelect = (section: any) => {
    setSelectedSection(section);
    setSelectedSeats([]);
    setSelectedTicketType(null);
  };

  // Handle seat selection
  const handleSeatSelect = (seat: any) => {
    if (seat.status === 'available') {
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleSeatDeselect = (seat: any) => {
    setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
  };

  // Handle ticket type selection
  const handleTicketTypeSelect = (ticketType: any) => {
    setSelectedTicketType(ticketType);
  };

  // Handle option selection
  const handleOptionSelect = (option: any, quantity: number) => {
    setSelectedOptions(prev => {
      const existing = prev.find(o => o.id === option.id);
      if (existing) {
        return prev.map(o => o.id === option.id ? { ...o, quantity } : o);
      } else {
        return [...prev, { ...option, quantity }];
      }
    });
  };

  // Calculate pricing when selections change
  useEffect(() => {
    const calculatePricing = async () => {
      if (!selectedPerformance || !selectedSeats.length === 0) {
        setPricingBreakdown(null);
        return;
      }

      try {
        setLoading(true);
        
        // Call API to calculate pricing
        const response = await fetch('/api/v1/events/calculate-pricing/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: event.id,
            performance_id: selectedPerformance.id,
            selected_seats: selectedSeats.map(seat => seat.id),
            selected_options: selectedOptions.map(opt => ({
              option_id: opt.id,
              quantity: opt.quantity
            }))
          })
        });

        if (response.ok) {
          const pricing = await response.json();
          setPricingBreakdown(pricing);
        } else {
          setError(t('pricingCalculationError'));
        }
      } catch (error) {
        setError(t('pricingCalculationError'));
      } finally {
        setLoading(false);
      }
    };

    calculatePricing();
  }, [selectedPerformance, selectedSeats, selectedOptions, event.id, setLoading, setError, t]);

  // Handle step navigation
  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // Handle booking completion
  const handleCompleteBooking = async () => {
    if (!selectedPerformance || selectedSeats.length === 0) {
      setError(t('incompleteSelection'));
      return;
    }

    try {
      setLoading(true);
      
      // Create reservation data
      const reservationData = {
        productType: 'event',
        productId: event.id,
        productTitle: event.title,
        productSlug: event.slug,
        bookingDate: selectedPerformance.date,
        bookingTime: selectedPerformance.start_time,
        quantity: selectedSeats.length,
        unitPrice: pricingBreakdown?.base_price || 0,
        totalPrice: pricingBreakdown?.total_amount || 0,
        currency: pricingBreakdown?.currency || 'USD',
        variantId: selectedTicketType?.id,
        variantName: selectedTicketType?.name,
        selectedOptions: selectedOptions.map(opt => ({
          id: opt.id,
          name: opt.name,
          price: opt.price,
          quantity: opt.quantity
        })),
        optionsTotal: pricingBreakdown?.options_total || 0,
        bookingData: {
          performance_id: selectedPerformance.id,
          section_name: selectedSection?.name,
          ticket_type_id: selectedTicketType?.id,
          selected_seats: selectedSeats.map(seat => ({
            id: seat.id,
            seat_number: seat.seat_number,
            row_number: seat.row_number,
            section: seat.section,
            price: seat.price
          })),
          venue_name: event.venue?.name,
          venue_address: event.venue?.address
        }
      };

      onComplete(reservationData);
      
    } catch (error) {
      setError(t('bookingError'));
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('selectPerformance')}</h2>
            <PerformanceSelector
              performances={event.performances}
              selectedPerformance={selectedPerformance}
              onPerformanceSelect={handlePerformanceSelect}
            />
          </div>
        );

      case 2:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('selectSeats')}</h2>
            {selectedPerformance && (
              <SeatMap
                performance={selectedPerformance}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
                onSectionSelect={handleSectionSelect}
                selectedSection={selectedSection}
              />
            )}
          </div>
        );

      case 3:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('addOptions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.options?.map((option: any) => (
                <div key={option.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{option.name}</h3>
                    <span className="text-blue-600 font-semibold">
                      ${option.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  {/* Add quantity selector here */}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('reviewAndConfirm')}</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{selectedPerformance?.date}</p>
                  <p className="text-sm text-gray-600">{selectedPerformance?.start_time}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{event.venue?.name}</p>
                  <p className="text-sm text-gray-600">{event.venue?.address}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{t('selectedSeats')}</p>
                  <p className="text-sm text-gray-600">
                    {selectedSeats.map(seat => `${seat.section} ${seat.row_number}${seat.seat_number}`).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ReservationLayout
      title={t('eventReservation')}
      subtitle={event.title}
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      showPricingSummary={true}
      pricingSummary={
        pricingBreakdown && (
          <PricingSummary
            items={[
              {
                label: t('tickets'),
                amount: pricingBreakdown.base_price,
                currency: pricingBreakdown.currency,
                quantity: selectedSeats.length
              },
              ...selectedOptions.map(opt => ({
                label: opt.name,
                amount: opt.price * opt.quantity,
                currency: pricingBreakdown.currency,
                quantity: opt.quantity
              }))
            ]}
            subtotal={pricingBreakdown.subtotal}
            taxAmount={pricingBreakdown.tax_amount}
            totalAmount={pricingBreakdown.total_amount}
            currency={pricingBreakdown.currency}
            discountAmount={pricingBreakdown.discount_amount}
            discountCode={pricingBreakdown.discount_code}
          />
        )
      }
      isLoading={isLoading}
      error={error}
    >
      <div className="space-y-6">
        {renderStepContent()}
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={previousStep}
            disabled={currentStep === 1}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('previous')}
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !selectedPerformance) ||
                (currentStep === 2 && selectedSeats.length === 0)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
            </button>
          ) : (
            <button
              onClick={handleCompleteBooking}
              disabled={!pricingBreakdown}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('confirmBooking')}
            </button>
          )}
        </div>
      </div>
    </ReservationLayout>
  );
} 