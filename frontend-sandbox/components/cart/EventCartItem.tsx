'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { EventCartItem as EventCartItemType } from '../../lib/hooks/useCart';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Ticket,
  Trash2,
  Star,
  Info,
  Tag
} from 'lucide-react';

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
  const performanceId = item.booking_data?.performance_id || '';
  const ticketTypeId = item.booking_data?.ticket_type_id || '';

  // Debug: Log the data structure
  console.log('EventCartItem Debug:', {
    item,
    seats,
    section,
    variant,
    options,
    eventDate,
    eventTime,
    eventLocation,
    performanceId,
    ticketTypeId,
    seatsCount: seats.length
  });

  // Additional detailed debugging
  console.log('EventCartItem Raw Data:', {
    booking_data: item.booking_data,
    selected_options: item.selected_options,
    booking_data_seats: item.booking_data?.seats,
    booking_data_options: item.booking_data?.selected_options,
    item_keys: Object.keys(item),
    booking_data_keys: item.booking_data ? Object.keys(item.booking_data) : []
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Ticket className="w-6 h-6 text-yellow-300" />
              <h3 className="text-xl font-bold">{item.title}</h3>
              <div className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                <Star className="w-3 h-3" />
                Event
              </div>
            </div>
            
            {/* Event details */}
            <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
              {eventDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(eventDate)}
                </div>
              )}
              {eventTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {eventTime}
                </div>
              )}
              {eventLocation && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {eventLocation}
                </div>
              )}
            </div>
          </div>
          
          {/* Remove button */}
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white dark:bg-gray-800/10 disabled:opacity-50 transition-colors"
            title={t('removeItem')}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
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
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <h4 className="font-semibold text-gray-900 dark:text-white">{t('seats') || 'Seats'} ({seats.length})</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seats.map((seat: any, index: number) => (
                <div key={seat.seat_id || `seat-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-50 dark:bg-blue-900/200 rounded-full"></div>
                      <span className="font-mono text-sm font-semibold text-gray-800">
                        Row {seat.row_number}, Seat {seat.seat_number}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      {formatPrice(seat.price || item.price, item.currency)}
                    </span>
                  </div>
                  {seat.section && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Section: {seat.section}
                    </div>
                  )}
                  {seat.ticket_type && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Ticket: {seat.ticket_type}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        {options.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <Info className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold text-gray-800 text-sm">{t('options') || 'Options'}:</span>
            </div>
            <ul className="pl-6 space-y-0.5 text-sm text-gray-700 dark:text-gray-300">
              {options.map((opt: any, index: number) => (
                <li key={opt.option_id || `option-${index}`} className="flex items-center justify-between">
                  <span className="truncate">
                    {opt.name} <span className="text-gray-500 dark:text-gray-400">×{opt.quantity}</span>
                  </span>
                  <span className="font-medium text-green-600">
                    {formatPrice((opt.price || 0) * opt.quantity, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pricing Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Pricing Summary</h4>
          
          <div className="space-y-3">
            {/* Seats Subtotal */}
            {seats.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Seats ({seats.length}):</div>
                {seats.map((seat: any, index: number) => (
                  <div key={seat.seat_id || `seat-${index}`} className="flex justify-between text-sm pl-4">
                    <span className="text-gray-600 dark:text-gray-300">
                      Row {seat.row_number}, Seat {seat.seat_number}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(seat.price || item.price, item.currency)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-700 dark:text-gray-300">Seats Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(seats.reduce((sum: number, seat: any) => sum + (seat.price || item.price), 0), item.currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Options Subtotal */}
            {options.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</div>
                {options.map((opt: any, index: number) => (
                  <div key={opt.option_id || `option-${index}`} className="flex justify-between text-sm pl-4">
                    <span className="text-gray-600 dark:text-gray-300">
                      {opt.name} × {opt.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice((opt.price || 0) * opt.quantity, item.currency)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-700 dark:text-gray-300">Options Subtotal:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(options.reduce((sum: number, opt: any) => sum + ((opt.price || 0) * opt.quantity), 0), item.currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Discounts (if any) */}
            {(item.booking_data as any)?.discount_amount && (item.booking_data as any).discount_amount > 0 && (
              <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-gray-600 dark:text-gray-300">Discount:</span>
                <span className="text-red-600 font-medium">
                  -{formatPrice((item.booking_data as any).discount_amount, item.currency)}
                </span>
              </div>
            )}

            {/* Final Total */}
            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-blue-600">
                  {formatPrice(item.price * item.quantity, item.currency)}
                </span>
              </div>
              {item.quantity > 1 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                  ({item.quantity} items)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Tickets */}
      {seats.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 dark:bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Event Tickets</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {seats.map((seat: any, idx: number) => (
              <div
                key={seat.seat_id || `ticket-${idx}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-lg">{item.title}</h5>
                      <p className="text-blue-100 text-sm">Event Ticket</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-blue-100">Ticket No.</div>
                      <div className="font-mono text-sm">{seat.seat_id?.slice(0, 8) || '---'}</div>
                    </div>
                  </div>
                </div>

                {/* Ticket Body */}
                <div className="p-4">
                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    {eventDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{formatDate(eventDate)}</span>
                      </div>
                    )}
                    {eventTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{eventTime}</span>
                      </div>
                    )}
                    {eventLocation && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{eventLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Seat Information */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Section:</span>
                        <div className="font-semibold text-gray-900 dark:text-white">{section || 'General'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Row:</span>
                        <div className="font-semibold text-gray-900 dark:text-white">{seat.row_number}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Seat:</span>
                        <div className="font-semibold text-gray-900 dark:text-white">{seat.seat_number}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Price:</span>
                        <div className="font-semibold text-green-600">{formatPrice(seat.price || item.price, item.currency)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-32 flex items-center justify-between mb-2">
                        {Array.from({ length: 20 }, (_, i) => (
                          <div 
                            key={`barcode-${seat.seat_id || idx}-${i}`} 
                            className={`h-full ${i % 3 === 0 ? 'w-1 bg-gray-800' : 'w-0.5 bg-gray-400'} rounded`} 
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{seat.seat_id?.slice(0, 12) || 'TICKET-123456'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 