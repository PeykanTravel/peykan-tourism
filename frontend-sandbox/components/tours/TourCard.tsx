import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Clock, DollarSign, Star } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';
import { PriceDisplay } from '../ui/Price';

interface TourCardProps {
  tour: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    image_url: string;
    location?: string;
    price: string;
    currency: string;
    duration_hours: number;
    rating?: number;
    packages_count?: number;
    category?: string;
  };
  viewMode: 'grid' | 'list';
}

export default function TourCard({ tour, viewMode }: TourCardProps) {
  // Helper for price formatting (fallback)
  const formatPrice = (price: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(parseFloat(price));
  };

  // Helper for stars
  const renderStars = (rating: number = 0) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} viewBox="0 0 20 20"><polygon points="10,1 12.59,7.36 19.51,7.64 14,12.14 15.82,18.99 10,15.27 4.18,18.99 6,12.14 0.49,7.64 7.41,7.36" /></svg>
      ))}
    </div>
  );

  // --- LIST VIEW ---
  if (viewMode === 'list') {
    return (
      <Link href={`/tours/${tour.slug}`} className="block group">
        <div className="relative flex w-full max-w-2xl h-44 sm:h-48 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-800 overflow-hidden mx-auto">
          {/* Hover sweep effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-blue-200/40 to-transparent dark:via-blue-400/10 skew-x-12" />
          </div>
          {/* Image */}
          <div className="relative flex-[2] h-full">
            <OptimizedImage
              src={tour.image_url || 'https://picsum.photos/400/300?random=tour-card'}
              alt={tour.title}
              width={400}
              height={300}
              className="w-full h-full object-cover rounded-none"
            />
            {/* Hover overlay for description */}
            <div className="hidden group-hover:flex absolute inset-0 bg-black/80 dark:bg-gray-900/90 z-10 items-center justify-center p-4 transition-opacity duration-300">
              <p className="text-white text-base text-center leading-relaxed max-h-full overflow-y-auto">{tour.description}</p>
            </div>
          </div>
          {/* Content */}
          <div className="flex flex-col flex-[3] justify-center px-6 py-4 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="uppercase text-xs font-bold text-blue-400 tracking-widest line-clamp-1">{tour.location}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{tour.title}</h3>
            <div className="flex items-center gap-6 flex-wrap mb-2">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Users className="w-4 h-4" />
                <span>{tour.packages_count || 20} پکیج</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{tour.duration_hours} ساعت</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <DollarSign className="w-4 h-4" />
                <PriceDisplay amount={parseFloat(tour.price)} currency={tour.currency} />
              </div>
              {renderStars(tour.rating)}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // --- GRID VIEW ---
  return (
    <Link href={`/tours/${tour.slug}`} className="block group">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden w-full max-w-full aspect-[1.06] lg:w-[374px] lg:h-[353.22px] min-h-[220px]">
        {/* Hover sweep effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-blue-200/40 to-transparent dark:via-blue-400/10 skew-x-12" />
        </div>
        {/* Image with overlay */}
        <OptimizedImage
          src={tour.image_url || 'https://picsum.photos/374/353?random=tour-card-grid'}
          alt={tour.title}
          width={374}
          height={353}
          className="w-full h-full object-cover rounded-2xl"
        />
        {/* Hover overlay for description (modern, beautiful) */}
        <div className="hidden group-hover:flex absolute inset-0 bg-black/70 dark:bg-gray-900/80 backdrop-blur-sm z-10 items-center justify-center p-6 transition-opacity duration-300 animate-fade-in shadow-2xl">
          <p className="text-white text-lg font-semibold text-center leading-relaxed drop-shadow-lg max-h-full overflow-y-auto">
            {tour.description}
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80 dark:via-black/40"></div>
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-xl font-semibold tracking-normal mb-3 text-white drop-shadow-lg line-clamp-1">
            {tour.title}
          </h3>
          <div className="flex items-center gap-3 mb-3 text-base font-semibold text-white/90 drop-shadow">
            <MapPin className="w-5 h-5 text-blue-200" />
            <span className="line-clamp-1">{tour.location}</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium flex-wrap text-white/80">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-white/80" />
              <span>{tour.packages_count || 20} پکیج</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-white/80" />
              <PriceDisplay amount={parseFloat(tour.price)} currency={tour.currency} className="text-white/80" />
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-white/80" />
              <span>{tour.duration_hours} ساعت</span>
            </div>
            {renderStars(tour.rating)}
          </div>
        </div>
      </div>
    </Link>
  );
} 