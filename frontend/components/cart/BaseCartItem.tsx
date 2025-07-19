'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trash2,
  Loader2,
  Plus,
  Minus
} from 'lucide-react';

// Define cart item interface based on our domain entities
interface CartItemData {
  id: string;
  productId?: string;
  productType?: string;
  quantity?: number;
  variantId?: string;
  date?: string;
  participants?: number;
  price?: number;
  currency?: string;
  title?: string;
  image?: string;
  location?: string;
  time?: string;
  variant_name?: string;
  // Add optional fields for different product types
  tour_id?: string;
  event_id?: string;
  transfer_id?: string;
  booking_data?: any;
  selected_options?: any[];
}

interface BaseCartItemProps {
  item: CartItemData;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (date: string) => string;
  children?: React.ReactNode;
  className?: string;
  showQuantityControls?: boolean;
  customIcon?: React.ReactNode;
  customHeader?: React.ReactNode;
  customDetails?: React.ReactNode;
  customFooter?: React.ReactNode;
}

export default function BaseCartItem({
  item,
  isUpdating,
  onQuantityChange,
  onRemove,
  formatPrice,
  formatDate,
  children,
  className = '',
  showQuantityControls = true,
  customIcon,
  customHeader,
  customDetails,
  customFooter
}: BaseCartItemProps) {
  const t = useTranslations('Cart');

  const handleQuantityChange = (change: number) => {
    const currentQuantity = item.quantity || 1;
    const newQuantity = Math.max(1, currentQuantity + change);
    onQuantityChange(item.id, newQuantity);
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  // Get booking date and time based on item type
  const getBookingDate = () => {
    return item.date;
  };

  const getBookingTime = () => {
    return item.time;
  };

  const bookingDate = getBookingDate();
  const bookingTime = getBookingTime();

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {customIcon || <Users className="h-5 w-5" />}
              <h3 className="text-lg font-semibold">{item.title}</h3>
            </div>
            
            {/* Basic Info */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-100">
              {bookingDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(bookingDate)}</span>
                </div>
              )}
              
              {bookingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{bookingTime}</span>
                </div>
              )}
              
              {item.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Remove Button */}
          <button
            onClick={handleRemove}
            disabled={isUpdating}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Image and Basic Details */}
        <div className="flex gap-4 mb-6">
          {/* Item Image */}
          {item.image && (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Item Details */}
          <div className="flex-1">
            {item.variant_name && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{t('variant')}:</span> {item.variant_name}
              </p>
            )}
            
            {/* Custom Details */}
            {customDetails}
          </div>
        </div>

        {/* Quantity Controls */}
        {showQuantityControls && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{t('quantity')}:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isUpdating || (item.quantity || 1) <= 1}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="mx-2 font-medium">{item.quantity || 1}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={isUpdating}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                {item.price && item.currency ? formatPrice(item.price, item.currency) : 'N/A'}
              </div>
              {item.quantity && item.quantity > 1 && item.price && (
                <div className="text-sm text-gray-500">
                  {formatPrice(item.price / item.quantity, item.currency || 'USD')} × {item.quantity}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Children Content */}
        {children}

        {/* Custom Footer */}
        {customFooter}
      </div>
    </div>
  );
} 