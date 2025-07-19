import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Users, Car, DollarSign } from 'lucide-react';
import { useCurrency } from '../../lib/currency-context';

interface TransferCardProps {
  transfer: {
    id: string;
    slug: string;
    title: string;
    description?: string;
    image_url: string;
    origin?: string;
    destination?: string;
    price: string;
    currency: string;
    duration_minutes: number;
    vehicle_type?: string;
    max_passengers?: number;
    packages_count?: number;
    category?: string;
  };
  viewMode: 'grid' | 'list';
}

export default function TransferCard({ transfer, viewMode }: TransferCardProps) {
  const { formatPrice, convertCurrency, currency: userCurrency } = useCurrency();
  
  // Helper for price formatting with currency conversion
  const formatPriceWithConversion = (price: string, originalCurrency: string) => {
    const convertedPrice = convertCurrency(parseFloat(price), originalCurrency as any, userCurrency);
    return formatPrice(convertedPrice, userCurrency);
  };

  // Helper for duration
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/transfers/${transfer.slug}`} className="block group">
        <div className="flex bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Image */}
          <div className="w-56 h-40 flex-shrink-0 relative">
            <img
              src={transfer.image_url}
              alt={transfer.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="uppercase text-xs font-bold text-blue-400 tracking-widest">
                  {transfer.origin} → {transfer.destination}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{transfer.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{transfer.description}</p>
            </div>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Car className="w-4 h-4" />
                <span>{transfer.vehicle_type || 'Sedan'}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Users className="w-4 h-4" />
                <span>{transfer.max_passengers || 4} نفر</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(transfer.duration_minutes)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>{formatPriceWithConversion(transfer.price, transfer.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View
  return (
    <Link href={`/transfers/${transfer.slug}`} className="block group">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden">
        {/* Image with overlay */}
        <img
          src={transfer.image_url}
          alt={transfer.title}
          className="w-full h-56 object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80 dark:via-black/40"></div>
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-lg font-bold mb-2 drop-shadow-lg">{transfer.title}</h3>
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-4 h-4 text-blue-300" />
            <span className="text-sm">{transfer.origin} → {transfer.destination}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4 text-white/80" />
              <span>{transfer.vehicle_type || 'Sedan'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-white/80" />
              <span>{transfer.max_passengers || 4} نفر</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-white/80" />
              <span>{formatDuration(transfer.duration_minutes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-white/80" />
              <span>{formatPriceWithConversion(transfer.price, transfer.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 