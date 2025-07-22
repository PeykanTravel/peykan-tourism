'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { MapPin, Clock, Camera, Bus, Utensils, Hotel, Info, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { tourService, TourItinerary as TourItineraryType } from '../../../../lib/services/tourService';
import { OptimizedImage } from '../../../ui/OptimizedImage';

interface TourItineraryProps {
  tourId?: string;
  tourSlug?: string;
  title?: string;
  totalDuration?: string;
  startLocation?: string;
  endLocation?: string;
}

interface ItineraryItem extends TourItineraryType {
  type?: 'transport' | 'visit' | 'meal' | 'rest' | 'activity';
  notes?: string;
}

export default function TourItinerary({
  tourId,
  tourSlug,
  title = 'برنامه سفر',
  totalDuration,
  startLocation,
  endLocation
}: TourItineraryProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItinerary = useCallback(async () => {
    if (!tourId && !tourSlug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const identifier = tourSlug || tourId;
      if (!identifier) return;
      const tourDetails = await tourService.fetchTourDetails(identifier);
      setItinerary(tourDetails.itinerary || []);
    } catch (err) {
      console.error('Error fetching itinerary:', err);
      setError('خطا در دریافت برنامه سفر');
    } finally {
      setLoading(false);
    }
  }, [tourId, tourSlug]);

  // Fetch itinerary when tourId changes
  useEffect(() => {
    if (tourId || tourSlug) {
      fetchItinerary();
    }
  }, [tourId, tourSlug, fetchItinerary]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'transport':
        return <Bus className="w-5 h-5" />;
      case 'visit':
        return <Camera className="w-5 h-5" />;
      case 'meal':
        return <Utensils className="w-5 h-5" />;
      case 'rest':
        return <Hotel className="w-5 h-5" />;
      case 'activity':
        return <Info className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'transport':
        return 'bg-blue-500 text-white';
      case 'visit':
        return 'bg-green-500 text-white';
      case 'meal':
        return 'bg-orange-500 text-white';
      case 'rest':
        return 'bg-purple-500 text-white';
      case 'activity':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getItemBorderColor = (type: string) => {
    switch (type) {
      case 'transport':
        return 'border-blue-200 dark:border-blue-800';
      case 'visit':
        return 'border-green-200 dark:border-green-800';
      case 'meal':
        return 'border-orange-200 dark:border-orange-800';
      case 'rest':
        return 'border-purple-200 dark:border-purple-800';
      case 'activity':
        return 'border-red-200 dark:border-red-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} ساعت و ${mins} دقیقه`;
    } else if (hours > 0) {
      return `${hours} ساعت`;
    } else {
      return `${mins} دقیقه`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
          <span className="text-red-600 dark:text-red-400">{error}</span>
        </div>
      </div>
    );
  }

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          برنامه سفر برای این تور تعریف نشده است
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {totalDuration && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>کل زمان: {totalDuration}</span>
          </div>
        )}
      </div>

      {/* Start and End Locations */}
      {(startLocation || endLocation) && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          {startLocation && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>شروع: {startLocation}</span>
            </div>
          )}
          {endLocation && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>پایان: {endLocation}</span>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        <div className="space-y-4">
          {itinerary.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const isLast = index === itinerary.length - 1;
            
            return (
              <div key={item.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute right-6 top-6 w-4 h-4 rounded-full border-4 border-white dark:border-gray-800 ${
                  getItemColor(item.type || 'default')
                } z-10`}></div>
                
                {/* Timeline Line (except for last item) */}
                {!isLast && (
                  <div className="absolute right-6 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                )}
                
                {/* Content Card */}
                <Card className={`mr-12 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  getItemBorderColor(item.type || 'default')
                } ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => toggleExpanded(item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                          getItemColor(item.type || 'default')
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{item.location}</span>
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{Math.floor(item.duration_minutes / 60)} ساعت {item.duration_minutes % 60} دقیقه</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description (always visible) */}
                      <p className="text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                        {item.description}
                      </p>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                          {/* Image */}
                          {item.image && (
                            <div className="rounded-lg overflow-hidden">
                              <OptimizedImage
                                src={item.image}
                                alt={item.title}
                                width={400}
                                height={300}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Additional Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                جزئیات بیشتر:
                              </h5>
                              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>موقعیت: {item.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>مدت زمان: {Math.floor(item.duration_minutes / 60)} ساعت {item.duration_minutes % 60} دقیقه</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-4 h-4 mr-2">#</span>
                                  <span>ترتیب: {item.order}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Notes */}
                            {item.notes && (
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                  نکات مهم:
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Expand/Collapse Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(item.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 