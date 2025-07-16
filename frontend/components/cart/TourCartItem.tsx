'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TourCartItem as TourCartItemType } from '../../lib/hooks/useCart';
import { 
  User, 
  Baby, 
  Smile,
  Plus,
  Minus,
  MapPin
} from 'lucide-react';
import BaseCartItem from './BaseCartItem';

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

<<<<<<< Updated upstream
  const participants = item.participants;
  const totalParticipants = participants.adult + participants.child + participants.infant;
=======
  const participantTypes = [
    { key: 'adult', label: t('adult'), icon: User },
    { key: 'child', label: t('child'), icon: Smile },
    { key: 'infant', label: t('infant'), icon: Baby }
  ];

  const handleParticipantChange = (type: 'adult' | 'child' | 'infant', change: number) => {
    const currentCount = item.booking_data.participants?.[type] || 0;
    const newCount = Math.max(0, currentCount + change);
    onParticipantChange(item.id, type, newCount);
  };

  const totalParticipants = item.booking_data.participants ? 
    item.booking_data.participants.adult + item.booking_data.participants.child + item.booking_data.participants.infant : 
    0;
>>>>>>> Stashed changes

  // Custom details section for tour-specific information
  const customDetails = (
    <div className="space-y-3">
      {/* Tour Duration */}
      {(item.booking_data as any).duration && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{t('duration')}:</span> {(item.booking_data as any).duration}
        </div>
      )}

<<<<<<< Updated upstream
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
=======
      {/* Participants Breakdown */}
      {item.booking_data.participants && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('participants')}:</h4>
          <div className="grid grid-cols-1 gap-2">
            {participantTypes.map(({ key, label, icon: Icon }) => {
              const count = item.booking_data.participants?.[key as keyof typeof item.booking_data.participants] || 0;
              return (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleParticipantChange(key as 'adult' | 'child' | 'infant', -1)}
                      disabled={isUpdating || count <= 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="mx-2 text-sm font-medium">{count}</span>
                    <button
                      onClick={() => handleParticipantChange(key as 'adult' | 'child' | 'infant', 1)}
                      disabled={isUpdating}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-gray-500 text-right">
            {t('totalParticipants')}: {totalParticipants}
>>>>>>> Stashed changes
          </div>
        </div>
      )}

      {/* Selected Options */}
      {item.selected_options && item.selected_options.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('selectedOptions')}:</h4>
          <div className="space-y-1">
            {item.selected_options.map((option, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-sm">{(option as any).name || `Option ${option.option_id}`}</span>
                <span className="text-sm font-medium text-blue-600">
                  {option.price && option.price > 0 ? `+${formatPrice(option.price, item.currency)}` : t('free')}
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
      customIcon={<MapPin className="h-5 w-5" />}
      customDetails={customDetails}
      showQuantityControls={false} // Tour uses participant-based controls
    />
  );
} 