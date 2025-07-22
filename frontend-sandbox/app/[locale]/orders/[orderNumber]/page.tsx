'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { orderService } from '../../../../lib/services/orderService';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  User, 
  MapPin, 
  Calendar, 
  MessageSquare,
  Package,
  Truck,
  Star,
  Shield,
  Mail,
  Phone,
  Globe,
  Award,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface OrderDetailProps {
  order: any;
  isLoading: boolean;
  error: string | null;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderNumber) return;
      try {
        setIsLoading(true);
        const result = await orderService.getOrderDetails(orderNumber);
        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError(result.message || 'Failed to load order details');
        }
      } catch (error: any) {
        console.error('Failed to fetch order:', error);
        setError(error.response?.data?.error || 'Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrderDetail();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 animate-pulse">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-4">
            <Link
              href="/tours"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Package className="w-5 h-5 mr-2" />
              Browse Tours
            </Link>
            <div className="text-sm text-gray-500">
              Need help? Contact our support team
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-blue-500 rounded-full mb-6">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">The order you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
          <Link
            href="/tours"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Package className="w-5 h-5 mr-2" />
            Explore Tours
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-6 shadow-2xl animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Thank you for choosing Peykan Tourism! Your adventure is now confirmed and we&apos;re excited to make your journey unforgettable.
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Your booking is secure and confirmed</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                    <p className="text-gray-600">Your booking details</p>
                  </div>
                </div>
                <div className={`flex items-center px-4 py-2 rounded-full border-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2 font-semibold capitalize">{order.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center mb-3">
                    <Package className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Order Number</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{order.order_number}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Order Date</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center mb-3">
                    <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{order.currency} {order.total_amount}</p>
                </div>
                <div className={`p-6 rounded-2xl border ${getPaymentStatusColor(order.payment_status)}`}>
                  <div className="flex items-center mb-3">
                    <Shield className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Payment Status</span>
                  </div>
                  <p className="text-xl font-bold capitalize">{order.payment_status}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Customer Information</h3>
                  <p className="text-gray-600">Your contact details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Full Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{order.customer_name}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Email Address</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{order.customer_email}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100">
                  <div className="flex items-center mb-3">
                    <Phone className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Phone Number</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{order.customer_phone}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mr-4">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Adventures</h3>
                  <p className="text-gray-600">What you&apos;ve booked</p>
                </div>
              </div>
              <div className="space-y-6">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-xl font-bold text-gray-900 mr-3">{item.product_title}</h4>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium ml-1">Premium</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            Qty: {item.quantity} × {item.currency} {item.unit_price}
                          </div>
                          {item.variant_name && (
                            <div className="flex items-center">
                              <Award className="w-4 h-4 mr-2" />
                              {item.variant_name}
                            </div>
                          )}
                          {item.booking_date && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(item.booking_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {item.currency} {item.total_price}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            {order.special_requests && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-3xl">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Special Requests</h3>
                    <p className="text-gray-600">Your special requirements</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                  <p className="text-gray-700 leading-relaxed">{order.special_requests}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Next Steps */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">What&apos;s Next?</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Confirmation Email</p>
                      <p className="text-sm text-gray-600">Sent to your email address</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Team Review</p>
                      <p className="text-sm text-gray-600">We&apos;ll contact you if needed</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Track Status</p>
                      <p className="text-sm text-gray-600">Monitor in your account</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Support Available</p>
                      <p className="text-sm text-gray-600">24/7 customer service</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-3xl p-6">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <div className="font-bold text-green-800">Secure Booking</div>
                    <div className="text-sm text-green-600">SSL Encrypted</div>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  Your booking is protected by industry-standard security measures and our commitment to your privacy.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href="/tours"
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Package className="w-5 h-5 mr-2" />
                  Explore More Tours
                </Link>
                <Link
                  href="/orders"
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 