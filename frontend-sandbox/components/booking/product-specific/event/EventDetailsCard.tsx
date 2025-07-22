'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, MapPin, Users, Star, Info, Music, Theater, Camera, Mic, Users2 } from 'lucide-react';

interface EventDetails {
  id: string;
  title: string;
  description: string;
  short_description: string;
  highlights: string;
  rules: string;
  required_items: string;
  image: string;
  gallery: string[];
  style: 'music' | 'sports' | 'theater' | 'festival' | 'conference' | 'exhibition';
  door_open_time: string;
  start_time: string;
  end_time: string;
  age_restriction?: number;
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  artists: Array<{
    id: string;
    name: string;
    bio: string;
    image: string;
  }>;
  category: {
    name: string;
    description: string;
  };
  average_rating: number;
  review_count: number;
}

interface EventDetailsCardProps {
  event: EventDetails;
  formatTime: (time: string) => string;
  formatPrice: (price: number, currency: string) => string;
}

export default function EventDetailsCard({
  event,
  formatTime,
  formatPrice
}: EventDetailsCardProps) {
  const t = useTranslations('eventDetail');

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'music': return <Music className="w-5 h-5" />;
      case 'theater': return <Theater className="w-5 h-5" />;
      case 'sports': return <Users2 className="w-5 h-5" />;
      case 'festival': return <Camera className="w-5 h-5" />;
      case 'conference': return <Mic className="w-5 h-5" />;
      case 'exhibition': return <Camera className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'music': return 'text-purple-600 dark:text-purple-400';
      case 'theater': return 'text-blue-600 dark:text-blue-400';
      case 'sports': return 'text-green-600 dark:text-green-400';
      case 'festival': return 'text-yellow-600 dark:text-yellow-400';
      case 'conference': return 'text-red-600 dark:text-red-400';
      case 'exhibition': return 'text-indigo-600 dark:text-indigo-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStyleBadge = (style: string) => {
    switch (style) {
      case 'music': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'theater': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'sports': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'festival': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'conference': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'exhibition': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />);
    }

    return stars;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {getStyleIcon(event.style)}
              <span className={`text-sm font-medium ${getStyleColor(event.style)}`}>
                {event.category.name}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStyleBadge(event.style)}`}>
                {t(event.style)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {event.short_description}
            </p>
            
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(event.average_rating)}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {event.average_rating.toFixed(1)} ({event.review_count} {t('reviews')})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Image */}
      {event.image && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Event Information */}
      <div className="p-6 space-y-6">
        {/* Timing Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {t('doorOpen')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(event.door_open_time)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {t('startTime')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(event.start_time)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {t('endTime')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatTime(event.end_time)}
              </div>
            </div>
          </div>
        </div>

        {/* Venue Information */}
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-red-600 mt-1" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {event.venue.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {event.venue.address}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {event.venue.city}, {event.venue.country}
            </div>
          </div>
        </div>

        {/* Age Restriction */}
        {event.age_restriction && (
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {t('ageRestriction')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('minimumAge')}: {event.age_restriction} {t('years')}
              </div>
            </div>
          </div>
        )}

        {/* Artists */}
        {event.artists.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('artists')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.artists.map((artist) => (
                <div key={artist.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {artist.image && (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {artist.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {artist.bio}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {t('description')}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Highlights */}
        {event.highlights && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('highlights')}
            </h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                {event.highlights}
              </p>
            </div>
          </div>
        )}

        {/* Rules */}
        {event.rules && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('rulesAndRegulations')}
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                {event.rules}
              </p>
            </div>
          </div>
        )}

        {/* Required Items */}
        {event.required_items && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('requiredItems')}
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                {event.required_items}
              </p>
            </div>
          </div>
        )}

        {/* Gallery */}
        {event.gallery && event.gallery.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('gallery')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.gallery.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image}
                    alt={`${event.title} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 