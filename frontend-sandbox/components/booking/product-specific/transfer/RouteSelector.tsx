'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, ArrowRight, Car, Clock, DollarSign } from 'lucide-react';

interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  base_price: number;
}

interface RouteSelectorProps {
  routes: Route[];
  selectedRoute?: Route;
  onRouteSelect: (route: Route) => void;
}

export default function RouteSelector({
  routes,
  selectedRoute,
  onRouteSelect
}: RouteSelectorProps) {
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');

  const origins = Array.from(new Set(routes.map(route => route.origin)));
  const destinations = Array.from(new Set(routes.map(route => route.destination)));

  const filteredRoutes = routes.filter(route => {
    if (selectedOrigin && route.origin !== selectedOrigin) return false;
    if (selectedDestination && route.destination !== selectedDestination) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            مبدا
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">همه مبداها</option>
            {origins.map(origin => (
              <option key={origin} value={origin}>{origin}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            مقصد
          </label>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">همه مقصدها</option>
            {destinations.map(destination => (
              <option key={destination} value={destination}>{destination}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Routes */}
      <div className="space-y-4">
        {filteredRoutes.map((route) => (
          <Card
            key={route.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedRoute?.id === route.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:border-gray-300'
            }`}
            onClick={() => onRouteSelect(route)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {route.origin}
                  </span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400" />
                
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {route.destination}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Car className="w-4 h-4" />
                  <span>{route.distance} کیلومتر</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{route.duration}</span>
                </div>
                
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(route.base_price)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            مسیری با فیلترهای انتخاب شده یافت نشد
          </p>
        </div>
      )}
    </div>
  );
} 