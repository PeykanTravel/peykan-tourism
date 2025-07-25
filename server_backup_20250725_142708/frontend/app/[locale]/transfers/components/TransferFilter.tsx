'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, MapPin, Car } from 'lucide-react';

interface TransferFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedVehicleType: string;
  setSelectedVehicleType: (type: string) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  selectedDestination: string;
  setSelectedDestination: (destination: string) => void;
  resultsCount: number;
}

export default function TransferFilter({
  searchTerm,
  setSearchTerm,
  selectedVehicleType,
  setSelectedVehicleType,
  selectedOrigin,
  setSelectedOrigin,
  selectedDestination,
  setSelectedDestination,
  resultsCount
}: TransferFilterProps) {
  const t = useTranslations('transfers');

  const vehicleTypeOptions = [
    { value: '', label: t('allVehicles') },
    { value: 'sedan', label: t('vehicleTypes.sedan') },
    { value: 'suv', label: t('vehicleTypes.suv') },
    { value: 'van', label: t('vehicleTypes.van') },
    { value: 'bus', label: t('vehicleTypes.bus') },
    { value: 'limousine', label: t('vehicleTypes.limousine') }
  ];

  const locationOptions = [
    { value: '', label: t('allLocations') },
    { value: 'tehran_airport', label: 'Tehran Imam Khomeini Airport' },
    { value: 'tehran_center', label: 'Tehran City Center' },
    { value: 'isfahan_airport', label: 'Isfahan Airport' },
    { value: 'isfahan_center', label: 'Isfahan City Center' },
    { value: 'shiraz_airport', label: 'Shiraz Airport' },
    { value: 'shiraz_center', label: 'Shiraz City Center' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVehicleType('');
    setSelectedOrigin('');
    setSelectedDestination('');
  };

  const hasActiveFilters = searchTerm || selectedVehicleType || selectedOrigin || selectedDestination;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Origin Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {locationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Destination Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {locationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Type Filter */}
        <div className="relative">
          <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            {vehicleTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count and Clear Filters */}
        <div className="flex items-center justify-between">
          <div className="text-gray-600 text-sm">
            {resultsCount} {t('resultsFound')}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center">
                {t('search')}: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedVehicleType && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center">
                {t('vehicleType')}: {t(`vehicleTypes.${selectedVehicleType}`)}
                <button
                  onClick={() => setSelectedVehicleType('')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedOrigin && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded flex items-center">
                {t('origin')}: {locationOptions.find(opt => opt.value === selectedOrigin)?.label}
                <button
                  onClick={() => setSelectedOrigin('')}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {selectedDestination && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded flex items-center">
                {t('destination')}: {locationOptions.find(opt => opt.value === selectedDestination)?.label}
                <button
                  onClick={() => setSelectedDestination('')}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 