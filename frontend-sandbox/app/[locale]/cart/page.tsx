'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCart } from '../../../lib/hooks/useCart';
import { CartItem } from '../../../lib/contexts/UnifiedCartContext';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { tokenService } from '../../../lib/services/tokenService';
import { PriceDisplay } from '../../../components/ui/Price';
import { useCurrency } from '../../../lib/stores/currencyStore';
import ImprovedCartItem from '../../../components/cart/ImprovedCartItem';
import { 
  ShoppingCart, 
  Trash2, 
  AlertCircle,
  MapPin,
  Plus,
  Minus
} from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('Cart');
  const { items, totalItems, totalPrice, currency, updateItem, removeItem, clearCart, refreshCart } = useCart();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { initialize: initializeCurrency } = useCurrency();
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Initialize currency
  useEffect(() => {
    initializeCurrency();
  }, [initializeCurrency]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/cart');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (!isAuthenticated || !user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      router.push('/login?redirect=/cart');
      return;
    }
    
    setIsUpdating(itemId);
    try {
      const result = await updateItem(itemId, { 
        quantity: newQuantity
      });
      
      if (result.success) {
        // Refresh cart to update navbar count
        await refreshCart();
      } else {
        console.error('Failed to update cart item:', result.error);
        alert('خطا در به‌روزرسانی تعداد. لطفاً دوباره تلاش کنید.');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('خطا در به‌روزرسانی تعداد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleParticipantChange = async (itemId: string, participantType: 'adult' | 'child' | 'infant', newCount: number) => {
    if (newCount < 0) return;
    
    if (!isAuthenticated || !user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      router.push('/login?redirect=/cart');
      return;
    }
    
    setIsUpdating(itemId);
    try {
      const item = items.find(i => i.id === itemId);
      if (item && item.product_type === 'tour') {
        const tourItem = item;
        const updatedParticipants = {
          ...tourItem.booking_data.participants,
          [participantType]: newCount
        };
        
        const token = tokenService.getAccessToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`http://localhost:8000/api/v1/cart/items/${itemId}/update/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            booking_data: {
              participants: updatedParticipants,
              schedule_id: tourItem.booking_data.schedule_id,
              variant_id: tourItem.variant_id,
              special_requests: tourItem.booking_data.special_requests || ''
            },
            selected_options: tourItem.selected_options
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update cart item: ${response.statusText}`);
        }
        
        const updatedItem = await response.json();
        console.log('Updated cart item:', updatedItem);
        
        // Refresh cart data
        await refreshCart();
      }
    } catch (error) {
      console.error('Error updating participants:', error);
      alert('خطا در به‌روزرسانی شرکت‌کنندگان. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!isAuthenticated || !user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      router.push('/login?redirect=/cart');
      return;
    }
    
    try {
      const result = await removeItem(itemId);
      if (result.success) {
        // Refresh cart to update navbar count
        await refreshCart();
      } else {
        console.error('Failed to remove item from cart:', result.error);
        alert('خطا در حذف آیتم. لطفاً دوباره تلاش کنید.');
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      alert('خطا در حذف آیتم. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleClearCart = async () => {
    try {
      const result = await clearCart();
      if (result.success) {
        // Refresh cart to update navbar count
        await refreshCart();
        setShowClearConfirm(false);
      } else {
        console.error('Failed to clear cart:', result.error);
        alert('خطا در پاک کردن سبد خرید. لطفاً دوباره تلاش کنید.');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('خطا در پاک کردن سبد خرید. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }
    router.push('/checkout');
  };

  const formatPrice = (price: number, currencyCode: string) => {
    if (isNaN(price) || !isFinite(price)) {
      return `${currencyCode || 'USD'} 0.00`;
    }
    
    // Use current locale for number formatting
    const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
    
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return locale === 'fa' ? 'تاریخ مشخص نشده' : 'Date not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return locale === 'fa' ? 'تاریخ نامعتبر' : 'Invalid date';
      
      // Use current locale for date formatting
      const currentLocale = locale === 'fa' ? 'fa-IR' : 'en-US';
      return date.toLocaleDateString(currentLocale);
    } catch (error) {
      return locale === 'fa' ? 'تاریخ نامعتبر' : 'Invalid date';
    }
  };

    // Render cart item based on product type
  const renderCartItem = (item: CartItem) => {
    return (
      <ImprovedCartItem
        key={item.id}
        item={item}
        isUpdating={isUpdating === item.id}
        onQuantityChange={handleQuantityChange}
        onParticipantChange={handleParticipantChange}
        onRemove={handleRemoveItem}
        formatPrice={formatPrice}
        formatDate={formatDate}
      />
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('emptyCart')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {t('emptyCartDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/tours"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t('browseTours')}
              </Link>
              <Link
                href="/events"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t('browseEvents')}
              </Link>
              <Link
                href="/transfers"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {t('bookTransfers')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
              <p className="text-gray-600 dark:text-gray-300">
                {totalItems} {t('items')} {t('inCart')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('clearCart')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('items')} ({totalItems})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id}>
                    {renderCartItem(item)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {t('orderSummary')}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t('subtotal')}</span>
                  <span className="font-medium">
                    <PriceDisplay amount={totalPrice} currency={currency} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{t('tax')}</span>
                  <span className="font-medium">
                    <PriceDisplay amount={0} currency={currency} />
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('total')}</span>
                    <span>
                      <PriceDisplay amount={totalPrice} currency={currency} />
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('proceedToCheckout')}
              </button>
              
              {!isAuthenticated && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {t('guestCheckoutNote')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('clearCartConfirm')}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t('clearCartWarning')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-900"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {t('clearCart')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 