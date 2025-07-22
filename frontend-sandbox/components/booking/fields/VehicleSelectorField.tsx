'use client';

import React from 'react';

interface VehicleOption {
  id: string;
  name: string;
  price: number;
  capacity: number;
  description?: string;
}

interface VehicleSelectorFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: VehicleOption[];
  label?: string;
}

export function VehicleSelectorField({ value, onChange, options, label = 'نوع وسیله نقلیه' }: VehicleSelectorFieldProps) {
  return (
    <div className="vehicle-selector space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="space-y-3">
        {options.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              value === vehicle.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onChange(vehicle.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{vehicle.name}</h3>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {vehicle.price.toLocaleString()} تومان
                  </span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                  <span>ظرفیت: {vehicle.capacity} نفر</span>
                  {vehicle.description && <span>{vehicle.description}</span>}
                </div>
              </div>
              <div className="ml-4">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  value === vehicle.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {value === vehicle.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 