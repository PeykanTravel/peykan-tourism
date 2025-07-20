'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TourCartItem as TourCartItemType } from '../../lib/hooks/useCart';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Baby, 
  Smile,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';

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
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg"
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
                  <Baby className="w-4 h-4 text-pink-500" />
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

          {/* Selected Options */}
          {item.selected_options && item.selected_options.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t('options')} ({item.selected_options.length} {t('selected')})
              </h4>
              <div className="space-y-1">
                {item.selected_options.map((option: { option_id: string; quantity: number }) => (
                  <div key={option.option_id} className="flex items-center justify-between text-xs text-gray-500">
                    <span>Option {option.option_id}</span>
                    <span>Qty: {option.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <div>{t('perPerson')}: {formatPrice(item.unit_price, item.currency)}</div>
              {item.options_total > 0 && (
                <div>{t('options')}: {formatPrice(item.options_total, item.currency)}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(item.subtotal, item.currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 disabled:opacity-50"
            title={t('removeItem')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
} 