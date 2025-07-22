'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { tourService, TourSchedule } from '../../../../lib/services/tourService';

interface ScheduleCalendarProps {
  tourId?: string;
  tourSlug?: string;
  selectedSchedule?: string;
  onScheduleSelect: (scheduleId: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

interface ScheduleWithVariants {
  id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  available_capacity: number;
  total_capacity?: number;
  day_of_week: number;
  variants: Array<{
    id: string;
    name: string;
    total_capacity: number;
    booked_capacity: number;
    available_capacity: number;
    is_available: boolean;
  }>;
}

export default function ScheduleCalendar({
  tourId,
  tourSlug,
  selectedSchedule,
  onScheduleSelect,
  minDate = new Date(),
  maxDate
}: ScheduleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [schedules, setSchedules] = useState<ScheduleWithVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!tourId && !tourSlug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const identifier = tourSlug || tourId;
      if (!identifier) return;
      const data = await tourService.fetchTourSchedules(identifier);
      // تبدیل TourSchedule به ScheduleWithVariants
      const convertedSchedules: ScheduleWithVariants[] = (data.schedules || []).map(schedule => ({
        id: schedule.id,
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_available: schedule.is_available,
        available_capacity: schedule.available_capacity,
        total_capacity: schedule.max_capacity,
        day_of_week: schedule.day_of_week,
        variants: []
      }));
      setSchedules(convertedSchedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('خطا در دریافت برنامه‌های زمانی');
    } finally {
      setLoading(false);
    }
  }, [tourId, tourSlug]);

  // Fetch schedules when tourId changes
  useEffect(() => {
    if (tourId || tourSlug) {
      fetchSchedules();
    }
  }, [tourId, tourSlug, fetchSchedules]);

  // Get current month's schedules
  const getCurrentMonthSchedules = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_date);
      return scheduleDate.getFullYear() === year && scheduleDate.getMonth() === month;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length < 42) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySchedules = schedules.filter(s => s.start_date === dateStr);
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        schedules: daySchedules,
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const currentMonthSchedules = getCurrentMonthSchedules();

  const getCapacityColor = (capacity: number, total?: number) => {
    if (!total) return 'text-gray-600';
    const percentage = (capacity / total) * 100;
    if (percentage > 70) return 'text-green-600';
    if (percentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCapacityText = (capacity: number, total?: number) => {
    if (!total) return `${capacity} نفر`;
    const percentage = Math.round((capacity / total) * 100);
    return `${capacity}/${total} (${percentage}%)`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return days[dayOfWeek];
  };

  const getAvailabilityStatus = (schedule: ScheduleWithVariants) => {
    const hasAvailableVariants = schedule.variants.some(v => v.is_available);
    const totalAvailable = schedule.variants.reduce((sum, v) => sum + v.available_capacity, 0);
    
    if (!schedule.is_available || !hasAvailableVariants) {
      return { status: 'unavailable', text: 'ناموجود', icon: XCircle, color: 'text-red-500' };
    }
    
    if (totalAvailable < 5) {
      return { status: 'limited', text: 'محدود', icon: AlertCircle, color: 'text-yellow-500' };
    }
    
    return { status: 'available', text: 'موجود', icon: CheckCircle, color: 'text-green-500' };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            انتخاب تاریخ و زمان
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="mr-2 text-gray-600 dark:text-gray-300">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            انتخاب تاریخ و زمان
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <span className="text-red-600 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          انتخاب تاریخ و زمان
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={viewMode === 'calendar' ? 'bg-blue-50 border-blue-500' : ''}
          >
            <Calendar className="w-4 h-4 mr-1" />
            تقویم
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-blue-50 border-blue-500' : ''}
          >
            <Clock className="w-4 h-4 mr-1" />
            لیست
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card className="p-4">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentMonth.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, index) => {
              const hasSchedules = day.schedules.length > 0;
              const isSelected = day.schedules.some(s => s.id === selectedSchedule);
              
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer transition-colors ${
                    !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800 text-gray-400' : ''
                  } ${
                    day.isToday ? 'ring-2 ring-blue-500' : ''
                  } ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : ''
                  } ${
                    hasSchedules ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                  }`}
                  onClick={() => {
                    if (hasSchedules) {
                      const firstAvailable = day.schedules.find(s => s.is_available);
                      if (firstAvailable) {
                        onScheduleSelect(firstAvailable.id);
                      }
                    }
                  }}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  
                  {hasSchedules && (
                    <div className="space-y-1">
                      {day.schedules.slice(0, 2).map(schedule => {
                        const status = getAvailabilityStatus(schedule);
                        return (
                          <div key={schedule.id} className="text-xs">
                            <div className={`flex items-center ${status.color}`}>
                              <status.icon className="w-3 h-3 mr-1" />
                              <span>{status.text}</span>
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {schedule.start_time}
                            </div>
                          </div>
                        );
                      })}
                      {day.schedules.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{day.schedules.length - 2} بیشتر
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* List View */
        <div className="space-y-3">
          {currentMonthSchedules.length > 0 ? (
            currentMonthSchedules.map((schedule) => {
              const status = getAvailabilityStatus(schedule);
              const isSelected = selectedSchedule === schedule.id;
              
              return (
                <Card
                  key={schedule.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${
                    !schedule.is_available ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => schedule.is_available && onScheduleSelect(schedule.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`flex items-center ${status.color} mr-3`}>
                          <status.icon className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{status.text}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {getDayName(schedule.day_of_week)}
                        </span>
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {new Date(schedule.start_date).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{schedule.start_time} - {schedule.end_time}</span>
                      </div>
                      
                      {/* Variant Capacities */}
                      <div className="space-y-1">
                        {schedule.variants.map(variant => (
                          <div key={variant.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{variant.name}:</span>
                            <span className={getCapacityColor(variant.available_capacity, variant.total_capacity)}>
                              {getCapacityText(variant.available_capacity, variant.total_capacity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ برنامه‌ای برای این ماه یافت نشد
            </div>
          )}
        </div>
      )}
    </div>
  );
} 