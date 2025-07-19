'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface DateTimeSelectionProps {
  onSubmit: (data: {
    trip_type: 'one_way' | 'round_trip';
    outbound_date: string;
    outbound_time: string;
    return_date?: string;
    return_time?: string;
  }) => void;
  onBack: () => void;
  initialData?: {
    trip_type: 'one_way' | 'round_trip';
    outbound_date: string;
    outbound_time: string;
    return_date?: string;
    return_time?: string;
  };
}

export default function DateTimeSelection({ onSubmit, onBack, initialData }: DateTimeSelectionProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');
  
  const [formData, setFormData] = useState({
    trip_type: initialData?.trip_type || 'one_way' as 'one_way' | 'round_trip',
    outbound_date: initialData?.outbound_date || '',
    outbound_time: initialData?.outbound_time || '',
    return_date: initialData?.return_date || '',
    return_time: initialData?.return_time || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.outbound_date) {
      newErrors.outbound_date = t('outboundDateRequired');
    }

    if (!formData.outbound_time) {
      newErrors.outbound_time = t('outboundTimeRequired');
    }

    if (formData.trip_type === 'round_trip') {
      if (!formData.return_date) {
        newErrors.return_date = t('returnDateRequired');
      }
      if (!formData.return_time) {
        newErrors.return_time = t('returnTimeRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum return date (outbound date + 1 day)
  const getMinReturnDate = () => {
    if (!formData.outbound_date) return getMinDate();
    const outboundDate = new Date(formData.outbound_date);
    outboundDate.setDate(outboundDate.getDate() + 1);
    return outboundDate.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('dateTimeSelection')}
        </h2>
        <p className="text-gray-600">
          {t('step3')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('tripType')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="relative">
              <input
                type="radio"
                name="trip_type"
                value="one_way"
                checked={formData.trip_type === 'one_way'}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.trip_type === 'one_way'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  <span className="font-medium">{t('oneWay')}</span>
                </div>
              </div>
            </label>
            
            <label className="relative">
              <input
                type="radio"
                name="trip_type"
                value="round_trip"
                checked={formData.trip_type === 'round_trip'}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.trip_type === 'round_trip'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                  <span className="font-medium">{t('roundTrip')}</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Outbound Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('outboundDate')} *
            </label>
            <div className="relative">
              <input
                type="date"
                name="outbound_date"
                value={formData.outbound_date}
                onChange={handleInputChange}
                min={getMinDate()}
                className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.outbound_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.outbound_date && (
              <p className="mt-1 text-sm text-red-600">{errors.outbound_date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('outboundTime')} *
            </label>
            <div className="relative">
              <input
                type="time"
                name="outbound_time"
                value={formData.outbound_time}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.outbound_time ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.outbound_time && (
              <p className="mt-1 text-sm text-red-600">{errors.outbound_time}</p>
            )}
          </div>
        </div>

        {/* Return Date & Time (for round trip) */}
        {formData.trip_type === 'round_trip' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('returnDate')} *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="return_date"
                  value={formData.return_date}
                  onChange={handleInputChange}
                  min={getMinReturnDate()}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.return_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.return_date && (
                <p className="mt-1 text-sm text-red-600">{errors.return_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('returnTime')} *
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="return_time"
                  value={formData.return_time}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.return_time ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              {errors.return_time && (
                <p className="mt-1 text-sm text-red-600">{errors.return_time}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('previous')}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('next')}
          </button>
        </div>
      </form>
    </div>
  );
}