'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, Users, Star, MapPin, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface EventPerformance {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_capacity: number;
  available_capacity: number;
  is_special: boolean;
  venue: {
    name: string;
    address: string;
  };
}

interface EventScheduleProps {
  performances: EventPerformance[];
  selectedPerformance: EventPerformance | null;
  onPerformanceSelect: (performance: EventPerformance) => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatPrice: (price: number, currency: string) => string;
}

export default function EventSchedule({
  performances,
  selectedPerformance,
  onPerformanceSelect,
  formatDate,
  formatTime,
  formatPrice
}: EventScheduleProps) {
  const t = useTranslations('eventDetail');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const getAvailabilityStatus = (performance: EventPerformance) => {
    const occupancyRate = ((performance.max_capacity - performance.available_capacity) / performance.max_capacity) * 100;
    
    if (occupancyRate >= 95) return 'sold_out';
    if (occupancyRate >= 80) return 'few_left';
    if (occupancyRate >= 50) return 'filling_up';
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sold_out': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'few_left': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';
      case 'filling_up': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sold_out': return <AlertCircle className="h-4 w-4" />;
      case 'few_left': return <TrendingUp className="h-4 w-4" />;
      case 'filling_up': return <Users className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sold_out': return t('soldOut');
      case 'few_left': return t('fewTicketsLeft');
      case 'filling_up': return t('fillingUp');
      default: return t('available');
    }
  };

  const isPerformanceSelectable = (performance: EventPerformance) => {
    return performance.is_available && performance.available_capacity > 0;
  };

  // Group performances by date for calendar view
  const performancesByDate = useMemo(() => {
    return performances.reduce((acc, performance) => {
      const date = performance.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(performance);
      return acc;
    }, {} as Record<string, EventPerformance[]>);
  }, [performances]);

  // Calendar view helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        day,
        date: dateString,
        performances: performancesByDate[dateString] || []
      });
    }

    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (performances.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('noPerformancesAvailable')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t('checkBackLater')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('selectPerformance')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {performances.length} {t('performancesAvailable')}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('listView')}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {t('calendarView')}
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6">
          <div className="space-y-4">
            {performances.map((performance) => {
              const status = getAvailabilityStatus(performance);
              const isSelected = selectedPerformance?.id === performance.id;
              const isSelectable = isPerformanceSelectable(performance);

              return (
                <div
                  key={performance.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : isSelectable
                        ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => isSelectable && onPerformanceSelect(performance)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(performance.date)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(performance.start_time)} - {formatTime(performance.end_time)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {performance.venue.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Capacity */}
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {performance.available_capacity}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('available')}
                        </div>
                      </div>

                      {/* Status */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(status)}
                          <span>{getStatusText(status)}</span>
                        </div>
                      </div>

                      {/* Special Performance Badge */}
                      {performance.is_special && (
                        <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 inline mr-1" />
                          {t('special')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                      <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('selected')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedMonth.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}
            </h3>
            <button
              onClick={() => changeMonth('next')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getCalendarDays().map((dayData, index) => (
              <div
                key={index}
                className={`p-2 min-h-[80px] border border-gray-200 dark:border-gray-700 ${
                  !dayData ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                }`}
              >
                {dayData && (
                  <>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {dayData.day}
                    </div>
                    {dayData.performances.map((performance) => {
                      const status = getAvailabilityStatus(performance);
                      const isSelected = selectedPerformance?.id === performance.id;
                      const isSelectable = isPerformanceSelectable(performance);

                      return (
                        <div
                          key={performance.id}
                          className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : isSelectable
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/40'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                          onClick={() => isSelectable && onPerformanceSelect(performance)}
                          title={`${formatTime(performance.start_time)} - ${performance.venue.name}`}
                        >
                          <div className="font-medium">{formatTime(performance.start_time)}</div>
                          <div className="text-xs opacity-75">{performance.available_capacity} {t('available')}</div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedPerformance && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100">
                {t('selectedPerformance')}:
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-200">
                {formatDate(selectedPerformance.date)} - {formatTime(selectedPerformance.start_time)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-300">
                {selectedPerformance.venue.name}
              </p>
            </div>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
        </div>
      )}
    </div>
  );
} 