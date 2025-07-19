'use client';

import React, { useState } from 'react';
import { useCart } from '../../lib/hooks/useCart';
import { createOrder } from '../../lib/api/orders';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Banknote, 
  User, 
  MapPin, 
  MessageSquare, 
  CheckCircle,
  ShoppingBag,
  Calendar,
  Clock,
  Shield,
  ArrowRight,
  Star,
  Package,
  Truck
} from 'lucide-react';

interface CheckoutFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  special_requests: string;
  payment_method: 'credit_card' | 'bank_transfer' | 'paypal' | 'cash';
  terms_accepted: boolean;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, items, totalPrice, currency, isAuthenticated, clearCart } = useCart();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    special_requests: '',
    payment_method: 'credit_card',
    terms_accepted: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login to complete checkout');
      return;
    }

    if (!formData.terms_accepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const orderData = {
        cart_id: (cart as any)?.id || '',
        special_requests: formData.special_requests,
      };

      const response = await createOrder(orderData, token);
      await clearCart();
      router.push(`/orders/${response.data.order.order_number}`);
      
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Secure Checkout
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Please login to complete your secure checkout and access exclusive member benefits.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <User className="w-5 h-5 mr-2" />
                Login to Continue
              </button>
              <div className="text-sm text-gray-500">
                Don't have an account? 
                <button 
                  onClick={() => router.push('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                >
                  Sign up here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 shadow-lg">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Discover amazing tours and experiences to add to your cart.
            </p>
            <button
              onClick={() => router.push('/tours')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Package className="w-5 h-5 mr-2" />
              Explore Tours
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Information', icon: User },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Review', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Complete Your Booking
          </h1>
          <p className="text-gray-600 text-lg">Secure checkout with instant confirmation</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white shadow-lg' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Billing Address</h2>
                  <p className="text-gray-600">Where should we send your confirmation?</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                    placeholder="Enter your country"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Special Requests</h2>
                  <p className="text-gray-600">Any special requirements or preferences?</p>
                </div>
              </div>
              
              <textarea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 resize-none"
                placeholder="Tell us about any special requests, dietary requirements, accessibility needs, or other preferences..."
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-gray-600">Choose your preferred payment option</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { 
                    value: 'credit_card', 
                    label: 'Credit Card', 
                    icon: CreditCard, 
                    description: 'Pay securely with your credit card',
                    color: 'from-blue-500 to-purple-600'
                  },
                  { 
                    value: 'bank_transfer', 
                    label: 'Bank Transfer', 
                    icon: Banknote, 
                    description: 'Pay via bank transfer',
                    color: 'from-green-500 to-teal-600'
                  },
                  { 
                    value: 'paypal', 
                    label: 'PayPal', 
                    icon: Banknote, 
                    description: 'Pay with PayPal',
                    color: 'from-blue-500 to-indigo-600'
                  },
                  { 
                    value: 'cash', 
                    label: 'Cash on Arrival', 
                    icon: Banknote, 
                    description: 'Pay with cash when you arrive',
                    color: 'from-green-500 to-emerald-600'
                  },
                ].map((method) => (
                  <label 
                    key={method.value} 
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.payment_method === method.value 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={formData.payment_method === method.value}
                      onChange={handleInputChange}
                      className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className={`w-10 h-10 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center mr-4`}>
                      <method.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{method.label}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                    {formData.payment_method === method.value && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-2xl">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  className="mt-1 mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                  required
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                      terms and conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                      privacy policy
                    </a>
                    . I understand that this booking is subject to availability and cancellation policies.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.product_title}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          Qty: {item.quantity} × {currency} {item.unit_price}
                        </div>
                        {item.variant_name && (
                          <div className="text-sm text-blue-600 font-medium">
                            {item.variant_name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {currency} {item.total_price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{currency} {totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">{currency} 0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{currency} {totalPrice}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    <div className="text-sm">
                      <div className="font-semibold text-green-800">Secure Checkout</div>
                      <div className="text-green-600">Your payment is protected by SSL encryption</div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Complete Booking
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-red-500 rounded-full mr-2"></div>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 