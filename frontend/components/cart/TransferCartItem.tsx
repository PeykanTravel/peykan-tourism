'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TransferCartItem as TransferCartItemType } from '../../lib/hooks/useCart';
import { 
  Car,
  ArrowRight,
  Shield,
  Wifi,
  Snowflake,
  Coffee,
  Music,
  Phone,
<<<<<<< Updated upstream
  Zap
=======
  Zap,
  Bus,
  Timer,
  Settings,
  MessageSquare,
  MapPin,
  Users
>>>>>>> Stashed changes
} from 'lucide-react';
import BaseCartItem from './BaseCartItem';

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

<<<<<<< Updated upstream
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {origin} <ArrowRight className="inline w-4 h-4 mx-2" /> {destination}
            </h3>
            <p className="text-sm text-gray-600">
              {t('transferService')} • {item.vehicle_type}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 disabled:opacity-50"
          title={t('removeItem')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Route & Trip Details */}
        <div className="space-y-4">
          {/* Route Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('routeInformation')}</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {origin} → {destination}
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.pricing_breakdown ? formatPrice(item.pricing_breakdown.base_price, item.currency) : formatPrice(item.price, item.currency)} {t('basePrice')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {t('tripType')}: {item.trip_type === 'one_way' ? t('oneWay') : t('roundTrip')}
                  </div>
                  <div className="text-sm text-gray-600">
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
                  <div className="font-medium text-gray-900">
                    {t('passengers')}: {item.passenger_count} • {t('luggage')}: {item.luggage_count}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t('vehicle')}: {item.vehicle_type}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Information with Surcharges */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('timeInfo')}</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">{t('outboundTime')}: {new Date(item.outbound_datetime).toLocaleTimeString([], { 
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
                    <span className="text-gray-600">{t('returnTime')}: {new Date(item.return_datetime!).toLocaleTimeString([], { 
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
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('contactInformation')}</h4>
              <div className="space-y-2 text-sm">
                {item.pickup_address && (
                  <div>
                    <span className="font-medium text-gray-900">{t('pickupAddress')}:</span>
                    <div className="text-gray-600">{item.pickup_address}</div>
                  </div>
                )}
                {item.dropoff_address && (
                  <div>
                    <span className="font-medium text-gray-900">{t('dropoffAddress')}:</span>
                    <div className="text-gray-600">{item.dropoff_address}</div>
                  </div>
                )}
                {item.contact_name && (
                  <div>
                    <span className="font-medium text-gray-900">{t('contactName')}:</span>
                    <div className="text-gray-600">{item.contact_name}</div>
                  </div>
                )}
                {item.contact_phone && (
                  <div>
                    <span className="font-medium text-gray-900">{t('contactPhone')}:</span>
                    <div className="text-gray-600">{item.contact_phone}</div>
                  </div>
                )}
              </div>
            </div>
          )}
=======
  // Vehicle features mapping
  const featureIcons = {
    wifi: Wifi,
    air_conditioning: Snowflake,
    refreshments: Coffee,
    music: Music,
    phone_charger: Phone,
    gps: Zap,
    professional_driver: Shield,
    extra_luggage: Settings,
    child_seats: Users,
    meet_and_greet: MessageSquare
  };

  // Custom details section for transfer-specific information
  const customDetails = (
    <div className="space-y-3">
      {/* Route Information */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {(item as any).origin || t('pickupLocation')}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-blue-600" />
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {(item as any).destination || t('dropoffLocation')}
            </span>
          </div>
>>>>>>> Stashed changes
        </div>
      </div>

<<<<<<< Updated upstream
        {/* Right Column - Options & Pricing */}
        <div className="space-y-4">
          {/* Selected Options */}
          {item.selected_options && item.selected_options.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t('selectedOptions')} ({item.selected_options.length})
              </h4>
              <div className="space-y-2">
                {item.selected_options.map((option) => {
                  const optionDetails = getOptionDetails(option.option_id);
                  return (
                    <div key={option.option_id} className="flex justify-between items-center py-2 border-b border-green-100 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-900">
                          {optionDetails.name}
                        </span>
                        <div className="text-xs text-gray-600">
                          {optionDetails.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">
                          {formatPrice(optionDetails.price * option.quantity, item.currency)}
                        </span>
                        <div className="text-xs text-gray-500">
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
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">{t('pricingBreakdown')}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">{t('basePrice')}</span>
                  <span className="font-medium">{formatPrice(item.pricing_breakdown.base_price, item.currency)}</span>
                </div>
                
                {item.pricing_breakdown.time_surcharge > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{t('timeSurcharge')}</span>
                    <span className="font-medium text-orange-600">+{formatPrice(item.pricing_breakdown.time_surcharge, item.currency)}</span>
                  </div>
                )}
                
                {item.pricing_breakdown.round_trip_discount > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{t('roundTripDiscount')}</span>
                    <span className="font-medium text-green-600">-{formatPrice(item.pricing_breakdown.round_trip_discount, item.currency)}</span>
                  </div>
                )}
                
                {item.pricing_breakdown.options_total > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{t('optionsTotal')}</span>
                    <span className="font-medium">{formatPrice(item.pricing_breakdown.options_total, item.currency)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">{t('finalPrice')}</span>
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
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('vehicleFeatures')}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Wifi className="w-4 h-4 text-purple-600" />
                <span>WiFi</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Snowflake className="w-4 h-4 text-purple-600" />
                <span>AC</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Insurance</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-4 h-4 text-purple-600" />
                <span>Premium</span>
              </div>
            </div>
=======
      {/* Vehicle Information */}
      {(item as any).vehicle_type && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('vehicleDetails')}:</h4>
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <Car className="h-4 w-4 text-gray-600" />
            <span className="text-sm">{(item as any).vehicle_type}</span>
          </div>
        </div>
      )}

      {/* Distance and Duration */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {(item as any).distance && (
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="h-4 w-4" />
            <span>{t('distance')}: {(item as any).distance}</span>
>>>>>>> Stashed changes
          </div>
        )}
        {(item as any).estimated_duration && (
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="h-4 w-4" />
            <span>{t('duration')}: {(item as any).estimated_duration}</span>
          </div>
        )}
      </div>

      {/* Vehicle Features */}
      {(item as any).features && (item as any).features.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">{t('includedFeatures')}:</h4>
          <div className="grid grid-cols-2 gap-2">
            {(item as any).features.map((feature: string, index: number) => {
              const IconComponent = featureIcons[feature as keyof typeof featureIcons] || Settings;
              return (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <IconComponent className="h-3 w-3" />
                  <span>{feature.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Passengers */}
      {(item as any).passengers && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{t('passengers')}: {(item as any).passengers}</span>
        </div>
      )}
    </div>
  );

  // Custom footer for transfer-specific actions
  const customFooter = (
    <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">{t('transferService')}</span>
        </div>
        <div className="text-sm text-gray-600">
          {t('bookingId')}: {item.id.substring(0, 8)}...
        </div>
      </div>
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
      customIcon={<Car className="h-5 w-5" />}
      customDetails={customDetails}
      customFooter={customFooter}
      className="border-l-4 border-green-500"
    />
  );
} 