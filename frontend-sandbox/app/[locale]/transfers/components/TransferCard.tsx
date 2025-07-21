'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Clock, Car, ArrowRight } from 'lucide-react';

interface TransferRoute {
  id: string;
  name: string;
  description?: string;
  origin: string;
  destination: string;
  is_active: boolean;
  is_popular: boolean;
  is_admin_selected: boolean;
  slug: string;
  pricing?: Array<{
    id: string;
    vehicle_type: string;
    vehicle_type_display: string;
    base_price: number;
    max_passengers: number;
    max_luggage: number;
  }>;
}

interface TransferCardProps {
  route: TransferRoute;
  onBook: () => void;
}

export default function TransferCard({ route, onBook }: TransferCardProps) {
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
      {/* Route Header */}
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
            <Car className="w-4 h-4" />
            <span>{route.pricing?.length || 0} {t('availableVehicles')}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-xl font-bold text-blue-600">
            ${route.pricing?.[0]?.base_price || 0}
          </div>
          <div className="text-sm text-gray-500">
            {t('startingFrom')}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-4">
          {route.is_popular && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
              {t('popular')}
            </span>
          )}
          {route.is_admin_selected && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
              {t('recommended')}
            </span>
          )}
          {!route.is_active && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
              {t('notAvailable')}
            </span>
          )}
        </div>

        {/* Book Button */}
        <button
          onClick={onBook}
          disabled={!route.is_active}
          className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            route.is_active
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {route.is_active ? t('bookNow') : t('notAvailable')}
          {route.is_active && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
} 