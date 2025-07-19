import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui';
import { Button } from '@/components/ui';
import { Product } from '@/lib/domain/entities/Product';

interface TourCardProps {
  tour: Product;
  viewMode?: 'grid' | 'list';
  showActions?: boolean;
  onAddToCart?: (tour: Product) => void;
  className?: string;
}

const TourCard: React.FC<TourCardProps> = ({
  tour,
  viewMode = 'grid',
  showActions = true,
  onAddToCart,
  className
}) => {
  const isRTL = typeof document !== 'undefined' ? document.dir === 'rtl' : false;
  const DEFAULT_IMAGE = '/images/default-tour.jpg';

  // Validation: Check if tour is valid
  if (!tour || typeof tour !== 'object') {
    console.error('TourCard: Invalid tour data', tour);
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

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(tour);
    }
  };

  const mainImage = tour.getMainImage();
  const imageUrl = mainImage?.url || DEFAULT_IMAGE;

  // Safe access to tour properties
  const title = tour.getTitle() || 'عنوان نامشخص';
  const description = tour.getDescription() || '';
  const location = tour.getLocation();
  const city = location?.city || 'شهر نامشخص';
  const country = location?.country || 'کشور نامشخص';
  const price = tour.getPrice();
  const duration = tour.getMetadata()?.duration || 0;

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
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
              {title}
            </h3>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
              <span>{city}, {country}</span>
              <span className="mx-1">•</span>
              <span>{duration} روز</span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-apple-primary dark:text-apple-primary-dark">
                {formatPrice(price)}
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
                  <Link href={`/tours/${tour.getId()}`}>
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
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {title}
          </h3>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
            <span>{city}, {country}</span>
            <span className="mx-1">•</span>
            <span>{duration} روز</span>
          </div>
          
          <div className="text-base font-bold text-apple-primary dark:text-apple-primary-dark mb-3">
            {formatPrice(price)}
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
          <Link href={`/tours/${tour.getId()}`} className="flex-1">
            <Button variant="primary" size="sm" fullWidth>
              جزئیات
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default TourCard; 