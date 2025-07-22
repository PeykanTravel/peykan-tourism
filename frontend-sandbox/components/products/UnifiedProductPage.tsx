'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCurrency } from '@/lib/stores/currencyStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock, 
  Info,
  Image as ImageIcon,
  Heart,
  Share2,
  ArrowRight
} from 'lucide-react';

interface Product {
  id: string;
  type: 'tour' | 'event' | 'transfer';
  title: string;
  description: string;
  short_description: string;
  price: number;
  currency: string;
  images: string[];
  location: string;
  duration?: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_popular?: boolean;
}

interface UnifiedProductPageProps {
  product: Product;
  onBookingStart: () => void;
}

export default function UnifiedProductPage({
  product,
  onBookingStart
}: UnifiedProductPageProps) {
  const t = useTranslations('product');
  const { currentCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('details');
  const [isFavorite, setIsFavorite] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' ' + currency;
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'tour': return <MapPin className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'transfer': return <ArrowRight className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getProductTypeText = (type: string) => {
    switch (type) {
      case 'tour': return t('tour');
      case 'event': return t('event');
      case 'transfer': return t('transfer');
      default: return t('product');
    }
  };

  const getProductTypeColor = (type: string) => {
    switch (type) {
      case 'tour': return 'text-blue-600 dark:text-blue-400';
      case 'event': return 'text-purple-600 dark:text-purple-400';
      case 'transfer': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProductTypeBadge = (type: string) => {
    switch (type) {
      case 'tour': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'event': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
      case 'transfer': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {product.images[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Product Badge */}
        <div className="absolute top-6 right-6">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProductTypeBadge(product.type)}`}>
            {getProductTypeText(product.type)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-6 left-6 flex space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-2">
              {getProductIcon(product.type)}
              <span className={`text-sm font-medium ${getProductTypeColor(product.type)}`}>
                {getProductTypeText(product.type)}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {product.title}
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              {product.short_description}
            </p>
            
            {/* Quick Info */}
            <div className="flex items-center space-x-6 text-white/80">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{product.location}</span>
              </div>
              {product.duration && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{product.duration}</span>
                </div>
              )}
              {product.rating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(product.rating)}
                  </div>
                  <span>({product.review_count} {t('reviews')})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <Card className="bg-white dark:bg-gray-800">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">{t('details')}</TabsTrigger>
                  <TabsTrigger value="booking">{t('booking')}</TabsTrigger>
                  <TabsTrigger value="reviews">{t('reviews')}</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-6">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('about')} {getProductTypeText(product.type)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                    
                    {/* Features */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {t('features')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-300">{product.location}</span>
                        </div>
                        {product.duration && (
                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-green-600" />
                            <span className="text-gray-600 dark:text-gray-300">{product.duration}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="text-gray-600 dark:text-gray-300">{t('groupSize')}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-orange-600" />
                          <span className="text-gray-600 dark:text-gray-300">{t('availability')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Booking Tab */}
                <TabsContent value="booking" className="p-6">
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {t('startBooking')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t('bookingDescription')}
                      </p>
                    </div>
                    <Button 
                      onClick={onBookingStart}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3"
                    >
                      {t('startBooking')}
                    </Button>
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="p-6">
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {t('reviews')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t('reviewsDescription')}
                      </p>
                    </div>
                    {product.rating && (
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        {renderStars(product.rating)}
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 sticky top-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('price')}
                </h3>
                
                <div className="mb-6">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.price, product.currency)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('perPerson')}
                  </div>
                </div>

                <Button 
                  onClick={onBookingStart}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3"
                >
                  {t('bookNow')}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('freeCancellation')}
                  </p>
                </div>

                {/* Quick Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('location')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{product.location}</span>
                  </div>
                  {product.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('duration')}:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{product.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('type')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getProductTypeText(product.type)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 