'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, Star, Users, Calendar } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface ProductCardProps {
  id: string;
  title: string;
  description?: string;
  image: string;
  price: number;
  currency: string;
  duration?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  maxParticipants?: number;
  date?: string;
  category: 'tour' | 'event' | 'transfer';
  slug: string;
  variant?: 'grid' | 'list';
  className?: string;
  onAddToCart?: () => void;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  description,
  image,
  price,
  currency,
  duration,
  location,
  rating,
  reviewCount,
  maxParticipants,
  date,
  category,
  slug,
  variant = 'grid',
  className = '',
  onAddToCart,
  isLoading = false,
}) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tour':
        return 'bg-blue-500';
      case 'event':
        return 'bg-purple-500';
      case 'transfer':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tour':
        return 'تور';
      case 'event':
        return 'رویداد';
      case 'transfer':
        return 'ترانسفر';
      default:
        return category;
    }
  };

  if (variant === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex">
          {/* Image */}
          <div className="w-48 h-32 flex-shrink-0">
            <OptimizedImage
              src={image}
              alt={title}
              fill
              className="object-cover rounded-l-lg"
              preset="medium"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs text-white rounded-full ${getCategoryColor(category)}`}>
                    {getCategoryLabel(category)}
                  </span>
                  {rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {rating.toFixed(1)} ({reviewCount})
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>
                
                {description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{duration}</span>
                    </div>
                  )}
                  {location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {maxParticipants && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>حداکثر {maxParticipants} نفر</span>
                    </div>
                  )}
                  {date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {formatPrice(price, currency)}
                </div>
                <Link
                  href={`/${category}s/${slug}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  مشاهده جزئیات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          preset="medium"
        />
        
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs text-white rounded-full ${getCategoryColor(category)}`}>
            {getCategoryLabel(category)}
          </span>
        </div>
        
        {/* Rating */}
        {rating && (
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {title}
        </h3>
        
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Details */}
        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{duration}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        
        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(price, currency)}
          </div>
          <Link
            href={`/${category}s/${slug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            مشاهده جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 