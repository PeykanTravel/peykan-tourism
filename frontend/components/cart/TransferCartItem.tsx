'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TransferCartItem as TransferCartItemType } from '../../lib/hooks/useCart';
import { 
  Car,
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Wifi,
  Snowflake,
  Coffee,
  Music,
  Phone,
  Zap,
  Bus,
  Timer,
  Settings,
  MessageSquare,
  Info,
  Star
} from 'lucide-react';
import BaseCartItem from './BaseCartItem';

interface TransferCartItemProps {
  item: TransferCartItemType;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

export default function TransferCartItem({
  item,
  isUpdating,
  onQuantityChange,
  onRemove,
  formatPrice,
  formatDate
}: TransferCartItemProps) {
  const t = useTranslations('Cart');

  // Get amenities icons
  const amenityIcons: { [key: string]: any } = {
    wifi: Wifi,
    ac: Snowflake,
    coffee: Coffee,
    music: Music,
    phone: Phone,
    charging: Zap,
    gps: MapPin,
    driver: User
  };

  // Custom details section for transfer-specific information
  const customDetails = (
    <div className="space-y-3">
      {/* Transfer Route */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">{t('route')}</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{t('from')}: {item.pickup_location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">{t('to')}: {item.destination}</span>
          </div>
        </div>
      </div>

      {/* Transfer Date & Time */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {item.date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(item.date)}</span>
          </div>
        )}
        {item.time && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{item.time}</span>
          </div>
        )}
      </div>

      {/* Vehicle Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Car className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">{t('vehicle')}</h4>
        </div>
        <div className="space-y-2">
          {item.vehicle_type && (
            <div className="flex items-center gap-2 text-sm">
              <Bus className="h-4 w-4 text-gray-500" />
              <span>{item.vehicle_type}</span>
            </div>
          )}
          {item.capacity && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{t('capacity')}: {item.capacity} {t('passengers')}</span>
            </div>
          )}
          {item.duration && (
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-gray-500" />
              <span>{t('duration')}: {item.duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Amenities */}
      {item.amenities && item.amenities.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">{t('amenities')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {item.amenities.map((amenity, index) => {
              const IconComponent = amenityIcons[amenity.toLowerCase()] || Star;
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <IconComponent className="h-4 w-4 text-green-600" />
                  <span>{amenity}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Options */}
      {item.selected_options && item.selected_options.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">{t('selected_options')}</h4>
          </div>
          <div className="space-y-2">
            {item.selected_options.map((option, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm font-medium">{(option as any).name || `Option ${option.option_id}`}</span>
                <span className="text-sm font-semibold text-blue-900">
                  {option.price ? formatPrice(option.price, item.currency) : t('included')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <BaseCartItem
      item={item}
      isUpdating={isUpdating}
      onQuantityChange={onQuantityChange}
      onRemove={onRemove}
      formatPrice={formatPrice}
      formatDate={formatDate}
      customDetails={customDetails}
      customIcon={<Car className="h-5 w-5 text-blue-600" />}
    />
  );
} 