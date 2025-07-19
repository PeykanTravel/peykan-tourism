'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Users, 
  Package, 
  MapPin, 
  Phone, 
  User,
  CreditCard,
  CheckCircle
} from 'lucide-react';

interface BookingSummaryProps {
  bookingData: {
    route_name: string;
    vehicle_type: string;
    trip_type: 'one_way' | 'round_trip';
    outbound_datetime: string;
    return_datetime?: string;
    passenger_count: number;
    luggage_count: number;
    pickup_address: string;
    dropoff_address: string;
    contact_name: string;
    contact_phone: string;
    special_requirements?: string;
    selected_options: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    pricing: {
      final_price: number;
      currency: string;
    };
  };
}

export default function BookingSummary({ bookingData }: BookingSummaryProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('transfers');

  const formatPrice = (price: number, currency: string) => {
    const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
    return date.toLocaleString(currentLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t('bookingSummary')}
        </h2>
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">{t('confirmed')}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Route Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('routeDetails')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{bookingData.route_name}</p>
                <p className="text-sm text-gray-500">{bookingData.vehicle_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('tripDetails')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{t('outbound')}</p>
                <p className="text-sm text-gray-500">{formatDateTime(bookingData.outbound_datetime)}</p>
              </div>
            </div>
            
            {bookingData.trip_type === 'round_trip' && bookingData.return_datetime && (
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{t('return')}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(bookingData.return_datetime)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Passengers */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('passengers')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{t('passengerCount')}</p>
                <p className="text-sm text-gray-500">{bookingData.passenger_count} {t('passengers')}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Package className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{t('luggageCount')}</p>
                <p className="text-sm text-gray-500">{bookingData.luggage_count} {t('pieces')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('contactInformation')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{t('contactName')}</p>
                <p className="text-sm text-gray-500">{bookingData.contact_name}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{t('contactPhone')}</p>
                <p className="text-sm text-gray-500">{bookingData.contact_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup & Dropoff */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('pickupDropoff')}
          </h3>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-gray-900">{t('pickupAddress')}</p>
              <p className="text-sm text-gray-500">{bookingData.pickup_address}</p>
            </div>
            
            <div>
              <p className="font-medium text-gray-900">{t('dropoffAddress')}</p>
              <p className="text-sm text-gray-500">{bookingData.dropoff_address}</p>
            </div>
          </div>
        </div>

        {/* Selected Options */}
        {bookingData.selected_options.length > 0 && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('selectedOptions')}
            </h3>
            <div className="space-y-2">
              {bookingData.selected_options.map((option, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{option.name}</p>
                    <p className="text-sm text-gray-500">{option.quantity} {t('quantity')}</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatPrice(option.price * option.quantity, bookingData.pricing.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Requirements */}
        {bookingData.special_requirements && (
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('specialRequirements')}
            </h3>
            <p className="text-gray-700">{bookingData.special_requirements}</p>
          </div>
        )}

        {/* Total Price */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xl font-bold text-gray-900">
            <span>{t('totalPrice')}</span>
            <span>{formatPrice(bookingData.pricing.final_price, bookingData.pricing.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 