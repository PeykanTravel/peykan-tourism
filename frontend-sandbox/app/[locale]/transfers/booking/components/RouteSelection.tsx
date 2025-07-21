'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Search, ArrowRight, Clock, Car, Star, TrendingUp, Award, Percent, Info } from 'lucide-react';
import { useTransferRoutes } from '@/lib/hooks/useTransfers';
import { useTransferBookingStore } from '@/lib/stores/transferBookingStore';
import * as transfersApi from '@/lib/api/transfers';

interface RouteSelectionProps {
  onNext: () => void;
}

export default function RouteSelection({ onNext }: RouteSelectionProps) {
  const t = useTranslations('transfers');
  
  // Get booking state from store
  const {
    route_data,
    setRoute,
    isStepValid,
  } = useTransferBookingStore();
  
  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);

  // Fetch routes
  const { data: routesResponse, error, isLoading } = useTransferRoutes({
    search: searchTerm || undefined,
    origin: selectedOrigin || undefined,
    destination: selectedDestination || undefined,
  });

  const routes = useMemo(() => routesResponse?.results || [], [routesResponse?.results]);

  // Extract unique origins and destinations when routes change
  useEffect(() => {
    if (routes.length > 0) {
      const origins = Array.from(new Set(routes.map((route: any) => route.origin))).sort() as string[];
      const destinations = Array.from(new Set(routes.map((route: any) => route.destination))).sort() as string[];
      setAvailableOrigins(origins);
      setAvailableDestinations(destinations);
    }
  }, [routes]);

  // Handle route selection
  const handleRouteSelect = (route: any) => {
    setRoute(route);
  };

  // Handle next step
  const handleNext = () => {
    if (isStepValid('route')) {
      onNext();
    }
  };

  // Check if form is valid
  const isValid = isStepValid('route');

  // Helper function to render badges
  const renderBadges = (route: transfersApi.TransferRoute) => {
    const badges = [];
    
    if (route.is_popular) {
      badges.push(
        <span key="popular" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Star className="w-3 h-3 mr-1" />
          {t('popularBadge')}
        </span>
      );
    }
    
    if (route.round_trip_discount_enabled) {
      badges.push(
        <span key="discount" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Percent className="w-3 h-3 mr-1" />
          {t('discountBadge')}
        </span>
      );
    }
    
    if (parseFloat(route.peak_hour_surcharge) > 0 || parseFloat(route.midnight_surcharge) > 0) {
      badges.push(
        <span key="surcharge" className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3 mr-1" />
          {t('surchargeBadge')}
        </span>
      );
    }
    
    return badges;
  };

  // Helper function to render route features
  const renderRouteFeatures = (route: transfersApi.TransferRoute) => {
    const features = [];
    
    if (route.round_trip_discount_enabled) {
      features.push(
        <div key="discount" className="flex items-center gap-2 text-sm text-green-600">
          <Percent className="w-4 h-4" />
          <span>{t('roundTripDiscountPercentage')}: {route.round_trip_discount_percentage}%</span>
        </div>
      );
    }
    
    if (parseFloat(route.peak_hour_surcharge) > 0) {
      features.push(
        <div key="peak" className="flex items-center gap-2 text-sm text-orange-600">
          <Clock className="w-4 h-4" />
          <span>{t('peakHourSurcharge')}: {route.peak_hour_surcharge}%</span>
        </div>
      );
    }
    
    if (parseFloat(route.midnight_surcharge) > 0) {
      features.push(
        <div key="midnight" className="flex items-center gap-2 text-sm text-purple-600">
          <Clock className="w-4 h-4" />
          <span>{t('midnightSurcharge')}: {route.midnight_surcharge}%</span>
        </div>
      );
    }
    
    return features;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('errorLoadingRoutes')}
          </h3>
          <p className="text-gray-600 mb-6">
            {error.message || t('errorLoadingRoutes')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('selectRouteAndVehicle')}
        </h2>
        <p className="text-gray-600">
          {t('step1')}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Origin Filter */}
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('allOrigins')}</option>
            {availableOrigins.map((origin: string) => (
              <option key={origin} value={origin}>{origin}</option>
            ))}
          </select>

          {/* Destination Filter */}
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('allDestinations')}</option>
            {availableDestinations.map((destination: string) => (
              <option key={destination} value={destination}>{destination}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedOrigin('');
            setSelectedDestination('');
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {t('clearFilters')}
        </button>
      </div>

      {/* Routes List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('availableRoutes')} ({routes.length})
        </h3>

        {routes.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('noRoutesFound')}
            </h3>
            <p className="text-gray-600">
              {t('noRoutesFoundDescription')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route: transfersApi.TransferRoute) => (
              <div
                key={route.id}
                onClick={() => handleRouteSelect(route)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${route_data?.id === route.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                {/* Route Info */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {route.name || `${route.origin} → ${route.destination}`}
                    </h4>
                    <div className="flex gap-1">
                      {renderBadges(route)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{route.origin}</span>
                    <ArrowRight className="w-4 h-4" />
                    <span>{route.destination}</span>
                  </div>
                  
                  {route.description && (
                    <p className="text-sm text-gray-500 mb-3">
                      {route.description}
                    </p>
                  )}
                </div>

                {/* Route Features */}
                <div className="space-y-2 mb-3">
                  {renderRouteFeatures(route)}
                </div>

                {/* Vehicle Types Available */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Car className="w-4 h-4" />
                  <span>{route.pricing.length} {t('vehicleTypes')} {t('available')}</span>
                </div>

                {/* Popularity Info */}
                {route.is_popular && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('popularRoute')}</span>
                  </div>
                )}

                {/* Selection Indicator */}
                {route_data?.id === route.id && (
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
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-end">
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