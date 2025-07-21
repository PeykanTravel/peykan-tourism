'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/lib/stores/currencyStore';
import { MapPin, Calendar, Clock, Star, Users, TrendingUp, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Event } from '@/lib/types/api';

interface EventMapViewProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatPrice: (price: number, currency: string) => string;
}

interface MapMarker {
  id: string;
  event: Event;
  position: {
    lat: number;
    lng: number;
  };
}

export default function EventMapView({
  events,
  onEventSelect,
  formatDate,
  formatTime,
  formatPrice
}: EventMapViewProps) {
  const t = useTranslations('events');
  const { currentCurrency } = useCurrency();
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  // Initialize map markers from events
  useEffect(() => {
    const eventMarkers: MapMarker[] = events
      .filter(event => event.venue?.coordinates)
      .map(event => ({
        id: event.id,
        event,
        position: {
          lat: event.venue.coordinates!.lat,
          lng: event.venue.coordinates!.lng
        }
      }));
    
    setMarkers(eventMarkers);
  }, [events]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  }, []);

  // Mock map implementation (replace with actual map library like Google Maps or Leaflet)
  const renderMap = () => {
    if (!mapLoaded) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">{t('loadingMap')}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-gray-100 relative">
        {/* Map Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Mock Map Markers */}
        <div className="absolute inset-0">
          {markers.map((marker, index) => (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left: `${20 + (index % 5) * 15}%`,
                top: `${20 + Math.floor(index / 5) * 15}%`
              }}
              onClick={() => setSelectedEvent(marker.event)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg transition-transform hover:scale-110 ${
                selectedEvent?.id === marker.event.id
                  ? 'bg-blue-600 ring-4 ring-blue-200'
                  : 'bg-red-500 hover:bg-red-600'
              }`}>
                <MapPin className="h-4 w-4" />
              </div>
              
              {/* Event Count Badge */}
              {marker.event.performances && marker.event.performances.length > 1 && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {marker.event.performances.length}
                </div>
              )}
            </div>
          ))}
          
          {/* User Location */}
          {userLocation && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: '50%',
                top: '50%'
              }}
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-full h-full bg-blue-500 rounded-full animate-ping"></div>
              </div>
            </div>
          )}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => setUserLocation(null)}
            className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            title={t('showMyLocation')}
          >
            <MapPin className="h-5 w-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => setMapLoaded(true)}
            className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            title={t('resetView')}
          >
            <MapPin className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // Simulate map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const nextPerformance = selectedEvent?.performances?.[0];
  const minPrice = selectedEvent?.ticket_types ? 
    Math.min(...selectedEvent.ticket_types.map(tt => tt.price_modifier)) : 0;

  return (
    <div className="h-96 lg:h-[600px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Map Container */}
      <div className="h-full">
        {renderMap()}
      </div>

      {/* Event Details Popup */}
      {selectedEvent && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 pr-2 line-clamp-2">
              {selectedEvent.title}
            </h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {selectedEvent.venue.name}, {selectedEvent.venue.city}
            </div>
            {nextPerformance && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(nextPerformance.date)}
              </div>
            )}
            {nextPerformance && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(selectedEvent.start_time)}
              </div>
            )}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {selectedEvent.performances?.reduce((sum, perf) => sum + perf.available_capacity, 0) || 0} {t('availableSeats')}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {selectedEvent.average_rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({selectedEvent.review_count})
              </span>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(minPrice, currentCurrency)}
              </div>
              <div className="text-xs text-gray-500">{t('fromPrice')}</div>
            </div>
          </div>

          <button
            onClick={() => onEventSelect(selectedEvent)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {t('viewDetails')}
          </button>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
        <div className="font-semibold text-gray-900 mb-2">{t('legend')}</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">{t('eventLocation')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">{t('yourLocation')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 text-white text-xs flex items-center justify-center">2</div>
            <span className="text-gray-600">{t('multiplePerformances')}</span>
          </div>
        </div>
      </div>

      {/* Event Count */}
      <div className="absolute top-4 right-20 bg-white rounded-lg shadow-md p-2 text-sm">
        <span className="font-semibold text-gray-900">{markers.length}</span>
        <span className="text-gray-600 ml-1">{t('eventsShown')}</span>
      </div>
    </div>
  );
} 