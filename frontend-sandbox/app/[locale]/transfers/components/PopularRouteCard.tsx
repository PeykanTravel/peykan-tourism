'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '../../../../components/ui/OptimizedImage';

interface PopularRoute {
  id: string;
  name: string;
  description?: string;
  origin: string;
  destination: string;
  route_image?: string;
  is_popular: boolean;
  is_admin_selected: boolean;
  popularity_score: number;
  pricing?: Array<{
    id: string;
    vehicle_type: string;
    vehicle_type_display: string;
    base_price: number;
    max_passengers: number;
    max_luggage: number;
  }>;
}

interface PopularRouteCardProps {
  route: PopularRoute;
  onQuickBook: (origin: string, destination: string) => void;
}

export default function PopularRouteCard({ route, onQuickBook }: PopularRouteCardProps) {
  const t = useTranslations('transfers');

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Route Image */}
      {route.route_image && (
        <div className="h-48 bg-gray-200 relative">
          <OptimizedImage
            src={route.route_image}
            alt={route.name}
            width={400}
            height={192}
            className="w-full h-full object-cover"
          />
          {route.is_admin_selected && (
            <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {t('recommended')}
            </div>
          )}
          {route.is_popular && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="w-3 h-3" />
              {t('popular')}
            </div>
          )}
        </div>
      )}

      {/* Route Content */}
      <div className="p-6">
        {/* Route Info */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {route.origin} → {route.destination}
          </span>
        </div>

        {/* Route Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {route.name || `${route.origin} → ${route.destination}`}
        </h3>

        {/* Route Description */}
        {route.description && (
          <p className="text-sm text-gray-600 mb-4">
            {route.description}
          </p>
        )}

        {/* Route Details */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>{route.popularity_score} {t('popular')}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-blue-600">
            ${route.pricing?.[0]?.base_price || 0}
          </div>
          <div className="text-sm text-gray-500">
            {t('startingFrom')}
          </div>
        </div>

        {/* Quick Book Button */}
        <button
          onClick={() => onQuickBook(route.origin, route.destination)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {t('quickBook')}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 