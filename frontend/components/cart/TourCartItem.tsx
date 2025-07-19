'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TourCartItem as TourCartItemType } from '../../lib/hooks/useCart';
import { 
  MapPin,
  User,
  Smile,
  Baby,
  Clock,
  Calendar,
  Users,
  Plus,
  Minus,
  Compass,
  Star,
  Info
} from 'lucide-react';
import BaseCartItem from './BaseCartItem';

interface TourCartItemProps {
  item: TourCartItemType;
  isUpdating: boolean;
  onParticipantChange: (itemId: string, type: 'adult' | 'child' | 'infant', count: number) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

export default function TourCartItem({
  item,
  isUpdating,
  onParticipantChange,
  onQuantityChange,
  onRemove,
  formatPrice,
  formatDate
}: TourCartItemProps) {
  const t = useTranslations('Cart');

  const participantTypes = [
    { key: 'adult', label: t('adult'), icon: User },
    { key: 'child', label: t('child'), icon: Smile },
    { key: 'infant', label: t('infant'), icon: Baby }
  ];

  const handleParticipantChange = (type: 'adult' | 'child' | 'infant', change: number) => {
    const currentCount = item.booking_data?.participants?.[type] || 0;
    const newCount = Math.max(0, currentCount + change);
    onParticipantChange(item.id, type, newCount);
  };

  const totalParticipants = item.booking_data?.participants ? 
    item.booking_data.participants.adult + item.booking_data.participants.child + item.booking_data.participants.infant : 
    0;

  // Custom details section for tour-specific information
  const customDetails = (
    <div className="space-y-3">
      {/* Tour Duration */}
      {(item.booking_data as any).duration && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{t('duration')}: {(item.booking_data as any).duration}</span>
        </div>
      )}

      {/* Tour Location */}
      {item.location && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{item.location}</span>
        </div>
      )}

      {/* Tour Date */}
      {item.date && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(item.date)}</span>
        </div>
      )}

      {/* Participants */}
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-green-600" />
          <h4 className="font-semibold text-green-900">{t('participants')} ({totalParticipants})</h4>
        </div>
        <div className="space-y-3">
          {participantTypes.map((type) => {
            const participants = item.booking_data?.participants;
            const count = participants?.[type.key as keyof typeof participants] || 0;
            return (
              <div key={type.key} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <type.icon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleParticipantChange(type.key as 'adult' | 'child' | 'infant', -1)}
                    disabled={isUpdating || count <= 0}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-8 text-center">{count}</span>
                  <button
                    onClick={() => handleParticipantChange(type.key as 'adult' | 'child' | 'infant', 1)}
                    disabled={isUpdating}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Options */}
      {item.selected_options && item.selected_options.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">{t('selected_options') || 'Selected Options'}</h4>
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
      customIcon={<Compass className="h-5 w-5 text-green-600" />}
    />
  );
} 