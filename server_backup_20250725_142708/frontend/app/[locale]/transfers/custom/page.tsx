'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart, TransferCartItem } from '@/lib/hooks/useCart';
import { 
  MapPin, 
  Clock, 
  Car, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
  DollarSign,
  Route,
  Plus,
  Minus,
  Info,
  Plane,
  CalendarDays,
  Package,
  User,
  CreditCard,
  ArrowRightLeft
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
}

// تعریف فقط یک اینترفیس Vehicle مطابق خروجی بک‌اند
interface Vehicle {
  vehicle_type: string;
  vehicle_name: string;
  vehicle_description: string;
  base_price: number;
  max_passengers: number;
  max_luggage: number;
  features: string[];
  amenities: string[];
  images: string[];
}

interface RouteData {
  vehicles: Vehicle[];
  route_found: boolean;
  route_id: string;
  route_name: string;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_duration_minutes: number;
}

interface BookingData {
  origin: string;
  destination: string;
  vehicle_type: string;
  vehicle_name: string;
  base_price: number;
  max_passengers: number;
  max_luggage: number;
  trip_type: 'one_way' | 'round_trip';
  outbound_date: string;
  outbound_time: string;
  return_date: string;
  return_time: string;
  passenger_count: number;
  luggage_count: number;
  selected_options: string[];
  pickup_address: string;
  dropoff_address: string;
  contact_name: string;
  contact_phone: string;
  special_requirements: string;
}

interface TransferLocation {
  id: string;
  name: string;
  city: string;
  country: string;
  is_active: boolean;
}

// حذف اینترفیس TransferVehicle و stateهای تکراری

interface TransferOption {
  id: string;
  name: string;
  description: string;
  option_type: string;
  price_type: string;
  price: number;
  price_percentage: number;
  max_quantity: number | null;
  is_available: boolean;
}

interface PricingData {
  base_price: number;
  time_surcharge: number;
  round_trip_discount: number;
  options_total: number;
  final_price: number;
  pricing_breakdown: {
    base_price: number;
    time_surcharge: number;
    round_trip_discount: number;
    options_total: number;
    final_price: number;
  };
}

