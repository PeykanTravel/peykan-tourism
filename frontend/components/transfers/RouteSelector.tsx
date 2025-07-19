/**
 * Route Selector Component
 * 
 * Component for selecting transfer routes
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, ArrowRight, Clock, Car } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TransferRoute {
  id: string;
  transfer_id: string;
  from_location: string;
  to_location: string;
  distance: number;
  duration: string;
  base_price: number;
}

interface RouteSelectorProps {
  routes: TransferRoute[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string) => void;
}

export default function RouteSelector({
  routes,
  selectedRouteId,
  onRouteSelect,
}: RouteSelectorProps) {
  const t = useTranslations('routeSelector');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routes.map((route) => {
            const isSelected = selectedRouteId === route.id;

            return (
              <div
                key={route.id}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => onRouteSelect(route.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      <span className="font-medium text-neutral-900">
                        {route.from_location}
                      </span>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-neutral-500" />
                      <span className="font-medium text-neutral-900">
                        {route.to_location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      ${route.base_price}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{route.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Car className="h-3 w-3" />
                        <span>{route.distance} km</span>
                      </div>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-primary-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-700 font-medium">
                        {t('selected')}
                      </span>
                      <Button size="sm" variant="outline">
                        {t('change')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedRouteId && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-700">
                  {t('selectedRoute')}
                </h4>
                <p className="text-sm text-primary-600">
                  {routes.find(r => r.id === selectedRouteId)?.from_location} → {routes.find(r => r.id === selectedRouteId)?.to_location}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-600">
                  ${routes.find(r => r.id === selectedRouteId)?.base_price}
                </div>
                <div className="text-sm text-primary-500">
                  {t('basePrice')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 