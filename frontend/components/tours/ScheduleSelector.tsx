/**
 * Schedule Selector Component
 * 
 * Component for selecting tour schedules
 */

'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface TourSchedule {
  id: string;
  tour_id: string;
  variant_id: string;
  date: string;
  time: string;
  available_spots: number;
  guide_name?: string;
  meeting_point: string;
}

interface ScheduleSelectorProps {
  schedules: TourSchedule[];
  selectedScheduleId: string | null;
  onScheduleSelect: (scheduleId: string) => void;
  variantId?: string;
}

export default function ScheduleSelector({
  schedules,
  selectedScheduleId,
  onScheduleSelect,
  variantId,
}: ScheduleSelectorProps) {
  const t = useTranslations('scheduleSelector');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Filter schedules by variant if provided
  const filteredSchedules = variantId 
    ? schedules.filter(schedule => schedule.variant_id === variantId)
    : schedules;

  // Group schedules by date
  const schedulesByDate = filteredSchedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, TourSchedule[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const isDateAvailable = (date: string) => {
    return schedulesByDate[date]?.some(schedule => schedule.available_spots > 0);
  };

  const getAvailableSchedulesForDate = (date: string) => {
    return schedulesByDate[date]?.filter(schedule => schedule.available_spots > 0) || [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-sm text-neutral-600">{t('description')}</p>
      </CardHeader>
      <CardContent>
        {/* Date Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            {t('selectDate')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.keys(schedulesByDate)
              .sort()
              .map((date) => {
                const isAvailable = isDateAvailable(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    disabled={!isAvailable}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : isAvailable
                        ? 'border-neutral-300 hover:border-neutral-400 text-neutral-700'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs text-neutral-500 mb-1">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div>
                      {new Date(date).getDate()}
                    </div>
                    <div className="text-xs">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              {t('selectTime')} - {formatDate(selectedDate)}
            </h4>
            <div className="space-y-3">
              {getAvailableSchedulesForDate(selectedDate).map((schedule) => {
                const isSelected = selectedScheduleId === schedule.id;

                return (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    onClick={() => onScheduleSelect(schedule.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium text-neutral-900">
                            {formatTime(schedule.time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm text-neutral-600">
                            {t('availableSpots')}: {schedule.available_spots}
                          </span>
                        </div>

                        {schedule.guide_name && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-neutral-600">
                              {t('guide')}: {schedule.guide_name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm text-neutral-600">
                            {schedule.meeting_point}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-primary-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-primary-700 font-medium">
                            {t('selected')}
                          </span>
                          <Button size="sm" variant="outline">
                            {t('change')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {getAvailableSchedulesForDate(selectedDate).length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-500">{t('noSchedulesAvailable')}</p>
              </div>
            )}
          </div>
        )}

        {selectedScheduleId && (
          <div className="mt-6 p-4 bg-primary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-primary-700">
                  {t('selectedSchedule')}
                </h4>
                <p className="text-sm text-primary-600">
                  {selectedDate && formatDate(selectedDate)} at{' '}
                  {schedules.find(s => s.id === selectedScheduleId)?.time}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-primary-600">
                  {t('meetingPoint')}: {schedules.find(s => s.id === selectedScheduleId)?.meeting_point}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 