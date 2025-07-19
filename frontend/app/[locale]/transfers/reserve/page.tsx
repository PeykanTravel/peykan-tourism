/**
 * Transfer Reservation Page
 * 
 * This page implements the transfer reservation flow following DDD principles
 * and Clean Architecture patterns.
 * 
 * Responsibilities:
 * - Handle transfer-specific reservation logic
 * - Manage route selection and vehicle configuration
 * - Coordinate with reservation domain services
 * - Provide user-friendly interface for transfer booking
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Domain Services
import { reservationService } from '@/lib/services/reservationService';
import { transfersService } from '@/lib/services/transfersService';

// UI Components
import ReservationLayout from '@/components/reservation/ReservationLayout';
import RouteSelector from '@/components/transfers/RouteSelector';
import VehicleSelector from '@/components/transfers/VehicleSelector';
import TripDetailsForm from '@/components/transfers/TripDetailsForm';
import OptionsSelector from '@/components/transfers/OptionsSelector';
import PricingSummary from '@/components/reservation/PricingSummary';
import CustomerInfoForm from '@/components/reservation/CustomerInfoForm';

// Domain Types
interface TransferReservationState {
  routeId: string | null;
  vehicleType: string | null;
  tripType: 'one_way' | 'round_trip';
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  passengerCount: number;
  luggageCount: number;
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
    id: 'route',
    title: 'Select Route',
    description: 'Choose pickup and destination',
    isCompleted: false,
    isActive: true,
    isDisabled: false,
  },
  {
    id: 'vehicle',
    title: 'Select Vehicle',
    description: 'Choose your vehicle type',
    isCompleted: false,
    isActive: false,
    isDisabled: true,
  },
  {
    id: 'trip',
    title: 'Trip Details',
    description: 'Enter trip information',
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

export default function TransferReservationPage() {
  const t = useTranslations('transferReservation');
  const router = useRouter();
  
  // State Management
  const [currentStep, setCurrentStep] = useState('route');
  const [steps, setSteps] = useState(RESERVATION_STEPS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reservationState, setReservationState] = useState<TransferReservationState>({
    routeId: null,
    vehicleType: null,
    tripType: 'one_way',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    passengerCount: 1,
    luggageCount: 0,
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

  // Transfer Data
  const [routes, setRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [transferOptions, setTransferOptions] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  // Effects
  useEffect(() => {
    loadTransferData();
  }, []);

  useEffect(() => {
    if (reservationState.routeId) {
      loadVehicles();
    }
  }, [reservationState.routeId, reservationState.tripType]);

  useEffect(() => {
    updateSteps();
  }, [currentStep, reservationState]);

  // Data Loading Functions
  const loadTransferData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const routesData = await transfersService.getTransferRoutes();
      setRoutes(routesData);
      
      const optionsData = await transfersService.getTransferOptions();
      setTransferOptions(optionsData);
      
    } catch (err) {
      setError(t('errors.loadTransfersFailed'));
      console.error('Failed to load transfer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const vehiclesData = await reservationService.getAvailableVehicles(
        reservationState.routeId!,
        reservationState.tripType
      );
      setVehicles(vehiclesData);
      
    } catch (err) {
      setError(t('errors.loadVehiclesFailed'));
      console.error('Failed to load vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step Management
  const updateSteps = () => {
    const updatedSteps = steps.map((step) => {
      let isCompleted = false;
      let isActive = step.id === currentStep;
      let isDisabled = false;

      switch (step.id) {
        case 'route':
          isCompleted = !!reservationState.routeId;
          isDisabled = false;
          break;
        case 'vehicle':
          isCompleted = !!reservationState.vehicleType;
          isDisabled = !reservationState.routeId;
          break;
        case 'trip':
          isCompleted = !!(
            reservationState.pickupDate &&
            reservationState.pickupTime &&
            reservationState.passengerCount > 0
          );
          isDisabled = !reservationState.vehicleType;
          break;
        case 'options':
          isCompleted = true; // Optional step
          isDisabled = !(
            reservationState.pickupDate &&
            reservationState.pickupTime &&
            reservationState.passengerCount > 0
          );
          break;
        case 'customer':
          isCompleted = !!(
            reservationState.customerInfo.name &&
            reservationState.customerInfo.email &&
            reservationState.customerInfo.phone
          );
          isDisabled = !(
            reservationState.pickupDate &&
            reservationState.pickupTime &&
            reservationState.passengerCount > 0
          );
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
  const handleRouteSelect = useCallback((routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    setSelectedRoute(route);
    
    setReservationState(prev => ({
      ...prev,
      routeId,
      vehicleType: null, // Reset vehicle when route changes
      selectedOptions: [], // Reset options when route changes
    }));
    
    setCurrentStep('vehicle');
  }, [routes]);

  const handleVehicleSelect = useCallback((vehicleType: string) => {
    setReservationState(prev => ({
      ...prev,
      vehicleType,
    }));
    
    setCurrentStep('trip');
  }, []);

  const handleTripDetailsChange = useCallback((tripDetails: any) => {
    setReservationState(prev => ({
      ...prev,
      ...tripDetails,
    }));
    
    // Calculate pricing
    calculatePricing(tripDetails);
  }, []);

  const handleOptionsChange = useCallback((options: any[]) => {
    setReservationState(prev => ({
      ...prev,
      selectedOptions: options,
    }));
    
    // Calculate pricing
    calculatePricing({
      passengerCount: reservationState.passengerCount,
      luggageCount: reservationState.luggageCount,
    });
  }, [reservationState.passengerCount, reservationState.luggageCount]);

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
  const calculatePricing = async (tripDetails?: any) => {
    if (!reservationState.routeId || !reservationState.vehicleType) {
      setReservationState(prev => ({ ...prev, pricing: null }));
      return;
    }

    const details = tripDetails || {
      passengerCount: reservationState.passengerCount,
      luggageCount: reservationState.luggageCount,
    };

    try {
      const pricing = await reservationService.calculatePricing({
        product_type: 'transfer',
        route_id: reservationState.routeId,
        vehicle_type: reservationState.vehicleType,
        trip_type: reservationState.tripType,
        passenger_count: details.passengerCount,
        luggage_count: details.luggageCount,
        selected_options: reservationState.selectedOptions,
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
        product_type: 'transfer',
        route_id: reservationState.routeId!,
        vehicle_type: reservationState.vehicleType!,
        trip_type: reservationState.tripType,
        pickup_date: reservationState.pickupDate,
        pickup_time: reservationState.pickupTime,
        passenger_count: reservationState.passengerCount,
        luggage_count: reservationState.luggageCount,
      });

      if (!availability.available) {
        setError(availability.message);
        return;
      }

      // Create reservation
      const reservation = await reservationService.createReservation({
        items: [{
          product_type: 'transfer',
          product_id: reservationState.routeId!,
          product_title: `${selectedRoute?.from_location} to ${selectedRoute?.to_location}`,
          product_slug: selectedRoute?.slug || '',
          booking_date: reservationState.pickupDate,
          booking_time: reservationState.pickupTime,
          quantity: 1,
          unit_price: reservationState.pricing!.total_amount,
          total_price: reservationState.pricing!.total_amount,
          currency: reservationState.pricing!.currency,
          selected_options: reservationState.selectedOptions,
          options_total: reservationState.pricing!.options_total,
          booking_data: {
            route_id: reservationState.routeId,
            vehicle_type: reservationState.vehicleType,
            trip_type: reservationState.tripType,
            pickup_date: reservationState.pickupDate,
            pickup_time: reservationState.pickupTime,
            return_date: reservationState.returnDate,
            return_time: reservationState.returnTime,
            passenger_count: reservationState.passengerCount,
            luggage_count: reservationState.luggageCount,
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
      case 'route':
        return (
          <RouteSelector
            routes={routes}
            selectedRouteId={reservationState.routeId}
            onSelect={handleRouteSelect}
          />
        );

      case 'vehicle':
        return (
          <VehicleSelector
            vehicles={vehicles}
            selectedVehicleType={reservationState.vehicleType}
            onSelect={handleVehicleSelect}
            route={selectedRoute}
            tripType={reservationState.tripType}
          />
        );

      case 'trip':
        return (
          <TripDetailsForm
            tripDetails={{
              tripType: reservationState.tripType,
              pickupDate: reservationState.pickupDate,
              pickupTime: reservationState.pickupTime,
              returnDate: reservationState.returnDate,
              returnTime: reservationState.returnTime,
              passengerCount: reservationState.passengerCount,
              luggageCount: reservationState.luggageCount,
            }}
            onTripDetailsChange={handleTripDetailsChange}
            vehicle={vehicles.find(v => v.type === reservationState.vehicleType)}
          />
        );

      case 'options':
        return (
          <OptionsSelector
            options={transferOptions}
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
                  <h4 className="font-medium">{t('review.route')}</h4>
                  <p className="text-gray-600">
                    {selectedRoute?.from_location} → {selectedRoute?.to_location}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t('review.vehicle')}</h4>
                  <p className="text-gray-600">
                    {vehicles.find(v => v.type === reservationState.vehicleType)?.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t('review.trip')}</h4>
                  <p className="text-gray-600">
                    {reservationState.pickupDate} at {reservationState.pickupTime}
                    {reservationState.tripType === 'round_trip' && (
                      <span>
                        <br />
                        Return: {reservationState.returnDate} at {reservationState.returnTime}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t('review.passengers')}</h4>
                  <p className="text-gray-600">
                    {reservationState.passengerCount} passengers, {reservationState.luggageCount} luggage
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