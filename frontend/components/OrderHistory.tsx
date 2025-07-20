'use client';

import React, { useState, useEffect } from 'react';
import { Package, Calendar, DollarSign, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { orderService, Order } from '../lib/services/orderService';

interface OrderHistoryProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function OrderHistory({ onShowToast }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await orderService.getUserOrders();
      
      if (result.success && result.orders) {
        setOrders(result.orders);
      } else {
        setError(result.message || 'خطا در بارگذاری سفارشات');
        onShowToast(result.message || 'خطا در بارگذاری سفارشات', 'error');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری سفارشات');
      onShowToast(err.message || 'خطا در بارگذاری سفارشات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (orderNumber: string) => {
    // Navigate to order detail page
    window.open(`/orders/${orderNumber}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">در حال بارگذاری سفارشات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ سفارشی یافت نشد</h3>
        <p className="text-gray-600 mb-4">
          شما هنوز هیچ سفارشی ثبت نکرده‌اید. برای مشاهده محصولات و ثبت سفارش، به صفحه اصلی مراجعه کنید.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          مشاهده محصولات
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">تاریخچه سفارشات</h2>
        <button
          onClick={loadOrders}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          بروزرسانی
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  سفارش #{order.order_number}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {orderService.formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${orderService.getStatusColor(order.status)}`}>
                  {orderService.getOrderStatusLabel(order.status)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${orderService.getPaymentStatusColor(order.payment_status)}`}>
                  {orderService.getPaymentStatusLabel(order.payment_status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  مبلغ کل: {orderService.formatCurrency(order.total_amount, order.currency)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  تعداد آیتم: {order.items.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  تاریخ سفارش: {orderService.formatDate(order.created_at)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">آیتم‌های سفارش:</h4>
              <div className="space-y-2">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.product_title}</span>
                    <span className="text-gray-500">
                      {item.quantity} عدد - {orderService.formatCurrency(item.total_price, item.currency)}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-gray-500">
                    و {order.items.length - 3} آیتم دیگر...
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewOrder(order.order_number)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                مشاهده جزئیات
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 