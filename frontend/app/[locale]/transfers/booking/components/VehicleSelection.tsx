'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Car } from 'lucide-react';

interface Vehicle {
  type: string;
  name: string;
  description: string;
  max_passengers: number;
  max_luggage: number;
}

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  onSubmit: (vehicle: Vehicle) => void;
  initialVehicleType?: string;
}

export default function VehicleSelection({ vehicles, onSubmit, initialVehicleType }: VehicleSelectionProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');
  const [selectedType, setSelectedType] = useState(initialVehicleType || (vehicles[0]?.type ?? ''));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find(v => v.type === selectedType);
    if (vehicle) onSubmit(vehicle);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('vehicleSelection')}</h2>
        <p className="text-gray-600">{t('step2')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectVehicle')}</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {vehicles.map(vehicle => (
              <option key={vehicle.type} value={vehicle.type}>{vehicle.name} ({vehicle.max_passengers} {t('passengers')}, {vehicle.max_luggage} {t('luggage')})</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-6">
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{t('next')}</button>
        </div>
      </form>
    </div>
  );
} 