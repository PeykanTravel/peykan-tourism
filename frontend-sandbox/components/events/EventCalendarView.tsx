'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Star, Eye } from 'lucide-react';
import { Event } from '@/lib/types/api';

interface EventCalendarViewProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatPrice: (price: number, currency: string) => string;
}

interface CalendarEvent {
  event: Event;
  date: Date;
  performance: any;
}

export default function EventCalendarView({
  events,
  onEventSelect,
  formatDate,
  formatTime,
  formatPrice
}: EventCalendarViewProps) {
  const t = useTranslations('events');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<Event | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar events
  const calendarEvents = useMemo(() => {
    const eventsList: CalendarEvent[] = [];
    
    events.forEach(event => {
      if (event.performances) {
        event.performances.forEach(performance => {
          const performanceDate = new Date(performance.date);
          if (performanceDate.getMonth() === currentMonth && performanceDate.getFullYear() === currentYear) {
            eventsList.push({
              event,
              date: performanceDate,
              performance
            });
          }
        });
      }
    });
    
    return eventsList;
  }, [events, currentMonth, currentYear]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    
    calendarEvents.forEach(calendarEvent => {
      const dateKey = calendarEvent.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(calendarEvent);
    });
    
    return grouped;
  }, [calendarEvents]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks of days
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }
    
    return days;
  }, [currentYear, currentMonth]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  // Get month name
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthName} {currentYear}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              {t('today')}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="px-4 py-3 text-sm font-medium text-gray-900 text-center bg-gray-50">
                {t(`day.${day.toLowerCase()}`)}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7" style={{ height: '480px' }}>
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
              
              return (
                <div
                  key={index}
                  className={`border-r border-b border-gray-200 p-2 cursor-pointer transition-colors ${
                    isCurrentMonth(day) 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 text-gray-400'
                  } ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isToday(day) 
                        ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                        : ''
                    }`}>
                      {day.getDate()}
                    </span>
                    
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((calendarEvent, eventIndex) => {
                      const minPrice = calendarEvent.event.ticket_types ? 
                        Math.min(...calendarEvent.event.ticket_types.map(tt => tt.price_modifier)) : 0;
                      
                      return (
                        <div
                          key={eventIndex}
                          className="bg-blue-100 hover:bg-blue-200 rounded px-2 py-1 cursor-pointer transition-colors"
                          onMouseEnter={() => setHoveredEvent(calendarEvent.event)}
                          onMouseLeave={() => setHoveredEvent(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventSelect(calendarEvent.event);
                          }}
                        >
                          <div className="text-xs font-medium text-blue-800 truncate">
                            {calendarEvent.event.title}
                          </div>
                          <div className="text-xs text-blue-600">
                            {formatTime(calendarEvent.event.start_time)}
                          </div>
                        </div>
                      );
                    })}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 3} {t('more')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events Panel */}
        {selectedDate && (
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {formatDate(selectedDate.toISOString())}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDateEvents.length} {t('eventsScheduled')}
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {selectedDateEvents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('noEventsScheduled')}</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {selectedDateEvents.map((calendarEvent, index) => {
                    const minPrice = calendarEvent.event.ticket_types ? 
                      Math.min(...calendarEvent.event.ticket_types.map(tt => tt.price_modifier)) : 0;
                    
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => onEventSelect(calendarEvent.event)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                            {calendarEvent.event.title}
                          </h4>
                          <button className="text-blue-600 hover:text-blue-800 ml-2">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(calendarEvent.event.start_time)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {calendarEvent.event.venue.name}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {calendarEvent.performance.available_capacity} {t('available')}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-400 mr-1" />
                            <span className="text-xs text-gray-600">
                              {calendarEvent.event.average_rating.toFixed(1)} ({calendarEvent.event.review_count})
                            </span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            {formatPrice(minPrice, 'USD')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover Event Tooltip */}
      {hoveredEvent && (
        <div className="absolute z-10 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm max-w-64 pointer-events-none">
          <div className="font-medium mb-1">{hoveredEvent.title}</div>
          <div className="text-gray-300 text-xs">
            {hoveredEvent.venue.name} • {formatTime(hoveredEvent.start_time)}
          </div>
          <div className="text-gray-300 text-xs mt-1">
            {hoveredEvent.performances?.reduce((sum, perf) => sum + perf.available_capacity, 0) || 0} {t('seatsAvailable')}
          </div>
        </div>
      )}
    </div>
  );
} 