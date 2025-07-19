'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  Luggage,
  CheckCircle,
  Plus,
  Minus,
  ArrowRight,
  Star,
  Shield,
  CreditCard,
  Wifi,
  Coffee,
  Snowflake,
  Music,
  Phone,
  Mail,
  User,
  Info
} from 'lucide-react';
import { useTransfersService } from '@/lib/application/hooks/useTransfersService';
import { useCart } from '@/lib/hooks/useCart';
import { TransferRoute, TransferRoutePricing, TransferOption } from '@/lib/types/api';
import { formatCurrency } from '@/lib/utils';

interface BookingStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

interface PricingBreakdown {
  outbound_price: number;
  return_price: number;
  options_total: number;
  round_trip_discount: number;
  final_price: number;
  currency: string;
  pricing_breakdown: {
    base_price_per_leg: number;
    outbound_surcharges: number;
    return_surcharges: number;
    options: number;
    discount: number;
    total: number;
  };
}

export default function TransferBookingPage() {
  const params = useParams();
  const locale = params.locale as string;
  const { refreshCart } = useCart();
  const t = useTranslations('transferBooking');
  const router = useRouter();
  const { formatPrice, currency: userCurrency } = formatCurrency();
  
  // Use the transfers service
  const { 
    getTransferRoutes, 
    calculateTransferPricing, 
    addTransferToCart,
    getTransferOptions,
    isLoading: transfersLoading,
    error: transfersError 
  } = useTransfersService();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Booking state
  const [selectedRoute, setSelectedRoute] = useState<TransferRoute | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<TransferRoutePricing | null>(null);
  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [outboundDate, setOutboundDate] = useState('');
  const [outboundTime, setOutboundTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
  
  // Contact details
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [dropoffInstructions, setDropoffInstructions] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Data
  const [routes, setRoutes] = useState<TransferRoute[]>([]);
  const [options, setOptions] = useState<TransferOption[]>([]);

  // Booking steps
  const [bookingSteps, setBookingSteps] = useState<BookingStep[]>([
    {
      id: 1,
      title: t('selectRoute'),
      description: t('chooseOriginDestination'),
      isComplete: false,
      isActive: true
    },
    {
      id: 2,
      title: t('selectVehicle'),
      description: t('chooseVehicleType'),
      isComplete: false,
      isActive: false
    },
    {
      id: 3,
      title: t('tripDetails'),
      description: t('setDateTimePassengers'),
      isComplete: false,
      isActive: false
    },
    {
      id: 4,
      title: t('addOptions'),
      description: t('selectAdditionalOptions'),
      isComplete: false,
      isActive: false
    },
    {
      id: 5,
      title: t('contactInfo'),
      description: t('provideContactDetails'),
      isComplete: false,
      isActive: false
    },
    {
      id: 6,
      title: t('review'),
      description: t('reviewAndConfirm'),
      isComplete: false,
      isActive: false
    }
  ]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [routesData, optionsData] = await Promise.all([
          getTransferRoutes(),
          getTransferOptions()
        ]);
        setRoutes(routesData);
        setOptions(optionsData);
        setError(null);
      } catch (err) {
        setError(t('failedToLoadData'));
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getTransferRoutes, getTransferOptions, t]);

  // Update booking steps based on selections
  useEffect(() => {
    setBookingSteps(prev => prev.map(step => ({
      ...step,
      isComplete: step.id === 1 ? !!selectedRoute : 
                  step.id === 2 ? !!selectedVehicle :
                  step.id === 3 ? !!outboundDate && !!outboundTime && passengerCount > 0 :
                  step.id === 4 ? true : // Options are optional
                  step.id === 5 ? !!contactName && !!contactPhone && !!pickupAddress && !!dropoffAddress :
                  step.id === 6 ? !!pricingBreakdown : false,
      isActive: step.id === 1 ? true :
                step.id === 2 ? !!selectedRoute :
                step.id === 3 ? !!selectedVehicle :
                step.id === 4 ? !!outboundDate && !!outboundTime && passengerCount > 0 :
                step.id === 5 ? !!outboundDate && !!outboundTime && passengerCount > 0 :
                step.id === 6 ? !!contactName && !!contactPhone && !!pickupAddress && !!dropoffAddress : false
    })));
  }, [selectedRoute, selectedVehicle, outboundDate, outboundTime, passengerCount, contactName, contactPhone, pickupAddress, dropoffAddress, pricingBreakdown]);

  // Calculate pricing when selections change
  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedRoute || !selectedVehicle || !outboundDate || !outboundTime || passengerCount === 0) {
        setPricingBreakdown(null);
        return;
      }

      try {
        const pricing = await calculateTransferPricing({
          route_id: selectedRoute.id,
          vehicle_type: selectedVehicle.vehicle_type,
          trip_type: tripType,
          outbound_date: outboundDate,
          outbound_time: outboundTime,
          return_date: tripType === 'round_trip' ? returnDate : undefined,
          return_time: tripType === 'round_trip' ? returnTime : undefined,
          selected_options: selectedOptions,
          user_currency: userCurrency
        });
        
        setPricingBreakdown(pricing);
      } catch (error) {
        console.error('Failed to calculate pricing:', error);
      }
    };

    fetchPricing();
  }, [selectedRoute, selectedVehicle, tripType, outboundDate, outboundTime, returnDate, returnTime, selectedOptions, calculateTransferPricing, userCurrency]);

  // Handle route selection
  const handleRouteSelect = (route: TransferRoute) => {
    setSelectedRoute(route);
    setSelectedVehicle(null);
    setCurrentStep(2);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: TransferRoutePricing) => {
    setSelectedVehicle(vehicle);
    setCurrentStep(3);
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

  // Handle booking
  const handleBooking = async () => {
    if (!selectedRoute || !selectedVehicle || !pricingBreakdown) {
      return;
    }

    try {
      setIsBooking(true);
      
      // Add transfer to cart
      await addTransferToCart({
        route_id: selectedRoute.id,
        vehicle_type: selectedVehicle.vehicle_type,
        trip_type: tripType,
        outbound_date: outboundDate,
        outbound_time: outboundTime,
        return_date: tripType === 'round_trip' ? returnDate : undefined,
        return_time: tripType === 'round_trip' ? returnTime : undefined,
        passenger_count: passengerCount,
        luggage_count: luggageCount,
        pickup_address: pickupAddress,
        dropoff_address: dropoffAddress,
        contact_name: contactName,
        contact_phone: contactPhone,
        pickup_instructions: pickupInstructions,
        dropoff_instructions: dropoffInstructions,
        selected_options: selectedOptions,
        special_requirements: specialRequirements
      });

      // Refresh cart
      await refreshCart();
      
      // Navigate to cart
      router.push(`/${locale}/cart`);
      
    } catch (error) {
      console.error('Failed to add transfer to cart:', error);
      setError(t('failedToAddToCart'));
    } finally {
      setIsBooking(false);
    }
  };

  // Loading state
  if (isLoading || transfersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || transfersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{t('error')}</div>
          <p className="text-gray-600">{error || transfersError}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t('back')}
            </button>
            
            <h1 className="text-xl font-semibold text-gray-900">{t('transferBooking')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Booking Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('bookingSteps')}</h2>
              <div className="space-y-4">
                {bookingSteps.map((step) => (
                  <div key={step.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    step.isActive ? 'border-blue-200 bg-blue-50' : 
                    step.isComplete ? 'border-green-200 bg-green-50' : 
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.isComplete ? 'bg-green-500 text-white' :
                      step.isActive ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step.isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Route Selection */}
            {currentStep >= 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('selectRoute')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {routes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => handleRouteSelect(route)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedRoute?.id === route.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{route.name || `${route.origin} → ${route.destination}`}</h3>
                        {route.is_popular && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{route.origin} → {route.destination}</span>
                        </div>
                        
                        {route.description && (
                          <p>{route.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span>{route.booking_count} {t('bookings')}</span>
                          {route.round_trip_discount_enabled && (
                            <span className="text-green-600 font-medium">
                              {route.round_trip_discount_percentage}% {t('roundTripDiscount')}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Selection */}
            {currentStep >= 2 && selectedRoute && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('selectVehicle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedRoute.pricing?.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedVehicle?.id === vehicle.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{vehicle.vehicle_name}</h3>
                        <Car className="h-5 w-5 text-gray-500" />
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{vehicle.vehicle_description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{vehicle.max_passengers} {t('passengers')}</span>
                          </div>
                          <div className="flex items-center">
                            <Luggage className="h-4 w-4 mr-1" />
                            <span>{vehicle.max_luggage} {t('luggage')}</span>
                          </div>
                        </div>
                        
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(vehicle.base_price, vehicle.currency)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Trip Details */}
            {currentStep >= 3 && selectedVehicle && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('tripDetails')}</h2>
                
                {/* Trip Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tripType')}
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTripType('one_way')}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        tripType === 'one_way'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t('oneWay')}
                    </button>
                    <button
                      onClick={() => setTripType('round_trip')}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        tripType === 'round_trip'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t('roundTrip')}
                    </button>
                  </div>
                </div>

                {/* Outbound Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('outboundDate')}
                    </label>
                    <input
                      type="date"
                      value={outboundDate}
                      onChange={(e) => setOutboundDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('outboundTime')}
                    </label>
                    <input
                      type="time"
                      value={outboundTime}
                      onChange={(e) => setOutboundTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Return Details (for round trip) */}
                {tripType === 'round_trip' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('returnDate')}
                      </label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('returnTime')}
                      </label>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Passenger and Luggage Count */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('passengers')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{passengerCount}</span>
                      <button
                        onClick={() => setPassengerCount(Math.min(selectedVehicle.max_passengers, passengerCount + 1))}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('maxPassengers')}: {selectedVehicle.max_passengers}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('luggage')}
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{luggageCount}</span>
                      <button
                        onClick={() => setLuggageCount(Math.min(selectedVehicle.max_luggage, luggageCount + 1))}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('maxLuggage')}: {selectedVehicle.max_luggage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Options Selection */}
            {currentStep >= 4 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('addOptions')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {options.map((option) => (
                    <div key={option.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{option.name}</h3>
                        <span className="text-blue-600 font-semibold">
                          {option.price_type === 'fixed' 
                            ? formatPrice(option.price, 'USD')
                            : `${option.price_percentage}%`
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const currentQty = selectedOptions.find(o => o.id === option.id)?.quantity || 0;
                              if (currentQty > 0) {
                                handleOptionSelect(option, currentQty - 1);
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {selectedOptions.find(o => o.id === option.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentQty = selectedOptions.find(o => o.id === option.id)?.quantity || 0;
                              handleOptionSelect(option, currentQty + 1);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Contact Information */}
            {currentStep >= 5 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('contactInfo')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contactName')} *
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contactPhone')} *
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pickupAddress')} *
                    </label>
                    <textarea
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dropoffAddress')} *
                    </label>
                    <textarea
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('pickupInstructions')}
                    </label>
                    <textarea
                      value={pickupInstructions}
                      onChange={(e) => setPickupInstructions(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('dropoffInstructions')}
                    </label>
                    <textarea
                      value={dropoffInstructions}
                      onChange={(e) => setDropoffInstructions(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('specialRequirements')}
                  </label>
                  <textarea
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('specialRequirementsPlaceholder')}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Review and Booking */}
            {currentStep >= 6 && pricingBreakdown && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t('reviewAndBook')}</h2>
                
                {/* Trip Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-3">{t('tripSummary')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('route')}:</span>
                      <span>{selectedRoute?.name || `${selectedRoute?.origin} → ${selectedRoute?.destination}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('vehicle')}:</span>
                      <span>{selectedVehicle?.vehicle_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('tripType')}:</span>
                      <span>{tripType === 'one_way' ? t('oneWay') : t('roundTrip')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('passengers')}:</span>
                      <span>{passengerCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('luggage')}:</span>
                      <span>{luggageCount}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium mb-3">{t('pricingBreakdown')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('outboundPrice')}:</span>
                      <span>{formatPrice(pricingBreakdown.outbound_price, pricingBreakdown.currency)}</span>
                    </div>
                    {tripType === 'round_trip' && (
                      <div className="flex justify-between">
                        <span>{t('returnPrice')}:</span>
                        <span>{formatPrice(pricingBreakdown.return_price, pricingBreakdown.currency)}</span>
                      </div>
                    )}
                    {pricingBreakdown.options_total > 0 && (
                      <div className="flex justify-between">
                        <span>{t('options')}:</span>
                        <span>{formatPrice(pricingBreakdown.options_total, pricingBreakdown.currency)}</span>
                      </div>
                    )}
                    {pricingBreakdown.round_trip_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('roundTripDiscount')}:</span>
                        <span>-{formatPrice(pricingBreakdown.round_trip_discount, pricingBreakdown.currency)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>{t('total')}:</span>
                        <span>{formatPrice(pricingBreakdown.final_price, pricingBreakdown.currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isBooking}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? t('processing') : t('addToCart')}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Pricing Summary */}
            {pricingBreakdown && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">{t('pricingSummary')}</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>{t('outboundPrice')}</span>
                    <span>{formatPrice(pricingBreakdown.outbound_price, pricingBreakdown.currency)}</span>
                  </div>
                  
                  {tripType === 'round_trip' && (
                    <div className="flex justify-between">
                      <span>{t('returnPrice')}</span>
                      <span>{formatPrice(pricingBreakdown.return_price, pricingBreakdown.currency)}</span>
                    </div>
                  )}
                  
                  {pricingBreakdown.options_total > 0 && (
                    <div className="flex justify-between">
                      <span>{t('options')}</span>
                      <span>{formatPrice(pricingBreakdown.options_total, pricingBreakdown.currency)}</span>
                    </div>
                  )}
                  
                  {pricingBreakdown.round_trip_discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t('discount')}</span>
                      <span>-{formatPrice(pricingBreakdown.round_trip_discount, pricingBreakdown.currency)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('total')}</span>
                      <span>{formatPrice(pricingBreakdown.final_price, pricingBreakdown.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Features */}
            {selectedVehicle && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">{t('vehicleFeatures')}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedVehicle.max_passengers} {t('passengers')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Luggage className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedVehicle.max_luggage} {t('luggage')}</span>
                  </div>
                  
                  {selectedVehicle.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">{t('secureBooking')}</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t('securePayment')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t('multiplePaymentMethods')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{t('instantConfirmation')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 