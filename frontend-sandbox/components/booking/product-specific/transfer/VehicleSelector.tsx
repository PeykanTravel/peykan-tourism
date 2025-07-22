'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Car, Users, Star, Check } from 'lucide-react';

interface VehicleType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price_multiplier: number;
  features: string[];
}

interface VehicleSelectorProps {
  vehicleTypes: VehicleType[];
  selectedVehicle?: VehicleType;
  onVehicleSelect: (vehicle: VehicleType) => void;
  basePrice: number;
}

export default function VehicleSelector({
  vehicleTypes,
  selectedVehicle,
  onVehicleSelect,
  basePrice
}: VehicleSelectorProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicleTypes.map((vehicle) => {
          const finalPrice = basePrice * vehicle.price_multiplier;
          
          return (
            <Card
              key={vehicle.id}
              className={`p-6 cursor-pointer transition-colors ${
                selectedVehicle?.id === vehicle.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => onVehicleSelect(vehicle)}
            >
              <div className="text-center mb-4">
                <Car className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {vehicle.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {vehicle.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ظرفیت:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{vehicle.capacity} نفر</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">قیمت:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(finalPrice)}
                  </span>
                </div>

                {vehicle.price_multiplier > 1 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {vehicle.price_multiplier}x قیمت پایه
                  </div>
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    ویژگی‌ها:
                  </h4>
                  <div className="space-y-1">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedVehicle?.id === vehicle.id && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">انتخاب شده</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
} 