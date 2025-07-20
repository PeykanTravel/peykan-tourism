'use client';

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Car, Users, Package, ArrowRight, ArrowLeft, CheckCircle, Star, Award, Wifi, Snowflake, Shield, Zap, Heart, Clock, MapPin } from 'lucide-react';
import { useTransferBookingStore } from '@/lib/stores/transferBookingStore';

interface VehicleSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export default function VehicleSelection({ onNext, onBack }: VehicleSelectionProps) {
  const t = useTranslations('transfers');
  
  // Get booking state from store
  const {
    route_data,
    vehicle_type,
    setVehicleType,
    isStepValid,
  } = useTransferBookingStore();

  // Get available vehicles from route data
  const availableVehicles = route_data?.pricing ? 
    route_data.pricing.map((pricing) => ({
      id: pricing.id,
      name: pricing.vehicle_name || pricing.vehicle_type_display || pricing.vehicle_type,
      type: pricing.vehicle_type,
      capacity: pricing.max_passengers,
      max_passengers: pricing.max_passengers,
      max_luggage: pricing.max_luggage,
      base_price: pricing.base_price,
      description: pricing.vehicle_description || `${pricing.max_passengers} passengers, ${pricing.max_luggage} luggage`,
      features: pricing.features || [],
      amenities: pricing.amenities || [],
      currency: 'USD', // Default currency
    })) : [];

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleType: string) => {
    setVehicleType(vehicleType);
  };

  // Handle next step
  const handleNext = () => {
    if (isStepValid('vehicle')) {
      onNext();
    }
  };

  // Check if form is valid
  const isValid = isStepValid('vehicle');

  // Helper function to render features and amenities
  const renderFeatures = (features: string[]) => {
    if (!features || features.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">{t('features')}:</h5>
        <div className="flex flex-wrap gap-1">
          {features.map((feature, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {feature}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render amenities
  const renderAmenities = (amenities: string[]) => {
    if (!amenities || amenities.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">{t('amenities')}:</h5>
        <div className="flex flex-wrap gap-1">
          {amenities.map((amenity, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {amenity}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to get vehicle icon based on type
  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'sedan':
        return <Car className="w-5 h-5" />;
      case 'suv':
        return <Car className="w-5 h-5" />;
      case 'van':
        return <Car className="w-5 h-5" />;
      case 'sprinter':
        return <Car className="w-5 h-5" />;
      case 'bus':
        return <Car className="w-5 h-5" />;
      case 'limousine':
        return <Car className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  if (!route_data) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('selectVehicle')}
          </h2>
          <p className="text-gray-600">
            {t('step2')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noRouteSelected')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('pleaseSelectRouteFirst')}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('backToRouteSelection')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (availableVehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('selectVehicle')}
          </h2>
          <p className="text-gray-600">
            {t('step2')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noVehiclesAvailable')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('errorFetchingVehicles')}
            </p>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('previous')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('selectVehicle')}
        </h2>
        <p className="text-gray-600">
          {t('step2')}
        </p>
        
        {/* Route Info */}
        {route_data && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="font-medium">{route_data.origin}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">{route_data.destination}</span>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {route_data.pricing.length} {t('vehicleTypes')} {t('available')}
            </div>
            
            {/* Route Features Summary */}
            {(route_data.round_trip_discount_enabled || parseFloat(route_data.peak_hour_surcharge) > 0 || parseFloat(route_data.midnight_surcharge) > 0) && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="flex flex-wrap gap-2 text-xs">
                  {route_data.round_trip_discount_enabled && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                      <span>{t('discountPercentage', { percentage: route_data.round_trip_discount_percentage })}</span>
                    </span>
                  )}
                  {parseFloat(route_data.peak_hour_surcharge) > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                      <span>{t('surchargePercentage', { percentage: route_data.peak_hour_surcharge })}</span>
                    </span>
                  )}
                  {parseFloat(route_data.midnight_surcharge) > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                      <span>{t('surchargePercentage', { percentage: route_data.midnight_surcharge })}</span>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicles List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('availableVehicles')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => handleVehicleSelect(vehicle.type)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                ${vehicle_type === vehicle.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getVehicleIcon(vehicle.type)}
                  <h4 className="font-medium text-gray-900">{vehicle.name}</h4>
                </div>
                {vehicle_type === vehicle.type && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Vehicle Description */}
              {vehicle.description && (
                <p className="text-sm text-gray-600 mb-3">{vehicle.description}</p>
              )}

              {/* Vehicle Details */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{vehicle.max_passengers} {t('passengers')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{vehicle.max_luggage} {t('luggage')}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              {renderFeatures(vehicle.features)}

              {/* Amenities */}
              {renderAmenities(vehicle.amenities)}

              {/* Price */}
              <div className="text-right mt-3 pt-3 border-t border-gray-200">
                <div className="text-lg font-bold text-blue-600">
                  {vehicle.currency} {vehicle.base_price}
                </div>
                <div className="text-xs text-gray-500">{t('basePrice')}</div>
              </div>

              {/* Selection Indicator */}
              {vehicle_type === vehicle.type && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Award className="w-4 h-4" />
                    {t('selected')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
            onClick={handleNext}
            disabled={!isValid}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t('next')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 