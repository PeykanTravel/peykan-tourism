'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuthStore } from '../../../lib/application/stores/authStore';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  Package, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../../lib/design-system/components/Button/Button';
import { Card } from '../../../lib/design-system/components/Card/Card';
import { Input } from '../../../lib/design-system/components/Input/Input';
import { Loading } from '../../../lib/design-system/components/Loading/Loading';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  currency: string;
  created_at: string;
  total_items: number;
  customer_name: string;
  customer_email: string;
}

interface OrdersResponse {
  success: boolean;
  data: Order[];
  message?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'paid':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'confirmed':
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    case 'processing':
      return <Clock className="w-5 h-5 text-yellow-600" />;
    case 'pending':
      return <Clock className="w-5 h-5 text-gray-600" />;
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'refunded':
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    default:
      return <Package className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'paid':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'confirmed':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'processing':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'pending':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'refunded':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusText = (status: string, t: any) => {
  switch (status) {
    case 'completed':
      return t('completed');
    case 'paid':
      return t('paid');
    case 'confirmed':
      return t('confirmed');
    case 'processing':
      return t('processing');
    case 'pending':
      return t('pending');
    case 'cancelled':
      return t('cancelled');
    case 'refunded':
      return t('refunded');
    default:
      return status;
}
};

export default function OrdersPage() {
  const router = useRouter();
  const t = useTranslations('orders');
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    }
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/orders/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data: OrdersResponse = await response.json();
      
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to load orders');
      }
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('myOrders')}
                </h1>
                <p className="mt-2 text-gray-600">
                  {t('ordersDescription')}
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{t('refresh')}</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('searchOrders')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t('allStatuses')}</option>
                  <option value="pending">{t('pending')}</option>
                  <option value="confirmed">{t('confirmed')}</option>
                  <option value="paid">{t('paid')}</option>
                  <option value="processing">{t('processing')}</option>
                  <option value="completed">{t('completed')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                  <option value="refunded">{t('refunded')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : error ? (
            <Card className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('errorLoadingOrders')}
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadOrders} variant="outline">
                  {t('tryAgain')}
                </Button>
              </div>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-6">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? t('noOrdersFound') : t('noOrdersYet')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('noOrdersMatchFilters') 
                    : t('startShopping')}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link href="/tours">
                    <Button>
                      {t('browseTours')}
                    </Button>
                  </Link>
                )}
            </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                              {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                              {order.customer_name} • {order.customer_email}
                        </p>
                      </div>
                    </div>
                  </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(order.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {order.total_items} {t('items')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(order.total_amount, order.currency)}
                    </span>
                      </div>
                    </div>
                  </div>

                    <div className="flex flex-col items-end space-y-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status, t)}
                  </div>

                      <Link href={`/orders/${order.order_number}`}>
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <span>{t('viewDetails')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 