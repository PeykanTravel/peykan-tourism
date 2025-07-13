'use client';

import React, { useState } from 'react';
import { useCart } from '../../../lib/hooks/useCart';
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
  const { items, totalPrice, currency, isLoading, clearCart } = useCart();
  
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

      // Get cart ID from backend first
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';
      const cartResponse = await fetch(`${API_URL}/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to get cart information');
      }

      const cartData = await cartResponse.json();
      const cartId = cartData.id;

      const orderData = {
        cart_id: cartId,
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

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
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
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="customer_name"
                  placeholder="Full Name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  name="customer_email"
                  placeholder="Email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  name="customer_phone"
                  placeholder="Phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <textarea
                name="special_requests"
                placeholder="Special Requests"
                value={formData.special_requests}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-4 focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-4">
                {[
                  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
                  { value: 'bank_transfer', label: 'Bank Transfer', icon: Banknote },
                  { value: 'paypal', label: 'PayPal', icon: CreditCard },
                  { value: 'cash', label: 'Cash on Delivery', icon: Banknote },
                ].map((method) => (
                  <label key={method.value} className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={formData.payment_method === method.value}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <method.icon className="w-5 h-5 mr-2" />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Review</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-gray-600">{item.currency} {item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.currency} {item.price}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span>{currency} {totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 ml-auto"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-auto"
              >
                {isSubmitting ? 'Processing...' : 'Complete Order'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 