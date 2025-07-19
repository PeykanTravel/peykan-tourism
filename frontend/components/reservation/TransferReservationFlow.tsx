'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { 
  MapPin, 
  Car, 
  Calendar, 
  Clock, 
  Users, 
  Luggage,
  ArrowRight,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useReservationStore } from '@/lib/stores/reservationStore';
import ReservationLayout from './ReservationLayout';
import ReservationSteps from './ReservationSteps';
import PricingSummary from './PricingSummary';

interface TransferReservationFlowProps {
  onComplete: (reservationData: any) => void;
}

export default function TransferReservationFlow({ onComplete }: TransferReservationFlowProps) {
  const t = useTranslations('transferReservation');
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

  // Transfer-specific state
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [pricingBreakdown, setPricingBreakdown] = useState<any>(null);

  // Available routes and vehicles (mock data)
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Define steps for transfer reservation
  const steps = [
    {
      id: 1,
      title: t('selectRoute'),
      description: t('chooseOriginAndDestination'),
      isComplete: !!selectedRoute,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: t('selectVehicle'),
      description: t('chooseVehicleType'),
      isComplete: !!selectedVehicle,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: t('selectSchedule'),
      description: t('chooseDateAndTime'),
      isComplete: !!pickupDate && !!pickupTime,
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
      title: t('contactInfo'),
      description: t('provideContactDetails'),
      isComplete: !!pickupAddress && !!dropoffAddress,
      isActive: currentStep === 5
    },
    {
      id: 6,
      title: t('reviewAndConfirm'),
      description: t('reviewBookingDetails'),
      isComplete: false,
      isActive: currentStep === 6
    }
  ];

  // Load routes and vehicles on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Mock data - replace with API calls
        const mockRoutes = [
          { id: '1', name: 'Airport to City Center', origin: 'Tehran Airport', destination: 'City Center', distance: '45 km' },
          { id: '2', name: 'City Center to Airport', origin: 'City Center', destination: 'Tehran Airport', distance: '45 km' },
          { id: '3', name: 'Hotel to Airport', origin: 'Hotel District', destination: 'Tehran Airport', distance: '40 km' }
        ];
        
        const mockVehicles = [
          { id: '1', name: 'Economy Car', type: 'economy', capacity: 4, price: 50 },
          { id: '2', name: 'Comfort Car', type: 'comfort', capacity: 4, price: 70 },
          { id: '3', name: 'Van', type: 'van', capacity: 8, price: 100 },
          { id: '4', name: 'Luxury Car', type: 'luxury', capacity: 4, price: 120 }
        ];
        
        setRoutes(mockRoutes);
        setVehicles(mockVehicles);
        
      } catch (error) {
        setError(t('failedToLoadData'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setLoading, setError, t]);

  // Handle route selection
  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route);
    setSelectedVehicle(null);
    nextStep();
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    nextStep();
  };

  // Handle trip type change
  const handleTripTypeChange = (type: 'one_way' | 'round_trip') => {
    setTripType(type);
    if (type === 'one_way') {
      setReturnDate('');
      setReturnTime('');
    }
  };

  // Handle passenger count change
  const handlePassengerChange = (change: number) => {
    const newCount = passengerCount + change;
    if (newCount >= 1 && newCount <= 20) {
      setPassengerCount(newCount);
    }
  };

  // Handle luggage count change
  const handleLuggageChange = (change: number) => {
    const newCount = luggageCount + change;
    if (newCount >= 0 && newCount <= 10) {
      setLuggageCount(newCount);
    }
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
      if (!selectedRoute || !selectedVehicle || !pickupDate || !pickupTime) {
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
            product_type: 'transfer',
            route_id: selectedRoute.id,
            vehicle_type: selectedVehicle.type,
            trip_type: tripType,
            pickup_date: pickupDate,
            pickup_time: pickupTime,
            return_date: tripType === 'round_trip' ? returnDate : undefined,
            return_time: tripType === 'round_trip' ? returnTime : undefined,
            passenger_count: passengerCount,
            luggage_count: luggageCount,
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
  }, [selectedRoute, selectedVehicle, tripType, pickupDate, pickupTime, returnDate, returnTime, passengerCount, luggageCount, selectedOptions, setLoading, setError, t]);

  // Handle step navigation
  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // Handle booking completion
  const handleCompleteBooking = async () => {
    if (!selectedRoute || !selectedVehicle || !pickupDate || !pickupTime || !pickupAddress || !dropoffAddress) {
      setError(t('incompleteSelection'));
      return;
    }

    try {
      setLoading(true);
      
      // Create reservation data
      const reservationData = {
        productType: 'transfer',
        productId: selectedRoute.id,
        productTitle: selectedRoute.name,
        productSlug: `transfer-${selectedRoute.id}`,
        bookingDate: pickupDate,
        bookingTime: pickupTime,
        quantity: 1,
        unitPrice: pricingBreakdown?.base_price || 0,
        totalPrice: pricingBreakdown?.total_amount || 0,
        currency: pricingBreakdown?.currency || 'USD',
        variantId: selectedVehicle.id,
        variantName: selectedVehicle.name,
        selectedOptions: selectedOptions.map(opt => ({
          id: opt.id,
          name: opt.name,
          price: opt.price,
          quantity: opt.quantity
        })),
        optionsTotal: pricingBreakdown?.options_total || 0,
        bookingData: {
          route_id: selectedRoute.id,
          vehicle_type: selectedVehicle.type,
          trip_type: tripType,
          pickup_address: pickupAddress,
          dropoff_address: dropoffAddress,
          passenger_count: passengerCount,
          luggage_count: luggageCount,
          return_date: tripType === 'round_trip' ? returnDate : null,
          return_time: tripType === 'round_trip' ? returnTime : null
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
            <h2 className="text-xl font-semibold mb-4">{t('selectRoute')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => handleRouteSelect(route)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedRoute?.id === route.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold mb-2">{route.name}</h3>
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{route.origin}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <ArrowRight className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{route.destination}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {route.distance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('selectVehicle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => handleVehicleSelect(vehicle)}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{vehicle.name}</h3>
                    <Car className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{t('capacity')}: {vehicle.capacity}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ${vehicle.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('selectSchedule')}</h2>
            
            {/* Trip Type Selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">{t('tripType')}</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleTripTypeChange('one_way')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    tripType === 'one_way'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {t('oneWay')}
                </button>
                <button
                  onClick={() => handleTripTypeChange('round_trip')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    tripType === 'round_trip'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {t('roundTrip')}
                </button>
              </div>
            </div>

            {/* Pickup Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('pickupDate')}</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('pickupTime')}</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Return Details (for round trip) */}
            {tripType === 'round_trip' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('returnDate')}</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('returnTime')}</label>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Passenger and Luggage Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('passengers')}</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handlePassengerChange(-1)}
                    disabled={passengerCount <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{passengerCount}</span>
                  <button
                    onClick={() => handlePassengerChange(1)}
                    disabled={passengerCount >= 20}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('luggage')}</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleLuggageChange(-1)}
                    disabled={luggageCount <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{luggageCount}</span>
                  <button
                    onClick={() => handleLuggageChange(1)}
                    disabled={luggageCount >= 10}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('addOptions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mock options */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{t('meetAndGreet')}</h3>
                  <span className="text-blue-600 font-semibold">$10</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('meetAndGreetDesc')}</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{t('childSeat')}</h3>
                  <span className="text-blue-600 font-semibold">$5</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{t('childSeatDesc')}</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('contactInfo')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('pickupAddress')} *</label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder={t('enterPickupAddress')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('dropoffAddress')} *</label>
                <input
                  type="text"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  placeholder={t('enterDropoffAddress')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">{t('reviewAndConfirm')}</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{selectedRoute?.name}</p>
                  <p className="text-sm text-gray-600">{selectedRoute?.origin} → {selectedRoute?.destination}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Car className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{selectedVehicle?.name}</p>
                  <p className="text-sm text-gray-600">{t('capacity')}: {selectedVehicle?.capacity}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{pickupDate} {pickupTime}</p>
                  <p className="text-sm text-gray-600">{tripType === 'round_trip' ? t('roundTrip') : t('oneWay')}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">{passengerCount} {t('passengers')}</p>
                  <p className="text-sm text-gray-600">{luggageCount} {t('luggage')}</p>
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
      title={t('transferReservation')}
      subtitle={t('bookYourTransfer')}
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
                quantity: 1
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
          
          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && !selectedRoute) ||
                (currentStep === 2 && !selectedVehicle) ||
                (currentStep === 3 && (!pickupDate || !pickupTime)) ||
                (currentStep === 5 && (!pickupAddress || !dropoffAddress))
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