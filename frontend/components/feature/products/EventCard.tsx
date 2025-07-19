import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui';
import { Button } from '@/components/ui';
import { Product } from '@/lib/domain/entities/Product';

interface EventCardProps {
  event: Product;
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  onAddToCart?: (event: Product) => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  viewMode = 'grid',
  showActions = true,
  onAddToCart,
  className
}) => {
  const isRTL = typeof document !== 'undefined' ? document.dir === 'rtl' : false;
  const DEFAULT_IMAGE = '/images/default-event.jpg';

  // Validation: Check if event is valid
  if (!event || typeof event !== 'object') {
    console.error('EventCard: Invalid event data', event);
    return null;
  }

  const formatPrice = (price: any) => {
    if (!price || typeof price !== 'object') {
      return 'قیمت نامشخص';
    }
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: price.currency || 'USD'
    }).format(price.amount || 0);
  };

  const formatDate = (date: string) => {
    if (!date) return 'تاریخ نامشخص';
    try {
      return new Date(date).toLocaleDateString('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'تاریخ نامشخص';
    }
  };

  const formatTime = (time: string) => {
    if (!time) return 'ساعت نامشخص';
    try {
      return new Date(time).toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'ساعت نامشخص';
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(event);
    }
  };

  const mainImage = event.getMainImage();
  const imageUrl = mainImage?.url || DEFAULT_IMAGE;

  // Safe access to event properties
  const title = event.getTitle() || 'عنوان نامشخص';
  const description = event.getDescription() || '';
  const location = event.getLocation();
  const city = location?.city || 'شهر نامشخص';
  const country = location?.country || 'کشور نامشخص';
  const price = event.getPrice();
  const eventDate = event.getMetadata()?.eventDate;
  const capacity = event.getCapacity() || 0;
  const availableSpots = event.getAvailableSpots() || 0;
  const categoryName = event.getCategory()?.getName() || '';

  if (viewMode === 'list') {
    return (
      <Card variant="interactive" hover className={className}>
        <CardContent className="flex flex-row gap-4 p-4">
          {/* Image */}
          <div className="relative w-32 h-24 flex-shrink-0">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover rounded-lg"
            />
            {categoryName && (
              <div className="absolute top-1 right-1 bg-white/90 dark:bg-zinc-800/90 px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300">
                {categoryName}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {title}
            </h3>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
              <span>{city}, {country}</span>
              <span className="mx-1">•</span>
              <span>{formatDate(eventDate || '')}</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-apple-primary dark:text-apple-primary-dark">
                {price ? formatPrice(price) : 'قیمت متغیر'}
              </div>
              
              {showActions && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToCart}
                  >
                    افزودن به سبد
                  </Button>
                  <Link href={`/events/${event.getId()}`}>
                    <Button variant="primary" size="sm">
                      جزئیات
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card variant="interactive" hover className={className} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative w-full h-56 bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {categoryName && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-800/90 px-2 py-1 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300">
              {categoryName}
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {formatDate(eventDate || '')}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {title}
          </h3>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
            <span>{city}, {country}</span>
            <span className="mx-1">•</span>
            <span>{formatTime(eventDate || '')}</span>
          </div>
          
          <div className="text-base font-bold text-apple-primary dark:text-apple-primary-dark mb-3">
            {price ? formatPrice(price) : 'قیمت متغیر'}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {availableSpots} مکان باقی‌مانده از {capacity}
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-5 pt-0" justify="between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToCart}
            fullWidth
          >
            افزودن به سبد
          </Button>
          <Link href={`/events/${event.getId()}`} className="flex-1">
            <Button variant="primary" size="sm" fullWidth>
              جزئیات
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default EventCard; 