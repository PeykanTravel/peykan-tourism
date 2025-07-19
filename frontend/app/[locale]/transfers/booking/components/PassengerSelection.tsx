'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Users, Briefcase } from 'lucide-react';

interface PassengerSelectionProps {
  onSubmit: (data: { passenger_count: number; luggage_count: number }) => void;
  onBack: () => void;
  initialData?: { passenger_count: number; luggage_count: number };
}

export default function PassengerSelection({ onSubmit, onBack, initialData }: PassengerSelectionProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');

  const [passengerCount, setPassengerCount] = useState(initialData?.passenger_count || 1);
  const [luggageCount, setLuggageCount] = useState(initialData?.luggage_count || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ passenger_count: passengerCount, luggage_count: luggageCount });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('passengerSelection')}</h2>
        <p className="text-gray-600">{t('step4')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('passengerCount')}</label>
          <div className="flex items-center space-x-4">
            <button type="button" onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">-</button>
            <span className="w-8 text-center font-medium">{passengerCount}</span>
            <button type="button" onClick={() => setPassengerCount(passengerCount + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('luggageCount')}</label>
          <div className="flex items-center space-x-4">
            <button type="button" onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">-</button>
            <span className="w-8 text-center font-medium">{luggageCount}</span>
            <button type="button" onClick={() => setLuggageCount(luggageCount + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">+</button>
          </div>
        </div>
        <div className="flex justify-between pt-6">
          <button type="button" onClick={onBack} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">{t('previous')}</button>
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{t('next')}</button>
        </div>
      </form>
    </div>
  );
} 