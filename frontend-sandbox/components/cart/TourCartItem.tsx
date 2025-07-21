'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, Users, User, Smile, Baby, MapPin, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import { TourCartItem as TourCartItemType } from '../../lib/hooks/useCart';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface TourCartItemProps {
  item: TourCartItemType;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onParticipantChange: (itemId: string, participantType: 'adult' | 'child' | 'infant', newCount: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

export default function TourCartItem({
  item,
  isUpdating,
  onQuantityChange,
  onParticipantChange,
  onRemove,
  formatPrice,
  formatDate
}: TourCartItemProps) {
  const t = useTranslations('Cart');

  const participants = item.participants;
  const totalParticipants = participants.adult + participants.child + participants.infant;

  return (
    <div className="p-6 border-b border-gray-200 last:border-b-0">
      <div className="flex gap-4">
        {/* Item Image */}
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
          {item.image ? (
            <OptimizedImage
              src={item.image || 'https://picsum.photos/80/80?random=cart-tour'}
              alt={item.title}
              width={80}
              height={80}
              className="w-full h-full rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1">
          {/* Title and Variant */}
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {item.title}
            </h3>
            {item.location && (
              <p className="text-sm text-gray-600">
                {t('location')}: {item.location}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(item.schedule_id)}
            </div>
            {item.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {item.duration}
              </div>
            )}
          </div>

          {/* Participant Breakdown */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {t('participants')} ({totalParticipants})
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">{t('adults')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onParticipantChange(item.id, 'adult', Math.max(0, participants.adult - 1))}
                    disabled={isUpdating || participants.adult <= 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title={t('decreaseAdults')}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {participants.adult}
                  </span>
                  <button
                    onClick={() => onParticipantChange(item.id, 'adult', participants.adult + 1)}
                    disabled={isUpdating}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title={t('increaseAdults')}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">{t('children')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onParticipantChange(item.id, 'child', Math.max(0, participants.child - 1))}
                    disabled={isUpdating || participants.child <= 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title={t('decreaseChildren')}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {participants.child}
                  </span>
                  <button
                    onClick={() => onParticipantChange(item.id, 'child', participants.child + 1)}
                    disabled={isUpdating}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title={t('increaseChildren')}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">{t('infants')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onParticipantChange(item.id, 'infant', Math.max(0, participants.infant - 1))}
                    disabled={isUpdating || participants.infant <= 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title={t('decreaseInfants')}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {participants.infant}
                  </span>
                  <button
                    onClick={() => onParticipantChange(item.id, 'infant', participants.infant + 1)}
                    disabled={isUpdating}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                    title={t('increaseInfants')}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Unit Price */}
              <div className="text-sm text-gray-600">
                {t('unitPrice')}: {formatPrice(item.unit_price, item.currency)}
              </div>
              
              {/* Total Price */}
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(item.subtotal, item.currency)}
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title={t('removeItem')}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{t('remove')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 