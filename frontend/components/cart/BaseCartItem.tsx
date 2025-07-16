'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CartItem } from '../../lib/contexts/UnifiedCartContext';
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

interface BaseCartItemProps {
  item: CartItem;
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
    const newQuantity = Math.max(1, item.quantity + change);
    onQuantityChange(item.id, newQuantity);
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        {customHeader || (
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {customIcon || <Users className="h-5 w-5" />}
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              
              {/* Basic Info */}
              <div className="flex flex-wrap gap-4 text-sm text-blue-100">
                {item.booking_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(item.booking_date)}</span>
                  </div>
                )}
                
                {item.booking_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{item.booking_time}</span>
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
        )}
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
            
            {(item as any).description && (
              <p className="text-sm text-gray-700 mb-2">{(item as any).description}</p>
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
                  disabled={isUpdating || item.quantity <= 1}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="mx-2 font-medium">{item.quantity}</span>
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
                {formatPrice(item.total_price, item.currency)}
              </div>
              {item.quantity > 1 && (
                <div className="text-sm text-gray-500">
                  {formatPrice(item.unit_price, item.currency)} × {item.quantity}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Children Content */}
        {children}
        
        {/* Special Requests */}
        {item.booking_data?.special_requests && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-1">{t('specialRequests')}:</h4>
            <p className="text-sm text-gray-600">{item.booking_data.special_requests}</p>
          </div>
        )}
        
        {/* Custom Footer */}
        {customFooter}
      </div>
    </div>
  );
} 