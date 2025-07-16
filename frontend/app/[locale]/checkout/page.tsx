'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCart } from '../../../lib/hooks/useCart';
import { useAuth } from '../../../lib/contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { apiClient } from '../../../lib/api/client';
import { API_CONFIG } from '../../../lib/config/api';
import { 
  CreditCard, 
  Ban, 
  ShoppingCart, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface CustomerInfo {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  special_requests: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'fa';
  const t = useTranslations('checkout');
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    full_name: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: locale === 'fa' ? 'ایران' : 'Iran',
    postal_code: '',
    special_requests: ''
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: t('creditCard'),
      description: t('creditCardDescription'),
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'bank_transfer',
      name: t('bankTransfer'),
      description: t('bankTransferDescription'),
      icon: <Ban className="w-5 h-5" />
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerInfo.full_name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      setError(t('fillAllRequiredFields'));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create order
      const orderData = {
        customer_info: customerInfo,
        items: items.map(item => {
          if (item.type === 'tour') {
            return {
              product_id: item.tour_id,
              product_type: item.type,
              schedule_id: item.schedule_id,
              variant_id: item.variant_id,
              participants: item.participants,
              selected_options: item.selected_options,
              special_requests: item.special_requests,
              price: item.subtotal
            };
          } else if (item.type === 'event') {
            return {
              product_id: item.id,
              product_type: item.type,
              quantity: item.quantity,
              price: item.price,
              variant: item.variant,
              options: item.options,
              special_requests: item.special_requests
            };
          } else if (item.type === 'transfer') {
            return {
              product_id: item.id,
              product_type: item.type,
              quantity: item.quantity,
              price: item.price,
              slug: item.slug,
              passenger_count: item.passenger_count,
              luggage_count: item.luggage_count,
              pickup_address: item.pickup_address,
              dropoff_address: item.dropoff_address,
              contact_name: item.contact_name,
              contact_phone: item.contact_phone,
              selected_options: item.selected_options,
              special_requirements: item.special_requirements
            };
          }
        }),
        total_amount: totalPrice,
        payment_method: selectedPaymentMethod
      };

      const response = await apiClient.post(API_CONFIG.ENDPOINTS.ORDERS.CREATE, orderData);

      const order = response.data;
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || t('orderCompleteError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
    return new Date(dateString).toLocaleDateString(currentLocale);
  };

  const totalsByCurrency = items.reduce((acc, item) => {
    const itemPrice = item.type === 'tour' ? item.subtotal : (item.price * item.quantity);
    acc[item.currency] = (acc[item.currency] || 0) + itemPrice;
    return acc;
  }, {} as Record<string, number>);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('emptyCart')}
            </h1>
            <p className="text-gray-600 mb-8">
              {t('emptyCartDescription')}
            </p>
            <button
              onClick={() => router.push('/tours')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('browseTours')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.push('/cart')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToCart')}
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{t('checkoutTitle')}</h1>
              <p className="text-gray-600">{t('checkoutSubtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Info Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('customerInfo')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('fullName')} *
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={customerInfo.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('fullNamePlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('phone')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('address')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('addressPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('city')} *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('cityPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('postalCode')}
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      value={customerInfo.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('postalCodePlaceholder')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('specialRequests')}
                    </label>
                    <textarea
                      id="special_requests"
                      name="special_requests"
                      value={customerInfo.special_requests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('specialRequestsPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('paymentMethod')}</h2>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600">
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('orderSummary')}</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {item.title}
                        </h4>
                        
                        {/* Tour-specific details */}
                        {item.type === 'tour' && (
                          <div className="text-xs text-gray-600 mt-1">
                            <div className="flex items-center gap-2">
                              <span>{item.participants.adult} {t('adults')}</span>
                              <span>{item.participants.child} {t('children')}</span>
                              <span>{item.participants.infant} {t('infants')}</span>
                            </div>
                            {item.selected_options.length > 0 && (
                              <div className="mt-1">
                                {item.selected_options.length} {t('options')} {t('selected')}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Other items details */}
                        {item.type === 'event' && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                            {item.date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.date)}
                              </div>
                            )}
                            {item.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.time}
                              </div>
                            )}
                          </div>
                        )}
                        {item.type === 'transfer' && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.outbound_datetime)}
                            </div>
                            {item.type === 'transfer' && item.passenger_count && (
                              <div>{t('passengers')}: {item.passenger_count}</div>
                            )}
                            {item.type === 'transfer' && item.luggage_count && (
                              <div>{t('luggage')}: {item.luggage_count}</div>
                            )}
                            {item.type === 'transfer' && item.pickup_address && (
                              <div>{t('pickupAddress')}: {item.pickup_address}</div>
                            )}
                            {item.type === 'transfer' && item.special_requirements && (
                              <div>{t('specialRequirements')}: {item.special_requirements}</div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {item.type === 'tour' 
                            ? formatPrice(item.subtotal, item.currency)
                            : `${item.quantity} × ${formatPrice(item.price, item.currency)}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  {Object.entries(totalsByCurrency).map(([currency, total]) => (
                    <div key={currency} className="flex justify-between text-sm">
                      <span className="text-gray-600">{currency}:</span>
                      <span className="font-medium">{formatPrice(total, currency)}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{t('processing')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{t('completeOrder')}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  {t('termsText')}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 