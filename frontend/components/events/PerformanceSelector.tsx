'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, Users, Star } from 'lucide-react';
import { EventPerformance } from '@/lib/types/api';

interface PerformanceSelectorProps {
  performances: EventPerformance[];
  selectedPerformance: EventPerformance | null;
  onSelect: (performance: EventPerformance) => void;
}

export default function PerformanceSelector({
  performances,
  selectedPerformance,
  onSelect
}: PerformanceSelectorProps) {
  const t = useTranslations('eventDetail');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group performances by date
  const performancesByDate = performances.reduce((acc, performance) => {
    const date = performance.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(performance);
    return acc;
  }, {} as Record<string, EventPerformance[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailabilityColor = (performance: EventPerformance) => {
    const occupancyRate = performance.current_capacity / performance.max_capacity;
    if (occupancyRate >= 0.9) return 'text-red-600';
    if (occupancyRate >= 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAvailabilityText = (performance: EventPerformance) => {
    const available = performance.max_capacity - performance.current_capacity;
    if (available <= 5) return t('fewSeatsLeft');
    if (available <= 20) return t('limitedAvailability');
    return t('available');
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <h3 className="text-lg font-medium mb-4">{t('selectDate')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(performancesByDate).map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(selectedDate === date ? null : date)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                selectedDate === date
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{formatDate(date)}</span>
              </div>
              <div className="text-sm text-gray-600">
                {performancesByDate[date].length} {t('performance', { count: performancesByDate[date].length })}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Performance List */}
      {selectedDate && (
        <div>
          <h3 className="text-lg font-medium mb-4">{t('selectTime')}</h3>
          <div className="space-y-3">
            {performancesByDate[selectedDate].map((performance) => (
              <div
                key={performance.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPerformance?.id === performance.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelect(performance)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {formatTime(performance.start_time)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm ${getAvailabilityColor(performance)}`}>
                        {getAvailabilityText(performance)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {performance.current_capacity} / {performance.max_capacity} {t('seats')}
                    </div>
                    {performance.is_special && (
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs">{t('specialPerformance')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Pricing Info */}
                {performance.min_price && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {t('startingFrom')} <span className="font-semibold text-blue-600">
                        ${performance.min_price}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Performances Message */}
      {performances.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-lg mb-2">{t('noPerformances')}</div>
          <p className="text-gray-400">{t('noPerformancesDescription')}</p>
        </div>
      )}
    </div>
  );
} 