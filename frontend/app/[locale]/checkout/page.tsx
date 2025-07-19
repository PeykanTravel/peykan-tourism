'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCart } from '../../../lib/hooks/useCart';
import { useAuth } from '../../../lib/contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
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
      // For now, just clear cart and redirect to success page
      clearCart();
      router.push('/orders/success');
      
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

  const getItemName = (item: any) => {
    if (item.type === 'tour') return item.tour_name || item.name || t('tour');
    if (item.type === 'event') return item.event_name || item.name || t('event');
    if (item.type === 'transfer') return item.transfer_name || item.name || t('transfer');
    return item.name || t('item');
  };

  const getItemPrice = (item: any) => {
    if (item.type === 'tour') return item.subtotal || 0;
    if (item.type === 'event' || item.type === 'transfer') return (item.price || 0) * (item.quantity || 1);
    return item.price || 0;
  };

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
              {t('emptyCartMessage')}
            </p>
            <button
              onClick={() => router.push('/tours')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('startShopping')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToCart')}
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('checkout')}
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('customerInformation')}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('fullName')} *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={customerInfo.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('email')} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phone')} *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('city')}
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={customerInfo.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('address')} *
                    </label>
                    <textarea
                      name="address"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('specialRequests')}
                    </label>
                    <textarea
                      name="special_requests"
                      value={customerInfo.special_requests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('specialRequestsPlaceholder')}
                    />
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t('paymentMethod')}
                    </h3>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500"
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={method.id}
                            checked={selectedPaymentMethod === method.id}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            {method.icon}
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-500">{method.description}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-700">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? t('processing') : t('completeOrder')}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('orderSummary')}
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{getItemName(item)}</h4>
                        <p className="text-sm text-gray-500">
                          {item.type === 'tour' && `${item.participants} ${t('participants')}`}
                          {item.type === 'event' && `${item.quantity} ${t('tickets')}`}
                          {item.type === 'transfer' && `${item.passenger_count} ${t('passengers')}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatPrice(getItemPrice(item), item.currency || 'USD')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                    <span>{t('total')}</span>
                    <span>{formatPrice(totalPrice, 'USD')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 