interface StepConfig {
  id: number;
  key: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

type BookingStep = 'route' | 'datetime' | 'passengers' | 'options' | 'contact' | 'review';

// Vehicle Price Card Component
interface VehiclePriceCardProps {
  vehicle: Vehicle;
  origin: string;
  destination: string;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
}

const VehiclePriceCard: React.FC<VehiclePriceCardProps> = ({ vehicle, origin, destination, isSelected, onSelect }) => {
  const t = useTranslations('transfers');
  const [price, setPrice] = useState<number>(vehicle.base_price || 0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchPrice = async () => {
      // Always show base price immediately
      const basePrice = vehicle.base_price || 0;
      setPrice(basePrice);
      
      if (!origin || !destination) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch('http://167.235.140.125:8000/api/v1/transfers/routes/calculate_price_public/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin,
            destination,
            vehicle_type: vehicle.vehicle_type
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const calculatedPrice = data.base_price || data.outbound_price || basePrice;
          setPrice(typeof calculatedPrice === 'number' ? calculatedPrice : basePrice);
        } else {
          setPrice(basePrice);
        }
      } catch (error) {
        console.error('Error fetching price:', error);
        setPrice(basePrice);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrice();
  }, [origin, destination, vehicle]);
  
  return (
    <div
      onClick={() => onSelect(vehicle)}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{vehicle.vehicle_name}</h4>
          <div className="text-xs text-gray-500 mt-1">{vehicle.vehicle_type}</div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
            <span className="text-lg font-bold text-blue-600">
              ${(price || 0).toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-gray-500">{t('basePrice')}</div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">👥</span>
            <span className="text-gray-700 font-medium">{vehicle.max_passengers} {t('passengers')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">🧳</span>
            <span className="text-gray-700 font-medium">{vehicle.max_luggage} {t('luggage')}</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {t('capacityInfo')}
          </div>
        </div>
      </div>
      
      {vehicle.features && vehicle.features.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">امکانات:</div>
          <div className="flex flex-wrap gap-1">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {feature}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="text-xs text-gray-500">+{vehicle.features.length - 3} بیشتر</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CustomTransferBooking() {
  const t = useTranslations('transfers');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState<Location[]>([]);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [bookingData, setBookingData] = useState<BookingData>({
    origin: '',
    destination: '',
    vehicle_type: '',
    vehicle_name: '',
    base_price: 0,
    max_passengers: 0,
    max_luggage: 0,
    trip_type: 'one_way',
    outbound_date: '',
    outbound_time: '',
    return_date: '',
    return_time: '',
    passenger_count: 1,
    luggage_count: 0,
    selected_options: [],
    pickup_address: '',
    dropoff_address: '',
    contact_name: '',
    contact_phone: '',
    special_requirements: ''
  });

  // State for backend-calculated pricing
  const [backendPricing, setBackendPricing] = useState<{
    basePrice: number;
    outboundSurcharge: number;
    returnSurcharge: number;
    roundTripDiscount: number;
    optionsTotal: number;
    finalPrice: number;
  } | null>(null);

  // 1. State for available vehicles and options
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableOptions, setAvailableOptions] = useState<TransferOption[]>([]);

  // Fetch available vehicles when route changes
  const fetchAvailableVehicles = useCallback(async (origin: string, destination: string) => {
    if (!origin || !destination) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/transfers/routes/available_vehicles/?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
      
      if (response.ok) {
        const data: RouteData = await response.json();
        setRouteData(data);
        
        if (!data.route_found || data.vehicles.length === 0) {
          setError(t('noVehiclesAvailable'));
        }
      } else {
        setError(t('errorFetchingVehicles'));
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError(t('errorFetchingVehicles'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // دریافت خودروها بعد از انتخاب مبدا و مقصد
  useEffect(() => {
    if (bookingData.origin && bookingData.destination) {
      setLoading(true);
      setError('');
      fetch(`/api/v1/transfers/routes/available_vehicles/?origin=${encodeURIComponent(bookingData.origin)}&destination=${encodeURIComponent(bookingData.destination)}`)
        .then(res => res.json())
        .then(data => {
          setAvailableVehicles(data.vehicles || []);
          if (!data.route_found || (data.vehicles || []).length === 0) {
            setError('خودرویی برای این مسیر موجود نیست.');
          }
        })
        .catch(() => setError('خطا در دریافت خودروها'))
        .finally(() => setLoading(false));
    } else {
      setAvailableVehicles([]);
    }
  }, [bookingData.origin, bookingData.destination]);

  // 3. Fetch available options after selecting vehicle
  useEffect(() => {
    if (routeData?.route_id && bookingData.vehicle_type) {
      fetch(`http://localhost:8000/api/v1/transfers/routes/${routeData.route_id}/available_options/?vehicle_type=${bookingData.vehicle_type}`)
        .then(res => res.json())
        .then(data => setAvailableOptions(data));
    }
  }, [routeData?.route_id, bookingData.vehicle_type]);

  // Load available routes on mount and handle URL parameters
  useEffect(() => {
    const fetchAvailableRoutes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/transfers/routes/available_routes/');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.origins.map((origin: string) => ({
            id: origin,
            name: origin,
            city: origin.split(' ')[0],
            country: 'Iran'
          })));
        }
      } catch (error) {
        console.error('Error fetching available routes:', error);
      }
    };
    
    fetchAvailableRoutes();
    
    // Handle URL parameters for origin and destination
    const originFromParams = searchParams.get('origin');
    const destinationFromParams = searchParams.get('destination');
    
    if (originFromParams || destinationFromParams) {
      setBookingData(prev => ({
        ...prev,
        origin: originFromParams || prev.origin,
        destination: destinationFromParams || prev.destination
      }));
      
      // If both origin and destination are provided, fetch available vehicles
      if (originFromParams && destinationFromParams) {
        fetchAvailableVehicles(originFromParams, destinationFromParams);
      }
    }
  }, [searchParams, fetchAvailableVehicles]);

  // Fetch backend pricing when booking data changes
  useEffect(() => {
    if (bookingData.origin && bookingData.destination && bookingData.vehicle_type) {
      fetchBackendPricing();
    }
  }, [bookingData.origin, bookingData.destination, bookingData.vehicle_type, 
      bookingData.trip_type, bookingData.outbound_time, bookingData.return_time, 
      bookingData.selected_options]);

  // Handle route selection
  const handleRouteChange = useCallback((field: 'origin' | 'destination', value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'origin' && bookingData.destination) {
      fetchAvailableVehicles(value, bookingData.destination);
    } else if (field === 'destination' && bookingData.origin) {
      fetchAvailableVehicles(bookingData.origin, value);
    }
  }, [bookingData.origin, bookingData.destination, fetchAvailableVehicles]);

  // انتخاب خودرو
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setBookingData(prev => ({
      ...prev,
      vehicle_type: vehicle.vehicle_type,
      vehicle_name: vehicle.vehicle_name,
      base_price: vehicle.base_price,
      max_passengers: vehicle.max_passengers,
      max_luggage: vehicle.max_luggage
    }));
  };

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(bookingData.origin && bookingData.destination && bookingData.vehicle_type);
      case 2:
        return !!(bookingData.outbound_date && bookingData.outbound_time);
      case 3:
        return bookingData.passenger_count > 0 && 
               bookingData.passenger_count <= bookingData.max_passengers &&
               bookingData.luggage_count <= bookingData.max_luggage;
      case 4:
        return true; // Options are optional
      case 5:
        return !!(bookingData.pickup_address && bookingData.dropoff_address);
      case 6:
        return !!(bookingData.contact_name && bookingData.contact_phone);
      default:
        return false;
    }
  };

  // Navigation handlers
  const nextStep = async () => {
    if (isStepValid(currentStep)) {
      if (currentStep === 6) {
        // Final step - add to cart
        await handleAddToCart();
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 6));
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      // Don't calculate price here - let backend calculate it
      // Prepare cart data
      const cartData = {
        product_type: 'transfer',
        product_id: routeData?.route_id || '', // This is the TransferRoute ID
        quantity: 1,
        booking_date: bookingData.outbound_date,
        booking_time: bookingData.outbound_time,
        currency: 'USD',
        // Don't send unit_price or total_price - let backend calculate
        selected_options: bookingData.selected_options.map(option => ({
          option_id: option,
          option_name: option,
          quantity: 1,
          price: getOptionPrice(option)
        })),
        booking_data: {
          origin: bookingData.origin,
          destination: bookingData.destination,
          vehicle_type: bookingData.vehicle_type,
          trip_type: bookingData.trip_type,
          outbound_date: bookingData.outbound_date,
          outbound_time: bookingData.outbound_time,
          return_date: bookingData.return_date,
          return_time: bookingData.return_time,
          passenger_count: bookingData.passenger_count,
          luggage_count: bookingData.luggage_count,
          pickup_address: bookingData.pickup_address,
          dropoff_address: bookingData.dropoff_address,
          contact_name: bookingData.contact_name,
          contact_phone: bookingData.contact_phone,
          special_requirements: bookingData.special_requirements,
          route_id: routeData?.route_id
        }
      };

      // Add to backend cart
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/cart/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cartData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'خطا در افزودن به سبد خرید');
        return;
      }

      const result = await response.json();
      
      // Add to local cart using backend price
      const cartItem: TransferCartItem = {
        id: result.cart_item.id,
        type: 'transfer',
        title: `${bookingData.origin} → ${bookingData.destination}`,
        price: result.cart_item.total_price || result.cart_item.unit_price || 0,
        quantity: 1,
        currency: 'USD',
        slug: routeData?.route_id || '',
        route_id: routeData?.route_id || '',
        route_data: routeData ? {
          id: routeData.route_id || '',
          name: routeData.route_name || '',
          name_display: routeData.route_name || '',
          origin: routeData.origin || '',
          destination: routeData.destination || '',
          distance_km: routeData.distance_km || 0,
          estimated_duration_minutes: routeData.estimated_duration_minutes || 0
        } : {
          id: '',
          name: '',
          name_display: '',
          origin: '',
          destination: '',
          distance_km: 0,
          estimated_duration_minutes: 0
        },
        vehicle_type: bookingData.vehicle_type,
        trip_type: bookingData.trip_type,
        outbound_datetime: bookingData.outbound_time,
        return_datetime: bookingData.return_time,
        passenger_count: bookingData.passenger_count,
        luggage_count: bookingData.luggage_count,
        pickup_address: bookingData.pickup_address,
        dropoff_address: bookingData.dropoff_address,
        contact_name: bookingData.contact_name,
        contact_phone: bookingData.contact_phone,
        selected_options: bookingData.selected_options.map(option => ({ option_id: option, quantity: 1 })),
        special_requirements: bookingData.special_requirements,
        pricing_breakdown: result.cart_item.pricing_breakdown || null,
        image: '/images/transfer-default.jpg',
        duration: `${routeData?.estimated_duration_minutes || 0} minutes`,
        location: `${bookingData.origin} - ${bookingData.destination}`
      };

      // Add to cart context
      addItem(cartItem);

      alert('ترانسفر با موفقیت به سبد خرید اضافه شد!');
      
      // Redirect to cart page
      setTimeout(() => {
        router.push('/cart');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('خطا در افزودن به سبد خرید');
    }
  };

  // 4. Remove getOptionPrice logic and use price from availableOptions
  const getOptionPrice = (option: string): number => {
    const optionData = availableOptions.find(opt => opt.id === option);
    if (optionData) {
      return optionData.price;
    }
    return 0;
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Fetch pricing from backend
  const fetchBackendPricing = async () => {
    if (!bookingData.origin || !bookingData.destination || !bookingData.vehicle_type) {
      return;
    }

    try {
      console.log('Fetching backend pricing with data:', {
        origin: bookingData.origin,
        destination: bookingData.destination,
        vehicle_type: bookingData.vehicle_type,
        trip_type: bookingData.trip_type,
        outbound_time: bookingData.outbound_time,
        return_time: bookingData.return_time,
        selected_options: bookingData.selected_options
      });

      const response = await fetch('http://localhost:8000/api/v1/transfers/routes/calculate_price_public/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: bookingData.origin,
          destination: bookingData.destination,
          vehicle_type: bookingData.vehicle_type,
          trip_type: bookingData.trip_type,
          outbound_time: bookingData.outbound_time,
          return_time: bookingData.return_time,
          selected_options: bookingData.selected_options
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backend pricing response:', data);
        
        setBackendPricing({
          basePrice: data.base_price || 0,
          outboundSurcharge: data.outbound_surcharge || 0,
          returnSurcharge: data.return_surcharge || 0,
          roundTripDiscount: data.round_trip_discount || 0,
          optionsTotal: data.options_total || 0,
          finalPrice: data.final_price || 0
        });
      } else {
        console.error('Backend pricing error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching backend pricing:', error);
    }
  };

  // Calculate pricing (use backend pricing if available, otherwise fallback)
  const calculatePrice = () => {
    // Use backend pricing if available
    if (backendPricing) {
      return backendPricing;
    }

    // Fallback to frontend calculation
    const basePrice = bookingData.base_price;
    const outboundHour = bookingData.outbound_time ? parseInt(bookingData.outbound_time.split(':')[0]) : null;
    const returnHour = bookingData.return_time ? parseInt(bookingData.return_time.split(':')[0]) : null;

    // سورچارج زمان (مطابق بک‌اند)
    function getSurcharge(hour: number | null) {
      if (hour === null) return 0;
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) return basePrice * 0.10;
      if ((hour >= 22 && hour <= 23) || (hour >= 0 && hour <= 6)) return basePrice * 0.05;
      return 0;
    }
    const outboundSurcharge = getSurcharge(outboundHour);
    const returnSurcharge = getSurcharge(returnHour);

    // قیمت پایه و سورچارج
    let total = basePrice + outboundSurcharge;
    let roundTripDiscount = 0;
    
    if (bookingData.trip_type === 'round_trip') {
      total += basePrice + returnSurcharge;
      roundTripDiscount = total * 0.10;
      total -= roundTripDiscount;
    }

    // جمع آپشن‌ها (مطابق بک‌اند)
    let optionsTotal = 0;
    bookingData.selected_options.forEach(option => {
      const optionData = availableOptions.find(opt => opt.id === option);
      if (optionData) {
        if (optionData.price_type === 'fixed') {
          optionsTotal += optionData.price;
        } else if (optionData.price_type === 'percentage') {
          optionsTotal += basePrice * (optionData.price_percentage / 100);
        }
      }
    });

    return {
      basePrice,
      outboundSurcharge,
      returnSurcharge,
      roundTripDiscount,
      optionsTotal,
      finalPrice: total + optionsTotal
    };
  };

  // Steps configuration
  const steps = [
    { number: 1, title: t('routeAndVehicle'), icon: Car },
    { number: 2, title: t('dateAndTime'), icon: CalendarDays },
    { number: 3, title: t('passengers'), icon: Users },
    { number: 4, title: t('additionalOptions'), icon: Package },
    { number: 5, title: t('addresses'), icon: MapPin },
    { number: 6, title: t('confirmation'), icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('customTransferBooking')}
          </h1>
          <p className="text-gray-600">
            {t('bookYourTransferInSteps')}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              const isValid = isStepValid(step.number);
              
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-500 text-white' : 
                      isActive ? 'bg-blue-500 text-white' : 
                      'bg-gray-200 text-gray-500'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`
                      hidden md:block absolute h-0.5 w-24 mt-6 ml-24
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Step 1: Route & Vehicle Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('selectRouteAndVehicle')}
                  </h2>
                  
                  {/* Route Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('origin')}
                      </label>
                      <select
                        value={bookingData.origin}
                        onChange={(e) => handleRouteChange('origin', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t('selectOrigin')}</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.name}>
                            {location.name} - {location.city}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('destination')}
                      </label>
                      <select
                        value={bookingData.destination}
                        onChange={(e) => handleRouteChange('destination', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t('selectDestination')}</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.name}>
                            {location.name} - {location.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">{t('loadingVehicles')}</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Vehicle Selection */}
                  {routeData && routeData.vehicles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {t('availableVehicles')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableVehicles.map(vehicle => (
                          <VehiclePriceCard
                            key={vehicle.vehicle_type}
                            vehicle={vehicle}
                            origin={bookingData.origin}
                            destination={bookingData.destination}
                            isSelected={bookingData.vehicle_type === vehicle.vehicle_type}
                            onSelect={handleVehicleSelect}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Date & Time */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('selectDateAndTime')}
                  </h2>
                  
                  {/* Trip Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tripType')}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="trip_type"
                          value="one_way"
                          checked={bookingData.trip_type === 'one_way'}
                          onChange={(e) => setBookingData(prev => ({ ...prev, trip_type: e.target.value as 'one_way' }))}
                          className="mr-2"
                        />
                        {t('oneWay')}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="trip_type"
                          value="round_trip"
                          checked={bookingData.trip_type === 'round_trip'}
                          onChange={(e) => setBookingData(prev => ({ ...prev, trip_type: e.target.value as 'round_trip' }))}
                          className="mr-2"
                        />
                        {t('roundTrip')}
                      </label>
                    </div>
                  </div>

                  {/* Outbound Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('outbound_date')}
                      </label>
                      <input
                        type="date"
                        value={bookingData.outbound_date}
                        onChange={(e) => setBookingData(prev => ({ ...prev, outbound_date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('outboundTime')}
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={bookingData.outbound_time}
                          onChange={(e) => setBookingData(prev => ({ ...prev, outbound_time: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {bookingData.outbound_time && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {(() => {
                              const hour = parseInt(bookingData.outbound_time.split(':')[0]);
                              if (hour >= 7 && hour <= 9) {
                                return (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    +20%
                                  </span>
                                );
                              } else if (hour >= 17 && hour <= 19) {
                                return (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    +20%
                                  </span>
                                );
                              } else if (hour >= 22 || hour <= 6) {
                                return (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                    +30%
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        )}
                      </div>
                      {/* Peak Hour Warning */}
                      {bookingData.outbound_time && (
                        <div className="mt-2">
                          {(() => {
                            const hour = parseInt(bookingData.outbound_time.split(':')[0]);
                            if (hour >= 7 && hour <= 9) {
                              return (
                                <div className="flex items-center text-orange-600 text-sm">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {t('peakHourSurcharge')} (+20%)
                                </div>
                              );
                            } else if (hour >= 17 && hour <= 19) {
                              return (
                                <div className="flex items-center text-orange-600 text-sm">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {t('peakHourSurcharge')} (+20%)
                                </div>
                              );
                            } else if (hour >= 22 || hour <= 6) {
                              return (
                                <div className="flex items-center text-red-600 text-sm">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {t('midnightSurcharge')} (+30%)
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Date & Time (if round trip) */}
                  {bookingData.trip_type === 'round_trip' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('returnDate')}
                        </label>
                        <input
                          type="date"
                          value={bookingData.return_date}
                          onChange={(e) => setBookingData(prev => ({ ...prev, return_date: e.target.value }))}
                          min={bookingData.outbound_date || new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('returnTime')}
                        </label>
                        <input
                          type="time"
                          value={bookingData.return_time}
                          onChange={(e) => setBookingData(prev => ({ ...prev, return_time: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Passengers */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('selectPassengers')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('passengers')}
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({ 
                            ...prev, 
                            passenger_count: Math.max(1, prev.passenger_count - 1) 
                          }))}
                          disabled={bookingData.passenger_count <= 1}
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">
                          {bookingData.passenger_count}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({ 
                            ...prev, 
                            passenger_count: Math.min(prev.max_passengers, prev.passenger_count + 1) 
                          }))}
                          disabled={bookingData.passenger_count >= bookingData.max_passengers}
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('maxPassengers')}: {bookingData.max_passengers}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('luggage')}
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({ 
                            ...prev, 
                            luggage_count: Math.max(0, prev.luggage_count - 1) 
                          }))}
                          disabled={bookingData.luggage_count <= 0}
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">
                          {bookingData.luggage_count}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingData(prev => ({ 
                            ...prev, 
                            luggage_count: Math.min(prev.max_luggage, prev.luggage_count + 1) 
                          }))}
                          disabled={bookingData.luggage_count >= bookingData.max_luggage}
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('maxLuggage')}: {bookingData.max_luggage}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Additional Options */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('additionalOptions')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableOptions.map(option => (
                      <div key={option.id} className="option-item">
                        <label>
                          <input
                            type="checkbox"
                            value={option.id}
                            checked={bookingData.selected_options.includes(option.id)}
                            onChange={e => {
                              const checked = e.target.checked;
                              setBookingData(prev => ({
                                ...prev,
                                selected_options: checked
                                  ? [...prev.selected_options, option.id]
                                  : prev.selected_options.filter(id => id !== option.id)
                              }));
                            }}
                            disabled={!option.is_available}
                          />
                          {option.name} ({option.price_type === 'fixed' ? `$${option.price}` : `${option.price_percentage}%`})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Addresses */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('pickupAndDropoff')}
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('pickupAddress')}
                      </label>
                      <textarea
                        value={bookingData.pickup_address}
                        onChange={(e) => setBookingData(prev => ({ ...prev, pickup_address: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('enterPickupAddress')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('dropoffAddress')}
                      </label>
                      <textarea
                        value={bookingData.dropoff_address}
                        onChange={(e) => setBookingData(prev => ({ ...prev, dropoff_address: e.target.value }))}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('enterDropoffAddress')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Confirmation */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('contactInformation')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contactName')}
                      </label>
                      <input
                        type="text"
                        value={bookingData.contact_name}
                        onChange={(e) => setBookingData(prev => ({ ...prev, contact_name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('enterContactName')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contactPhone')}
                      </label>
                      <input
                        type="tel"
                        value={bookingData.contact_phone}
                        onChange={(e) => setBookingData(prev => ({ ...prev, contact_phone: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('enterContactPhone')}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('specialRequirements')}
                    </label>
                    <textarea
                      value={bookingData.special_requirements}
                      onChange={(e) => setBookingData(prev => ({ ...prev, special_requirements: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('enterSpecialRequirements')}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('previous')}
                </button>
                
                <button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {currentStep === 6 ? 'افزودن به سبد خرید' : t('next')}
                  {currentStep < 6 && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Show steps info if no route/vehicle selected */}
              {!(bookingData.origin && bookingData.destination && bookingData.vehicle_type) ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('howToBookTitle')}
                  </h3>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1 text-sm">
                    <li>{t('howToBookStep1')}</li>
                    <li>{t('howToBookStep2')}</li>
                    <li>{t('howToBookStep3')}</li>
                    <li>{t('howToBookStep4')}</li>
                    <li>{t('howToBookStep5')}</li>
                    <li>{t('howToBookStep6')}</li>
                  </ol>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('bookingSummary')}
                  </h3>
                  <div className="space-y-4">
                    {/* Trip Type */}
                    {bookingData.trip_type && (
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>{t('tripType')}</span>
                        </div>
                        <div className="font-medium">
                          {bookingData.trip_type === 'one_way' ? t('oneWay') : t('roundTrip')}
                        </div>
                      </div>
                    )}
                    {/* Selected Options */}
                    {bookingData.selected_options.length > 0 && (
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Package className="w-4 h-4" />
                          <span>{t('additionalOptions')}</span>
                        </div>
                        <div className="space-y-1">
                          {bookingData.selected_options.map(optionId => {
                            const option = availableOptions.find(opt => opt.id === optionId);
                            if (option) {
                              return (
                                <div key={option.id} className="text-sm">
                                  • {option.name} ({option.price_type === 'fixed' ? `$${option.price}` : `${option.price_percentage}%`})
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )}
                    {/* Pricing Breakdown */}
                    {bookingData.base_price > 0 && (
                      <div className="pt-4">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>{t('basePrice')}</span>
                            <span>${calculatePrice().basePrice.toFixed(2)}</span>
                          </div>
                          {calculatePrice().outboundSurcharge > 0 && (
                            <div className="flex justify-between text-sm text-orange-600">
                              <span>{t('timeSurcharge')}</span>
                              <span>+${calculatePrice().outboundSurcharge.toFixed(2)}</span>
                            </div>
                          )}
                          {bookingData.trip_type === 'round_trip' && (
                            <>
                              {calculatePrice().returnSurcharge > 0 && (
                                <div className="flex justify-between text-sm text-orange-600">
                                  <span>{t('timeSurcharge')}</span>
                                  <span>+${calculatePrice().returnSurcharge.toFixed(2)}</span>
                                </div>
                              )}
                              {calculatePrice().roundTripDiscount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>{t('roundTripDiscount')}</span>
                                  <span>-${calculatePrice().roundTripDiscount.toFixed(2)}</span>
                                </div>
                              )}
                            </>
                          )}
                          {calculatePrice().optionsTotal > 0 && (
                            <div className="flex justify-between text-sm text-blue-600">
                              <span>{t('additionalOptions')}</span>
                              <span>+${calculatePrice().optionsTotal.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">
                              {t('totalPrice')}
                            </span>
                            <span className="text-2xl font-bold text-blue-600">
                              ${calculatePrice().finalPrice.toFixed(2)}
                            </span>
                          </div>
                          {backendPricing && (
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              ✅ قیمت محاسبه شده توسط سرور
                            </div>
                          )}
                          {!backendPricing && (
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              ⏳ در حال محاسبه قیمت...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 