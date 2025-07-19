'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { EventCartItem as EventCartItemType } from '../../lib/hooks/useCart';
import { 
  Ticket,
  Star,
  Info,
  Tag,
  MapPin,
  Users,
  Trash2,
  Plus,
  Minus,
  Clock,
  Calendar
} from 'lucide-react';
import BaseCartItem from './BaseCartItem';

interface EventCartItemProps {
  item: EventCartItemType;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

export default function EventCartItem({
  item,
  isUpdating,
  onQuantityChange,
  onRemove,
  formatPrice,
  formatDate
}: EventCartItemProps) {
  const t = useTranslations('Cart');

  // Extract data directly from API response
  const seats = Array.isArray(item.booking_data?.seats)
    ? item.booking_data.seats.map((seat: any) => ({
        ...seat,
        price: typeof seat.price === 'string' ? parseFloat(seat.price) : seat.price,
      }))
    : [];

  const section = item.booking_data?.section || '';
  const variant = item.variant_name || '';
  const options = Array.isArray(item.booking_data?.selected_options)
    ? item.booking_data.selected_options
    : [];

  // Extract additional event details
  const eventDate = item.booking_data?.performance_date || item.date || '';
  const eventTime = item.booking_data?.performance_time || item.time || '';
  const eventLocation = item.booking_data?.venue_name || item.location || '';

  // Custom details section for event-specific information
  const customDetails = (
    <div className="space-y-3">
      {/* Event Date and Time */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        {eventDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(eventDate)}</span>
          </div>
        )}
        {eventTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{eventTime}</span>
          </div>
        )}
      </div>

      {/* Event Venue */}
      {eventLocation && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{eventLocation}</span>
        </div>
      )}

      {/* Section and Variant badges */}
      <div className="flex flex-wrap gap-2">
        {variant && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
            <Tag className="w-3 h-3 inline mr-1" />
            {variant}
          </span>
        )}
        {section && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
            <MapPin className="w-3 h-3 inline mr-1" />
            Section: {section}
          </span>
        )}
      </div>

      {/* Seats Information */}
      {seats.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">{t('seats') || 'Seats'} ({seats.length})</h4>
          </div>
          <div className="space-y-2">
            {seats.map((seat: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {seat.row ? `Row ${seat.row}` : ''} {seat.seat ? `Seat ${seat.seat}` : ''}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(seat.price, item.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Options */}
      {options.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">{t('selected_options') || 'Selected Options'}</h4>
          </div>
          <div className="space-y-2">
            {options.map((option: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm font-medium">{option.name}</span>
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
      customIcon={<Ticket className="h-5 w-5 text-blue-600" />}
    />
  );
} 