'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../lib/contexts/AuthContext';
import { MapPin, Calendar, Clock, Users, Package, ArrowRight, ArrowLeft, CheckCircle, CreditCard, Star, Percent, Award, Info, Car, Wifi, Shield, Zap } from 'lucide-react';
import { useTransferBookingStore } from '@/lib/stores/transferBookingStore';
import { useCart } from '@/lib/hooks/useCart';
import { useCurrency } from '@/lib/currency-context';

interface BookingSummaryProps {
  onBack: () => void;
  onConfirm?: () => void;
}

export default function BookingSummary({ onBack }: BookingSummaryProps) {
  const t = useTranslations('transfers');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { isAuthenticated } = useAuth();
  const { currency, convertCurrency } = useCurrency();
  
  // Get booking state from store
  const {
    route_data,
    vehicle_type,
    trip_type,
    outbound_date,
    outbound_time,
    return_date,
    return_time,
    passenger_count,
    luggage_count,
    selected_options,
    pickup_address,
    dropoff_address,
    contact_name,
    contact_phone,
    special_requirements,
    pricing_breakdown,
    final_price,
    calculatePrice,
    addToCart,
    is_calculating_price,
    price_calculation_error,
  } = useTransferBookingStore();

  // Helper function to format price with currency
  const formatPrice = (amount: number, fromCurrency: string = 'USD') => {
    const convertedAmount = convertCurrency(amount, fromCurrency, currency);
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'TRY': '₺',
      'IRR': 'ریال',
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${convertedAmount.toFixed(2)}`;
  };

  // Debug logging
  console.log('BookingSummary - pricing_breakdown:', pricing_breakdown);
  console.log('BookingSummary - selected_options:', selected_options);
  console.log('BookingSummary - current currency:', currency);

  // Get option details from store or pricing breakdown
  const getOptionDetails = (optionId: string) => {
    // First try to get from store (selected_options with details)
    const storedOption = selected_options.find(opt => opt.option_id === optionId);
    
    if (storedOption?.name) {
      console.log(`Found option details in store for ${optionId}:`, storedOption);
      return {
        option_id: optionId,
        name: storedOption.name,
        price: storedOption.price || 0,
        quantity: storedOption.quantity,
        total: (storedOption.price || 0) * storedOption.quantity
      };
    }
    
    // Fallback: if options_total > 0, we can estimate the price per option
    if (pricing_breakdown?.price_breakdown?.options_total && selected_options.length > 0) {
      const estimatedPricePerOption = pricing_breakdown.price_breakdown.options_total / selected_options.length;
      console.log(`Using estimated price for ${optionId}: ${estimatedPricePerOption}`);
      return {
        option_id: optionId,
        name: storedOption?.name || `Option ${optionId.slice(0, 8)}...`,
        price: estimatedPricePerOption,
        quantity: storedOption?.quantity || 1,
        total: estimatedPricePerOption * (storedOption?.quantity || 1)
      };
    }
    
    console.log(`No option details found for ${optionId}`);
    return null;
  };

  // Cart integration
  const { addItem, refreshCart } = useCart();

  // Calculate price when component mounts
  useEffect(() => {
    if (route_data && vehicle_type && outbound_date && outbound_time) {
      calculatePrice();
    }
  }, [route_data, vehicle_type, outbound_date, outbound_time, return_date, return_time, passenger_count, luggage_count, selected_options, calculatePrice]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!route_data || !vehicle_type) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save current booking data to localStorage for post-login completion
      const bookingData = {
        route_data,
        vehicle_type,
        trip_type,
        outbound_date,
        outbound_time,
        return_date,
        return_time,
        passenger_count,
        luggage_count,
        selected_options,
        pickup_address,
        dropoff_address,
        contact_name,
        contact_phone,
        special_requirements,
        pricing_breakdown,
        final_price,
        timestamp: Date.now(),
        returnUrl: window.location.pathname
      };
      
      localStorage.setItem('pendingTransferBooking', JSON.stringify(bookingData));
      
      // Redirect to login with locale
      router.push(`/${locale}/login`);
      return;
    }

    try {
      const result = await addToCart();
      if (result.success) {
        // Refresh cart to update navbar count
        await refreshCart();
        // Navigate to cart with locale
        router.push(`/${locale}/cart`);
      } else {
        console.error('Failed to add to cart:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Helper function to get time category and surcharge info
  const getTimeInfo = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (7 <= hour && hour <= 9 || 17 <= hour && hour <= 19) {
      return { category: t('peakHours'), surcharge: route_data?.peak_hour_surcharge || '0' };
    } else if (22 <= hour && hour <= 23 || 0 <= hour && hour <= 6) {
      return { category: t('midnightHours'), surcharge: route_data?.midnight_surcharge || '0' };
    } else {
      return { category: t('normalHours'), surcharge: '0' };
    }
  };

  // Helper function to render route badges
  const renderRouteBadges = () => {
    const badges = [];
    
    if (route_data?.is_popular) {
      badges.push(
        <span key="popular" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Star className="w-3 h-3 mr-1" />
          {t('popularBadge')}
        </span>
      );
    }
    
    if (route_data?.round_trip_discount_enabled) {
      badges.push(
        <span key="discount" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Percent className="w-3 h-3 mr-1" />
          {t('discountBadge')}
        </span>
      );
    }
    
    if (parseFloat(route_data?.peak_hour_surcharge || '0') > 0 || parseFloat(route_data?.midnight_surcharge || '0') > 0) {
      badges.push(
        <span key="surcharge" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3 mr-1" />
          {t('surchargeBadge')}
        </span>
      );
    }
    
    return badges;
  };

  // Helper function to render vehicle features
  const renderVehicleFeatures = () => {
    const vehiclePricing = route_data?.pricing.find(p => p.vehicle_type === vehicle_type);
    if (!vehiclePricing?.features || vehiclePricing.features.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">{t('vehicleFeatures')}:</h5>
        <div className="flex flex-wrap gap-1">
          {vehiclePricing.features.map((feature, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {feature}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render vehicle amenities
  const renderVehicleAmenities = () => {
    const vehiclePricing = route_data?.pricing.find(p => p.vehicle_type === vehicle_type);
    if (!vehiclePricing?.amenities || vehiclePricing.amenities.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">{t('vehicleAmenities')}:</h5>
        <div className="flex flex-wrap gap-1">
          {vehiclePricing.amenities.map((amenity, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (!route_data || !vehicle_type) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('bookingSummary')}
          </h2>
          <p className="text-gray-600">
            {t('step7')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('incompleteBooking')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('pleaseCompletePreviousSteps')}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('backToPreviousStep')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get vehicle pricing info
  const vehiclePricing = route_data.pricing.find(p => p.vehicle_type === vehicle_type);
  const outboundTimeInfo = outbound_time ? getTimeInfo(outbound_time) : { category: '', surcharge: '0' };
  const returnTimeInfo = return_time && return_time !== '' ? getTimeInfo(return_time as string) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('bookingSummary')}
        </h2>
        <p className="text-gray-600">
          {t('step7')}
        </p>
      </div>

      {/* Route Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('routeInformation')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {route_data.origin} → {route_data.destination}
              </div>
              <div className="text-sm text-gray-600">
                {vehiclePricing ? formatPrice(parseFloat(vehiclePricing.base_price)) : t('priceOnRequest')}
              </div>
              {renderRouteBadges().length > 0 && (
                <div className="flex gap-1 mt-2">
                  {renderRouteBadges()}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">
                {t('tripType')}: {trip_type === 'one_way' ? t('oneWay') : t('roundTrip')}
              </div>
              <div className="text-sm text-gray-600">
                {outbound_date} at {outbound_time}
                {trip_type === 'round_trip' && return_date && return_time && (
                  <span> • {t('return')}: {return_date} at {return_time}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">
                {t('passengers')}: {passenger_count} • {t('luggage')}: {luggage_count}
              </div>
              <div className="text-sm text-gray-600">
                {t('vehicle')}: {vehiclePricing?.vehicle_name || vehicle_type}
              </div>
            </div>
          </div>

          {/* Route Features */}
          {(route_data.round_trip_discount_enabled || parseFloat(route_data.peak_hour_surcharge) > 0 || parseFloat(route_data.midnight_surcharge) > 0) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('routeFeatures')}:</h4>
              <div className="space-y-2">
                {route_data.round_trip_discount_enabled && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Percent className="w-4 h-4" />
                    <span>{t('roundTripDiscountPercentage')}: {route_data.round_trip_discount_percentage}%</span>
                  </div>
                )}
                {parseFloat(route_data.peak_hour_surcharge) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="w-4 h-4" />
                    <span>{t('peakHourSurcharge')}: {route_data.peak_hour_surcharge}%</span>
                  </div>
                )}
                {parseFloat(route_data.midnight_surcharge) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Clock className="w-4 h-4" />
                    <span>{t('midnightSurcharge')}: {route_data.midnight_surcharge}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vehicle Details */}
          {vehiclePricing && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{t('vehicleDetails')}:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Car className="w-4 h-4" />
                  <span>{vehiclePricing.vehicle_name || vehicle_type}</span>
                </div>
                {vehiclePricing.vehicle_description && (
                  <div className="text-sm text-gray-600">
                    {vehiclePricing.vehicle_description}
                  </div>
                )}
                {renderVehicleFeatures()}
                {renderVehicleAmenities()}
              </div>
            </div>
          )}

          {/* Time Information */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('timeInfo')}:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">{t('outboundTime')}: {outbound_time} ({outboundTimeInfo.category})</span>
                {parseFloat(outboundTimeInfo.surcharge) > 0 && (
                  <span className="text-orange-600 text-xs">+{outboundTimeInfo.surcharge}%</span>
                )}
              </div>
              {returnTimeInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">{t('returnTime')}: {return_time} ({returnTimeInfo.category})</span>
                  {parseFloat(returnTimeInfo.surcharge) > 0 && (
                    <span className="text-orange-600 text-xs">+{returnTimeInfo.surcharge}%</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('contactInformation')}
        </h3>
        
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-900">{t('pickupAddress')}:</span>
            <div className="text-gray-600">{pickup_address}</div>
          </div>
          <div>
            <span className="font-medium text-gray-900">{t('dropoffAddress')}:</span>
            <div className="text-gray-600">{dropoff_address}</div>
          </div>
          <div>
            <span className="font-medium text-gray-900">{t('contactName')}:</span>
            <div className="text-gray-600">{contact_name}</div>
          </div>
          <div>
            <span className="font-medium text-gray-900">{t('contactPhone')}:</span>
            <div className="text-gray-600">{contact_phone}</div>
          </div>
          {special_requirements && (
            <div>
              <span className="font-medium text-gray-900">{t('specialRequirements')}:</span>
              <div className="text-gray-600">{special_requirements}</div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Options */}
      {selected_options.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('selectedOptions')}
          </h3>
          
          <div className="space-y-2">
            {selected_options.map((option) => {
              const optionDetails = getOptionDetails(option.option_id);
              return (
                <div key={option.option_id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <span className="font-medium">
                      {optionDetails?.name || `Option ${option.option_id.slice(0, 8)}...`}
                    </span>
                    {optionDetails && (
                      <div className="text-xs text-gray-500 mt-1">
                        {t('quantity')}: {optionDetails.quantity} × {formatPrice(optionDetails.price)}
                      </div>
                    )}
                    {!optionDetails && (
                      <div className="text-xs text-gray-500 mt-1">
                        {t('optionDetailsNotAvailable')}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">
                    {optionDetails?.total ? formatPrice(optionDetails.total) : formatPrice(0)}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Show total options price if available */}
          {pricing_breakdown?.price_breakdown?.options_total && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{t('optionsTotal')}:</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(pricing_breakdown.price_breakdown.options_total)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('pricingBreakdown')}
        </h3>
        
        {is_calculating_price ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('calculatingPrice')}</p>
          </div>
        ) : price_calculation_error ? (
          <div className="text-center py-4">
            <p className="text-red-600">{t('priceCalculationError')}</p>
            <button
              onClick={calculatePrice}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('retryCalculation')}
            </button>
          </div>
        ) : pricing_breakdown ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">{t('basePrice')}</span>
              <span className="font-medium">{formatPrice(pricing_breakdown.price_breakdown.base_price)}</span>
            </div>
            {pricing_breakdown.price_breakdown.outbound_surcharge > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('timeSurcharge')}</span>
                <span className="font-medium">{formatPrice(pricing_breakdown.price_breakdown.outbound_surcharge)}</span>
              </div>
            )}
            {pricing_breakdown.price_breakdown.round_trip_discount > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('roundTripDiscount')}</span>
                <span className="font-medium text-green-600">-{formatPrice(pricing_breakdown.price_breakdown.round_trip_discount)}</span>
              </div>
            )}
            {pricing_breakdown.price_breakdown.options_total > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('optionsTotal')}</span>
                <span className="font-medium">{formatPrice(pricing_breakdown.price_breakdown.options_total)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-lg font-medium text-gray-900">{t('subtotal')}</span>
              <span className="text-lg font-medium text-gray-900">{formatPrice(pricing_breakdown.price_breakdown.final_price)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">{t('finalPrice')}</span>
              <span className="text-xl font-bold text-blue-600">{formatPrice(pricing_breakdown.price_breakdown.final_price)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600">{t('priceNotCalculated')}</p>
            <button
              onClick={calculatePrice}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('calculatePrice')}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('previous')}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!pricing_breakdown}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
              ${pricing_breakdown
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <CreditCard className="w-4 h-4" />
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
} 