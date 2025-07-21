'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, Users, MapPin, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { CartItem } from '../../lib/contexts/UnifiedCartContext';
import Image from 'next/image';

interface ImprovedCartItemProps {
  item: CartItem;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onParticipantChange?: (itemId: string, participantType: 'adult' | 'child' | 'infant', newCount: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

export default function ImprovedCartItem({
  item,
  isUpdating,
  onQuantityChange,
  onParticipantChange,
  onRemove,
  formatPrice,
  formatDate
}: ImprovedCartItemProps) {
  const t = useTranslations('Cart');

  const getParticipantsCount = () => {
    if (item.booking_data.participants) {
      const { adult, child, infant } = item.booking_data.participants;
      return adult + child + infant;
    }
    return item.quantity;
  };

  const renderProductSpecificInfo = () => {
    switch (item.product_type) {
      case 'tour':
        return (
          <div className="space-y-2">
            {item.booking_data.participants && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {t('participants')}: {item.booking_data.participants.adult} {t('adults')}, 
                  {item.booking_data.participants.child} {t('children')}, 
                  {item.booking_data.participants.infant} {t('infants')}
                </span>
              </div>
            )}
            {item.booking_data.schedule_id && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(item.booking_date)}</span>
              </div>
            )}
            {item.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{item.duration}</span>
              </div>
            )}
          </div>
        );
      
      case 'event':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(item.booking_date)}</span>
            </div>
            {item.booking_time && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{item.booking_time}</span>
              </div>
            )}
          </div>
        );
      
      case 'transfer':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            {(item.booking_data as any).contact_name && (
              <div className="text-sm text-gray-600">
                {t('contact')}: {(item.booking_data as any).contact_name}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderParticipantControls = () => {
    if (item.product_type === 'tour' && item.booking_data.participants && onParticipantChange) {
      const { adult, child, infant } = item.booking_data.participants;
      
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('adults')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onParticipantChange(item.id, 'adult', Math.max(0, adult - 1))}
                disabled={isUpdating || adult <= 0}
                className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center">{adult}</span>
              <button
                onClick={() => onParticipantChange(item.id, 'adult', adult + 1)}
                disabled={isUpdating}
                className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('children')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onParticipantChange(item.id, 'child', Math.max(0, child - 1))}
                disabled={isUpdating || child <= 0}
                className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center">{child}</span>
              <button
                onClick={() => onParticipantChange(item.id, 'child', child + 1)}
                disabled={isUpdating}
                className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('infants')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onParticipantChange(item.id, 'infant', Math.max(0, infant - 1))}
                disabled={isUpdating || infant <= 0}
                className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center">{infant}</span>
              <button
                onClick={() => onParticipantChange(item.id, 'infant', infant + 1)}
                disabled={isUpdating}
                className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
          disabled={isUpdating || item.quantity <= 1}
          className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          disabled={isUpdating}
          className="p-1 rounded border hover:bg-gray-50 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 border-b border-gray-200 last:border-b-0">
      <div className="flex gap-4">
        {/* Item Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
          {item.image ? (
            <Image
              src={item.image || 'https://picsum.photos/80/80?random=cart-item'}
              alt={item.title || 'Product'}
              width={80}
              height={80}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1">
          {/* Title and Type */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {item.title || `${item.product_type} Product`}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {item.product_type}
              </span>
              {item.variant_name && (
                <span className="text-gray-500">- {item.variant_name}</span>
              )}
            </div>
          </div>

          {/* Product Specific Information */}
          {renderProductSpecificInfo()}

          {/* Price Information */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('unitPrice')}</span>
              <span className="font-medium">
                {formatPrice(item.unit_price, item.currency)}
              </span>
            </div>
            {item.options_total > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('options')}</span>
                <span className="font-medium">
                  {formatPrice(item.options_total, item.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span>{t('total')}</span>
              <span>{formatPrice(item.total_price, item.currency)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {renderParticipantControls()}
            </div>
            
            <button
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {t('remove')}
            </button>
          </div>

          {/* Loading State */}
          {isUpdating && (
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('updating')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 