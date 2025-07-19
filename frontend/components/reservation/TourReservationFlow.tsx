'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  Plus,
  Minus,
  CheckCircle
} from 'lucide-react';
import { useReservationStore } from '@/lib/stores/reservationStore';
import ReservationLayout from './ReservationLayout';
import ReservationSteps from './ReservationSteps';
import PricingSummary from './PricingSummary';

interface TourReservationFlowProps {
  tour: any;
  onComplete: (reservationData: any) => void;
}

export default function TourReservationFlow({ tour, onComplete }: TourReservationFlowProps) {
  const t = useTranslations('tourReservation');
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

  // Tour-specific state
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [participants, setParticipants] = useState({
    adult: 1,
    child: 0,
    infant: 0
  });
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pricingBreakdown, setPricingBreakdown] = useState<any>(null);

  // Define steps for tour reservation
  const steps = [
    {
      id: 1,
      title: t('selectSchedule'),
      description: t('chooseDateAndTime'),
      isComplete: !!selectedSchedule,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: t('selectVariant'),
      description: t('chooseTourPackage'),
      isComplete: !!selectedVariant,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: t('selectParticipants'),
      description: t('chooseNumberOfPeople'),
      isComplete: participants.adult > 0,
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: t('addOptions'),
      description: t('selectAdditionalServices'),
      isComplete: true, // Options are optional
      isActive: currentStep === 4
    },
    {
      id: 5,
      title: t('reviewAndConfirm'),
      description: t('reviewBookingDetails'),
      isComplete: false,
      isActive: currentStep === 5
    }
  ];

  // Handle schedule selection
  const handleScheduleSelect = (schedule: any) => {
    setSelectedSchedule(schedule);
    nextStep();
  };

  // Handle variant selection
  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    nextStep();
  };

  // Handle participant changes
  const handleParticipantChange = (type: 'adult' | 'child' | 'infant', change: number) => {
    setParticipants(prev => {
      const newValue = prev[type] + change;
      if (newValue < 0) return prev;
      
      // Ensure at least one adult
      if (type === 'adult' && newValue === 0) return prev;
      
      return { ...prev, [type]: newValue };
    });
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
      if (!selectedSchedule || !selectedVariant || participants.adult === 0) {
        setPricingBreakdown(null);
        return;
      }

      try {
        setLoading(true);
        
        // Call API to calculate pricing
        const response = await fetch('/api/v1/reservations/calculate-pricing/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_type: 'tour',
            product_id: tour.id,
            booking_date: selectedSchedule.date,
            booking_time: selectedSchedule.start_time,
            variant_id: selectedVariant.id,
            participants: participants,
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
  }, [selectedSchedule, selectedVariant, participants, selectedOptions, tour.id, setLoading, setError, t]);

  // Handle step navigation
  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // Handle booking completion
  const handleCompleteBooking = async () => {
    if (!selectedSchedule || !selectedVariant || participants.adult === 0) {
      setError(t('incompleteSelection'));
      return;
    }

    try {
      setLoading(true);
      
      // Create reservation data
      const reservationData = {
        productType: 'tour',
        productId: tour.id,
        productTitle: tour.title,
        productSlug: tour.slug,
        bookingDate: selectedSchedule.date,
        bookingTime: selectedSchedule.start_time,
        quantity: participants.adult + participants.child + participants.infant,
        unitPrice: pricingBreakdown?.base_price || 0,
        totalPrice: pricingBreakdown?.total_amount || 0,
        currency: pricingBreakdown?.currency || 'USD',
        variantId: selectedVariant.id,
        variantName: selectedVariant.name,
        selectedOptions: selectedOptions.map(opt => ({
          id: opt.id,
          name: opt.name,
          price: opt.price,
          quantity: opt.quantity
        })),
        optionsTotal: pricingBreakdown?.options_total || 0,
        bookingData: {
          schedule_id: selectedSchedule.id,
          participants: participants,
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation
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
            <h2 className="text-xl font-semibold mb-4">{t('selectSchedule')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tour.schedules?.map((schedule: any) => (
                <div
                  key={schedule.id}
                  onClick={() => handleScheduleSelect(schedule)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSchedule?.id === schedule.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{schedule.date}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{schedule.start_time}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {t('availableSpots')}: {schedule.available_capacity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('selectVariant')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tour.variants?.map((variant: any) => (
                <div
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant)}
                  className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                    selectedVariant?.id === variant.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">{variant.name}</h3>
                  <p className="text-gray-600 mb-4">{variant.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${variant.base_price}
                    </span>
                    {variant.is_popular && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        {t('popular')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('selectParticipants')}</h2>
            <div className="space-y-4">
              {Object.entries(participants).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium capitalize">{t(type)}</h3>
                    <p className="text-sm text-gray-600">{t(`${type}Description`)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleParticipantChange(type as any, -1)}
                      disabled={type === 'adult' && count === 1}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{count}</span>
                    <button
                      onClick={() => handleParticipantChange(type as any, 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('addOptions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tour.options?.map((option: any) => (
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

      case 5:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('reviewAndConfirm')}</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{selectedSchedule?.date}</p>
                  <p className="text-sm text-gray-600">{selectedSchedule?.start_time}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{selectedVariant?.name}</p>
                  <p className="text-sm text-gray-600">{selectedVariant?.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{t('participants')}</p>
                  <p className="text-sm text-gray-600">
                    {participants.adult} {t('adults')}, {participants.child} {t('children')}, {participants.infant} {t('infants')}
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
      title={t('tourReservation')}
      subtitle={tour.title}
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      showPricingSummary={true}
      pricingSummary={
        pricingBreakdown && (
          <PricingSummary
            items={[
              {
                label: t('basePrice'),
                amount: pricingBreakdown.base_price,
                currency: pricingBreakdown.currency,
                quantity: participants.adult + participants.child + participants.infant
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
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !selectedSchedule) ||
                (currentStep === 2 && !selectedVariant) ||
                (currentStep === 3 && participants.adult === 0)
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