'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/lib/stores/currencyStore';
import { Heart, Share2, MapPin, Calendar, Clock, TrendingUp, Music, Theater, Film, Gamepad2, Palette, Camera, BookOpen, Globe, Star, Trophy, Drama, Sparkles, Briefcase, Ticket, Users } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';
import { Event } from '@/lib/types/api';
import { PriceDisplay } from '../ui/Price';

interface EventCardProps {
  event: Event;
  viewMode: 'grid' | 'list';
  onFavorite?: (eventId: string) => void;
  onShare?: (event: Event) => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatPrice: (price: number, currency: string) => string;
  isFavorite?: boolean;
}

const getStyleIcon = (style: string) => {
  switch (style) {
    case 'music': return <Music className="h-4 w-4" />;
    case 'sports': return <Trophy className="h-4 w-4" />;
    case 'theater': return <Drama className="h-4 w-4" />;
    case 'festival': return <Sparkles className="h-4 w-4" />;
    case 'conference': return <Briefcase className="h-4 w-4" />;
    case 'exhibition': return <Palette className="h-4 w-4" />;
    default: return <Ticket className="h-4 w-4" />;
  }
};

const getStyleColor = (style: string) => {
  switch (style) {
    case 'music': return 'bg-purple-100 text-purple-800';
    case 'sports': return 'bg-green-100 text-green-800';
    case 'theater': return 'bg-red-100 text-red-800';
    case 'festival': return 'bg-yellow-100 text-yellow-800';
    case 'conference': return 'bg-blue-100 text-blue-800 dark:text-blue-200';
    case 'exhibition': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function EventCard({
  event,
  viewMode,
  onFavorite,
  onShare,
  formatDate,
  formatTime,
  formatPrice,
  isFavorite = false
}: EventCardProps) {
  const t = useTranslations('events');
  const { currentCurrency } = useCurrency();
  const [imageLoaded, setImageLoaded] = useState(false);

  const nextPerformance = event.performances?.[0];
  const minPrice = Math.min(...(event.ticket_types?.map(tt => tt.price_modifier) || [0]));
  const availableCapacity = event.performances?.reduce((sum, perf) => sum + perf.available_capacity, 0) || 0;
  const totalCapacity = event.performances?.reduce((sum, perf) => sum + perf.max_capacity, 0) || 0;
  const occupancyRate = totalCapacity > 0 ? ((totalCapacity - availableCapacity) / totalCapacity) * 100 : 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(event.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(event);
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/events/${event.slug}`} className="block group">
        <div className="flex w-full max-w-5xl mx-auto h-56 sm:h-72 rounded-xl shadow-xl overflow-hidden relative" style={{ background: 'linear-gradient(120deg, #dfeaef 0%, #c0cfe4 25%, #bcdee1 50%, #d4e3ca 75%, #e6ced1 100%)' }}>
          {/* Left: Event image */}
          <div className="flex-shrink-0 w-1/3 h-full">
            <OptimizedImage
              src="/images/event-center-image.jpg"
              alt="event center"
              width={200}
              height={288}
              className="object-cover w-full h-full rounded-l-xl"
            />
          </div>
          {/* Center: Event info */}
          <div className="flex flex-col justify-center items-start bg-white dark:bg-gray-800 h-full px-8 py-6 w-2/5 min-w-[220px] gap-6">
            <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight uppercase leading-tight text-gray-900 dark:text-white mb-2">{event.title}</div>
            <div className="grid grid-cols-2 gap-2 w-full text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300">
              <div className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-center">27 May</div>
              <div className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-center">Fauget Studio</div>
              <div className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-center">16.00 - 18.00</div>
              <div className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-center">123 Anywhere St., Any City</div>
            </div>
          </div>
          {/* Perforated divider */}
          <div className="flex flex-col justify-center items-center h-full px-0">
            <svg height="90%" width="18" className="block" style={{ minHeight: '90%', margin: 'auto' }}>
              <line x1="9" y1="0" x2="9" y2="100%" stroke="#bbb" strokeDasharray="6,6" strokeWidth="2" />
            </svg>
          </div>
          {/* Right: Ticket info, 4 vertical columns */}
          <div className="flex flex-row items-center justify-center bg-white dark:bg-gray-800 h-full px-2 py-4 w-[220px] min-w-[180px] gap-2">
            {/* Col 1: Values */}
            <div className="flex flex-col items-center justify-center gap-2 text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              <div>2F</div>
              <div>G</div>
              <div>10</div>
              <div>25</div>
            </div>
            {/* Col 2: Labels */}
            <div className="flex flex-col items-end justify-center gap-2 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 pr-1">
              <div>Level</div>
              <div>Sec</div>
              <div>Row</div>
              <div>Seat</div>
            </div>
            {/* Col 3: Barcode */}
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="h-24 w-8" viewBox="0 0 40 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="40" height="100" fill="white" />
                <rect x="3" y="5" width="2" height="90" fill="#222" />
                <rect x="8" y="5" width="1" height="90" fill="#222" />
                <rect x="12" y="5" width="3" height="90" fill="#222" />
                <rect x="18" y="5" width="1" height="90" fill="#222" />
                <rect x="22" y="5" width="2" height="90" fill="#222" />
                <rect x="27" y="5" width="1" height="90" fill="#222" />
                <rect x="31" y="5" width="3" height="90" fill="#222" />
              </svg>
            </div>
            {/* Col 4: Ticket No */}
            <div className="flex flex-col items-center justify-center gap-1 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 pl-1">
              <div>Ticket No:</div>
              <div className="text-base sm:text-lg font-mono tracking-widest">0123456789</div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Image */}
        <div className="relative h-48">
          <Image
            src={event.image || 'https://picsum.photos/400/300?random=event-card'}
            alt={event.title}
            fill
            className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStyleColor(event.style)}`}>
              {getStyleIcon(event.style)}
              <span className="ml-1">{t(`style.${event.style}`)}</span>
            </span>
            {occupancyRate > 80 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:text-red-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t('hot')}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={handleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white dark:bg-gray-800/80 text-gray-600 hover:bg-white dark:bg-gray-800 hover:text-red-500'
              }`}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full bg-white dark:bg-gray-800/80 text-gray-600 hover:bg-white dark:bg-gray-800 hover:text-blue-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              <PriceDisplay amount={minPrice} currency={currentCurrency} />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t('fromPrice')}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {event.short_description}
          </p>

          <div className="flex flex-col space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.venue.name}, {event.venue.city}
            </div>
            {nextPerformance && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(nextPerformance.date)} at {formatTime(event.start_time)}
              </div>
            )}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {availableCapacity} {t('availableSeats')}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {event.average_rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                ({event.review_count})
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {event.artists.slice(0, 2).map((artist, index) => (
                <span key={artist.id} className="text-xs bg-gray-100 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {artist.name}
                </span>
              ))}
              {event.artists.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{event.artists.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 