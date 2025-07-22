'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';

interface Schedule {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  available_capacity: number;
  variants?: Array<{
    id: string;
    name: string;
    available_capacity: number;
  }>;
}

interface ScheduleFieldProps {
  value?: string;
  onChange: (value: string) => void;
  product: any;
  error?: string;
}

export default function ScheduleField({ value, onChange, product, error }: ScheduleFieldProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockSchedules: Schedule[] = [
        {
          id: 'schedule-1',
          start_date: '2024-02-15',
          end_date: '2024-02-15',
          start_time: '08:00',
          end_time: '18:00',
          is_available: true,
          available_capacity: 15,
          variants: [
            { id: 'eco', name: 'اقتصادی', available_capacity: 8 },
            { id: 'normal', name: 'عادی', available_capacity: 5 },
            { id: 'vip', name: 'VIP', available_capacity: 2 }
          ]
        },
        {
          id: 'schedule-2',
          start_date: '2024-02-16',
          end_date: '2024-02-16',
          start_time: '09:00',
          end_time: '19:00',
          is_available: true,
          available_capacity: 20,
          variants: [
            { id: 'eco', name: 'اقتصادی', available_capacity: 12 },
            { id: 'normal', name: 'عادی', available_capacity: 6 },
            { id: 'vip', name: 'VIP', available_capacity: 2 }
          ]
        },
        {
          id: 'schedule-3',
          start_date: '2024-02-17',
          end_date: '2024-02-17',
          start_time: '07:30',
          end_time: '17:30',
          is_available: true,
          available_capacity: 12,
          variants: [
            { id: 'eco', name: 'اقتصادی', available_capacity: 6 },
            { id: 'normal', name: 'عادی', available_capacity: 4 },
            { id: 'vip', name: 'VIP', available_capacity: 2 }
          ]
        }
      ];
      setSchedules(mockSchedules);
      setLoading(false);
    }, 1000);
  }, [product.id]);

  const handleScheduleSelect = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    onChange(schedule.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            در حال بارگذاری زمان‌بندی‌ها...
          </span>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={`loading-schedule-${i}`} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          انتخاب تاریخ و زمان
        </span>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <button
            key={schedule.id}
            onClick={() => handleScheduleSelect(schedule)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
              selectedSchedule?.id === schedule.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {formatDate(schedule.start_date)}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{schedule.available_capacity} نفر ظرفیت</span>
                  </div>
                </div>
              </div>
              
              {selectedSchedule?.id === schedule.id && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Variant availability */}
            {schedule.variants && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  ظرفیت پکیج‌ها:
                </div>
                <div className="flex space-x-2">
                  {schedule.variants.map((variant) => (
                    <div
                      key={`variant-${schedule.id}-${variant.id}`}
                      className={`px-2 py-1 rounded text-xs ${
                        variant.available_capacity > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}
                    >
                      {variant.name}: {variant.available_capacity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {schedules.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>هیچ زمان‌بندی موجودی برای این تور وجود ندارد</p>
        </div>
      )}
    </div>
  );
} 