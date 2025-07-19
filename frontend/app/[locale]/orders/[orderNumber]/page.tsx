/**
 * Order Confirmation Page
 * 
 * This page displays order confirmation details following DDD principles
 * and Clean Architecture patterns.
 * 
 * Responsibilities:
 * - Display order confirmation information
 * - Show reservation details and status
 * - Provide order management actions
 * - Handle order-related business logic
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Domain Services
import { reservationService } from '@/lib/services/reservationService';

// UI Components
import { CheckCircle, Clock, AlertCircle, Download, Share2, Printer } from 'lucide-react';
import Link from 'next/link';

// Domain Types
interface OrderDetails {
  id: string;
  reservation_number: string;
  status: 'draft' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  discount_amount: number;
  discount_code: string;
  special_requirements: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  items: Array<{
    id: string;
    product_type: 'event' | 'tour' | 'transfer';
    product_id: string;
    product_title: string;
    product_slug: string;
    booking_date: string;
    booking_time: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    currency: string;
    variant_id?: string;
    variant_name?: string;
    selected_options: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    options_total: number;
    booking_data: Record<string, any>;
  }>;
  history: Array<{
    from_status: string;
    to_status: string;
    changed_by_name: string;
    reason: string;
    created_at: string;
  }>;
}

export default function OrderConfirmationPage() {
  const t = useTranslations('orderConfirmation');
  const params = useParams();
  const router = useRouter();
  
  // State Management
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Effects
  useEffect(() => {
    loadOrderDetails();
  }, [params.orderNumber]);

  // Data Loading Functions
  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const orderData = await reservationService.getReservation(params.orderNumber as string);
      setOrder(orderData);
      
    } catch (err) {
      setError(t('errors.orderNotFound'));
      console.error('Failed to load order details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Event Handlers
  const handleCancelOrder = async () => {
    if (!order || !confirm(t('cancel.confirm'))) return;
    
    try {
      setIsCancelling(true);
      setError(null);
      
      await reservationService.cancelReservation(order.id, t('cancel.userRequest'));
      
      // Reload order details
      await loadOrderDetails();
      
    } catch (err) {
      setError(t('errors.cancelFailed'));
      console.error('Failed to cancel order:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      const blob = await reservationService.exportReservations({
        status: 'confirmed',
        date_from: order.created_at.split('T')[0],
        date_to: order.created_at.split('T')[0],
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${order.reservation_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: t('share.title'),
        text: t('share.text', { orderNumber: order?.reservation_number }),
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(t('share.copied'));
    }
  };

  // Helper Functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending':
      case 'draft':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'cancelled':
      case 'expired':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
      case 'draft':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('errors.title')}</h1>
          <p className="text-gray-600 mb-6">{error || t('errors.orderNotFound')}</p>
          <Link
            href="/"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {t('errors.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('subtitle', { orderNumber: order.reservation_number })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrintOrder}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <Printer className="w-5 h-5 mr-2" />
                {t('actions.print')}
              </button>
              <button
                onClick={handleShareOrder}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <Share2 className="w-5 h-5 mr-2" />
                {t('actions.share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t('status.title')}</h2>
                {getStatusIcon(order.status)}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {t(`status.${order.status}`)}
              </div>
              <p className="text-gray-600 mt-2">
                {t('status.lastUpdated', { date: formatDate(order.updated_at) })}
              </p>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('items.title')}</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_title}</h3>
                        <p className="text-gray-600 text-sm">
                          {formatDate(item.booking_date)} at {formatTime(item.booking_time)}
                        </p>
                        {item.variant_name && (
                          <p className="text-gray-600 text-sm">{item.variant_name}</p>
                        )}
                        <p className="text-gray-600 text-sm">
                          {t('items.quantity', { count: item.quantity })}
                        </p>
                        {item.selected_options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">{t('items.options')}:</p>
                            <ul className="text-sm text-gray-600">
                              {item.selected_options.map((option) => (
                                <li key={option.id}>
                                  {option.name} (x{option.quantity})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.total_price, item.currency)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.unit_price, item.currency)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('history.title')}</h2>
              <div className="space-y-3">
                {order.history.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {t('history.statusChange', {
                          from: t(`status.${entry.from_status}`),
                          to: t(`status.${entry.to_status}`),
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(entry.created_at)} by {entry.changed_by_name}
                      </p>
                      {entry.reason && (
                        <p className="text-xs text-gray-500 mt-1">{entry.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('customer.title')}</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('customer.name')}</p>
                  <p className="text-gray-900">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('customer.email')}</p>
                  <p className="text-gray-900">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('customer.phone')}</p>
                  <p className="text-gray-900">{order.customer_phone}</p>
                </div>
                {order.special_requirements && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t('customer.requirements')}</p>
                    <p className="text-gray-900">{order.special_requirements}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing.title')}</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('pricing.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('pricing.discount')}</span>
                    <span>-{formatCurrency(order.discount_amount, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('pricing.tax')}</span>
                  <span className="font-medium">{formatCurrency(order.tax_amount, order.currency)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">{t('pricing.total')}</span>
                    <span className="text-lg font-semibold">{formatCurrency(order.total_amount, order.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('actions.title')}</h2>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t('actions.downloadInvoice')}
                </button>
                
                {order.status === 'confirmed' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {isCancelling ? t('actions.cancelling') : t('actions.cancel')}
                  </button>
                )}
                
                <Link
                  href="/"
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {t('actions.backToHome')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 