/**
 * Vehicle Selector Component
 * 
 * Component for selecting transfer vehicles
 */

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Car, Users, Star, Check } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TransferVehicle {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price_multiplier: number;
  features: string[];
}

interface VehicleSelectorProps {
  vehicles: TransferVehicle[];
  selectedVehicleId: string | null;
  onVehicleSelect: (vehicleId: string) => void;
  basePrice: number;
}

export default function VehicleSelector({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
  basePrice,
}: VehicleSelectorProps) {
  const t = useTranslations('vehicleSelector');

  const calculatePrice = (vehicle: TransferVehicle) => {
    return Math.round(basePrice * vehicle.price_multiplier);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.map((vehicle) => {
            const isSelected = selectedVehicleId === vehicle.id;
            const price = calculatePrice(vehicle);

            return (
              <div
                key={vehicle.id}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => onVehicleSelect(vehicle.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-neutral-900">{vehicle.name}</h4>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{vehicle.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-neutral-500" />
                        <span className="text-sm text-neutral-600">
                          {t('capacity')}: {vehicle.capacity} {t('passengers')}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {vehicle.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="ml-6 text-right">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      ${price}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {t('totalPrice')}
                    </div>
                    {vehicle.price_multiplier > 1 && (
                      <div className="text-xs text-neutral-400 mt-1">
                        {t('multiplier')}: {vehicle.price_multiplier}x
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
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

        {selectedVehicleId && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-700">
                  {t('selectedVehicle')}
                </h4>
                <p className="text-sm text-primary-600">
                  {vehicles.find(v => v.id === selectedVehicleId)?.name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary-600">
                  ${calculatePrice(vehicles.find(v => v.id === selectedVehicleId)!)}
                </div>
                <div className="text-sm text-primary-500">
                  {t('totalPrice')}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 