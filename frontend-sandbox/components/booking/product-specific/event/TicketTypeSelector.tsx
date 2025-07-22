'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Ticket, Star, Crown, Users, Info } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  benefits: string[];
  is_premium: boolean;
  is_vip: boolean;
  max_quantity?: number;
  available_quantity?: number;
}

interface TicketTypeSelectorProps {
  ticketTypes: TicketType[];
  selectedTicketType: TicketType | null;
  onTicketTypeSelect: (ticketType: TicketType) => void;
  currency: string;
}

export default function TicketTypeSelector({
  ticketTypes,
  selectedTicketType,
  onTicketTypeSelect,
  currency
}: TicketTypeSelectorProps) {
  const t = useTranslations('eventDetail');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  const getTicketIcon = (ticketType: TicketType) => {
    if (ticketType.is_vip) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (ticketType.is_premium) return <Star className="w-5 h-5 text-blue-500" />;
    return <Ticket className="w-5 h-5 text-gray-500" />;
  };

  const getTicketBadge = (ticketType: TicketType) => {
    if (ticketType.is_vip) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          VIP
        </span>
      );
    }
    if (ticketType.is_premium) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          Premium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
        Regular
      </span>
    );
  };

  const isAvailable = (ticketType: TicketType) => {
    if (ticketType.available_quantity !== undefined) {
      return ticketType.available_quantity > 0;
    }
    return true;
  };

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Ticket className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('noTicketTypesAvailable')}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {t('checkBackLater')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Ticket className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('selectTicketType')}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ticketTypes.map((ticketType) => {
          const isSelected = selectedTicketType?.id === ticketType.id;
          const available = isAvailable(ticketType);

          return (
            <div
              key={ticketType.id}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : available
                    ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => available && onTicketTypeSelect(ticketType)}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                {getTicketIcon(ticketType)}
                {getTicketBadge(ticketType)}
              </div>

              {/* Title */}
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {ticketType.name}
              </h4>

              {/* Price */}
              <div className="mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatPrice(ticketType.price)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  {currency}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {ticketType.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  {t('benefits')}:
                </h5>
                <ul className="space-y-1">
                  {ticketType.benefits.map((benefit, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <div className="w-1 h-1 bg-green-500 rounded-full mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Availability */}
              {ticketType.available_quantity !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('available')}:
                    </span>
                    <span className={`font-medium ${
                      ticketType.available_quantity > 10 
                        ? 'text-green-600 dark:text-green-400'
                        : ticketType.available_quantity > 0
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}>
                      {ticketType.available_quantity} {t('tickets')}
                    </span>
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              )}

              {/* Sold Out Overlay */}
              {!available && (
                <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-white font-medium">
                    {t('soldOut')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedTicketType && (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100">
                {t('selectedTicketType')}:
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-200">
                {selectedTicketType.name} - {formatPrice(selectedTicketType.price)} {currency}
              </p>
            </div>
            {getTicketIcon(selectedTicketType)}
          </div>
        </div>
      )}
    </div>
  );
} 