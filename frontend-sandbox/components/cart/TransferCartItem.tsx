'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TransferCartItem as TransferCartItemType } from '../../lib/hooks/useCart';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Car,
  ArrowRight,
  Trash2,
  Percent,
  CreditCard,
  Star,
  Shield,
  Wifi,
  Snowflake,
  Coffee,
  Music,
  Phone,
  Zap
} from 'lucide-react';

interface TransferCartItemProps {
  item: TransferCartItemType;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number, currency: string) => string;
  formatDate: (dateString: string) => string;
}

export default function TransferCartItem({
  item,
  isUpdating,
  onQuantityChange,
  onRemove,
  formatPrice,
  formatDate
}: TransferCartItemProps) {
  const t = useTranslations('Cart');

  // Extract route info from route_data
  const origin = item.route_data.origin || 'Unknown';
  const destination = item.route_data.destination || 'Unknown';

  // Get time information for surcharges
  const getTimeInfo = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour <= 9) return { category: 'Peak Hour', surcharge: '15' };
    if (hour >= 17 && hour <= 19) return { category: 'Peak Hour', surcharge: '15' };
    if (hour >= 22 || hour <= 6) return { category: 'Midnight', surcharge: '25' };
    return { category: 'Standard', surcharge: '0' };
  };

  const outboundTimeInfo = getTimeInfo(new Date(item.outbound_datetime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }));
  const returnTimeInfo = item.return_datetime ? getTimeInfo(new Date(item.return_datetime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })) : null;

  // Get option details from backend data
  const getOptionDetails = (optionId: string) => {
    // Find option in selected_options array from backend
    const option = item.selected_options.find(opt => opt.option_id === optionId);
    if (option) {
      return {
        name: option.name || `Option ${optionId.slice(0, 8)}...`,
        description: option.description || '',
        price: option.price || 0
      };
    }
    // Fallback for legacy data
    return { name: `Option ${optionId.slice(0, 8)}...`, description: '', price: 0 };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {origin} <ArrowRight className="inline w-4 h-4 mx-2" /> {destination}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('transferService')} • {item.vehicle_type}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 dark:bg-red-900/20 disabled:opacity-50"
          title={t('removeItem')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Route & Trip Details */}
        <div className="space-y-4">
          {/* Route Information */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('routeInformation')}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {origin} → {destination}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {item.pricing_breakdown ? formatPrice(item.pricing_breakdown.base_price, item.currency) : formatPrice(item.price, item.currency)} {t('basePrice')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('tripType')}: {item.trip_type === 'one_way' ? t('oneWay') : t('roundTrip')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(item.outbound_datetime)} at {new Date(item.outbound_datetime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {item.return_datetime && (
                      <span> • {t('return')}: {formatDate(item.return_datetime)} at {new Date(item.return_datetime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {t('passengers')}: {item.passenger_count} • {t('luggage')}: {item.luggage_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t('vehicle')}: {item.vehicle_type}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Information with Surcharges */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('timeInfo')}</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300">{t('outboundTime')}: {new Date(item.outbound_datetime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} ({outboundTimeInfo.category})</span>
                </div>
                {parseFloat(outboundTimeInfo.surcharge) > 0 && (
                  <span className="text-orange-600 text-xs font-medium">+{outboundTimeInfo.surcharge}%</span>
                )}
              </div>
              {returnTimeInfo && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600 dark:text-gray-300">{t('returnTime')}: {new Date(item.return_datetime!).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} ({returnTimeInfo.category})</span>
                  </div>
                  {parseFloat(returnTimeInfo.surcharge) > 0 && (
                    <span className="text-orange-600 text-xs font-medium">+{returnTimeInfo.surcharge}%</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {(item.pickup_address || item.dropoff_address || item.contact_name || item.contact_phone) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('contactInformation')}</h4>
              <div className="space-y-2 text-sm">
                {item.pickup_address && (
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('pickupAddress')}:</span>
                    <div className="text-gray-600 dark:text-gray-300">{item.pickup_address}</div>
                  </div>
                )}
                {item.dropoff_address && (
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('dropoffAddress')}:</span>
                    <div className="text-gray-600 dark:text-gray-300">{item.dropoff_address}</div>
                  </div>
                )}
                {item.contact_name && (
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('contactName')}:</span>
                    <div className="text-gray-600 dark:text-gray-300">{item.contact_name}</div>
                  </div>
                )}
                {item.contact_phone && (
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{t('contactPhone')}:</span>
                    <div className="text-gray-600 dark:text-gray-300">{item.contact_phone}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Options & Pricing */}
        <div className="space-y-4">
          {/* Selected Options */}
          {item.selected_options && item.selected_options.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('selectedOptions')} ({item.selected_options.length})
              </h4>
              <div className="space-y-2">
                {item.selected_options.map((option) => {
                  const optionDetails = getOptionDetails(option.option_id);
                  return (
                    <div key={option.option_id} className="flex justify-between items-center py-2 border-b border-green-100 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {optionDetails.name}
                        </span>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {optionDetails.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(optionDetails.price * option.quantity, item.currency)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {option.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          {item.pricing_breakdown && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('pricingBreakdown')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 dark:text-gray-300">{t('basePrice')}</span>
                  <span className="font-medium">{formatPrice(item.pricing_breakdown.base_price, item.currency)}</span>
                </div>
                
                {item.pricing_breakdown.time_surcharge > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-300">{t('timeSurcharge')}</span>
                    <span className="font-medium text-orange-600">+{formatPrice(item.pricing_breakdown.time_surcharge, item.currency)}</span>
                  </div>
                )}
                
                {item.pricing_breakdown.round_trip_discount > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-300">{t('roundTripDiscount')}</span>
                    <span className="font-medium text-green-600">-{formatPrice(item.pricing_breakdown.round_trip_discount, item.currency)}</span>
                  </div>
                )}
                
                {item.pricing_breakdown.options_total > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-300">{t('optionsTotal')}</span>
                    <span className="font-medium">{formatPrice(item.pricing_breakdown.options_total, item.currency)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{t('finalPrice')}</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(item.pricing_breakdown.final_price, item.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Features */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('vehicleFeatures')}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Wifi className="w-4 h-4 text-purple-600" />
                <span>WiFi</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Snowflake className="w-4 h-4 text-purple-600" />
                <span>AC</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Insurance</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Star className="w-4 h-4 text-purple-600" />
                <span>Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 