'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../lib/contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  Eye, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_title: string;
  quantity: number;
  price: number;
  variant?: string;
  date?: string;
  time?: string;
  location?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  created_at: string;
  updated_at: string;
  customer_info: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  special_requests?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const t = useTranslations('orders');
  const { isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/v1/orders/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت سفارشات');
      }

      const data = await response.json();
      setOrders(data.results || data);
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'خطا در دریافت سفارشات');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'تأیید شده';
      case 'completed':
        return 'تکمیل شده';
      case 'cancelled':
        return 'لغو شده';
      case 'pending':
        return 'در انتظار';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: 'IRR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/invoice/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت فاکتور');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Download invoice error:', err);
      alert('خطا در دانلود فاکتور');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">در حال بارگذاری سفارشات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">سفارشات من</h1>
            <p className="text-gray-600">تاریخچه سفارشات و جزئیات آنها</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                هنوز سفارشی ندارید
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                به نظر می‌رسد هنوز هیچ سفارشی ثبت نکرده‌اید. 
                بیایید شروع به کاوش در تورها، رویدادها و ترنسفرهای شگفت‌انگیز کنیم!
              </p>
              <button
                onClick={() => router.push('/tours')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                مرور محصولات
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          سفارش #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(order.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                          title="دانلود فاکتور"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>تاریخ سفارش: {formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>روش پرداخت: {order.payment_method}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        مجموع: {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">آیتم‌های سفارش:</h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            {item.product_title}
                            {item.variant && ` (${item.variant})`}
                          </span>
                          <span className="text-gray-600">
                            {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          و {order.items.length - 3} آیتم دیگر...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {showOrderDetails && selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      جزئیات سفارش #{selectedOrder.order_number}
                    </h2>
                    <button
                      onClick={() => setShowOrderDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusText(selectedOrder.status)}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedOrder.payment_status === 'paid' 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-yellow-600 bg-yellow-100'
                    }`}>
                      {selectedOrder.payment_status === 'paid' ? 'پرداخت شده' : 'در انتظار پرداخت'}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">اطلاعات مشتری</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">نام و نام خانوادگی:</p>
                        <p className="font-medium">{selectedOrder.customer_info.full_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ایمیل:</p>
                        <p className="font-medium">{selectedOrder.customer_info.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">تلفن:</p>
                        <p className="font-medium">{selectedOrder.customer_info.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">آدرس:</p>
                        <p className="font-medium">{selectedOrder.customer_info.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">آیتم‌های سفارش</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{item.product_title}</h4>
                            <span className="font-medium text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">نوع:</span> {item.product_type}
                            </div>
                            <div>
                              <span className="font-medium">تعداد:</span> {item.quantity}
                            </div>
                            {item.date && (
                              <div>
                                <span className="font-medium">تاریخ:</span> {formatDate(item.date)}
                              </div>
                            )}
                            {item.time && (
                              <div>
                                <span className="font-medium">زمان:</span> {item.time}
                              </div>
                            )}
                          </div>
                          {item.variant && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">نوع:</span> {item.variant}
                            </p>
                          )}
                          {item.location && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">مکان:</span> {item.location}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedOrder.special_requests && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">درخواست‌های ویژه</h3>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                        {selectedOrder.special_requests}
                      </p>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">مجموع:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(selectedOrder.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 