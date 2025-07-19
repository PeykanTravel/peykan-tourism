'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
// New application layer imports
import { useCart } from '../../../lib/application/hooks/useCart';
import { useAuth } from '../../../lib/application/hooks/useAuth';
import TourCartItemComponent from '../../../components/cart/TourCartItem';
import EventCartItemComponent from '../../../components/cart/EventCartItem';
import TransferCartItemComponent from '../../../components/cart/TransferCartItem';
import { 
  ShoppingCart, 
  Trash2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('Cart');
  
  // New application layer hooks
  const { 
    cart, 
    isLoading: cartLoading,
    error: cartError,
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartItemCount, 
    getCartTotal
  } = useCart();
  
  const { user, isLoading: authLoading } = useAuth();
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cart');
    }
  }, [user, authLoading, router]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    if (!user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      router.push('/login?redirect=/cart');
      return;
    }
    
    setIsUpdating(itemId);
    try {
      await updateCartItem(itemId, { 
        quantity: newQuantity
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      alert('خطا در بروزرسانی سبد خرید. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleParticipantChange = async (itemId: string, participantType: 'adult' | 'child' | 'infant', newCount: number) => {
    if (newCount < 0) return;
    
    if (!user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      router.push('/login?redirect=/cart');
      return;
    }
    
    setIsUpdating(itemId);
    try {
      await updateCartItem(itemId, {
        participants: newCount
      });
    } catch (error) {        
      console.error('Error updating participants:', error);
      alert('خطا در بروزرسانی تعداد شرکت‌کنندگان. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!user) {
      alert('لطفاً ابتدا وارد حساب کاربری خود شوید.');
      router.push('/login?redirect=/cart');
      return;
    }
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Error removing cart item:', error);
      alert('خطا در حذف آیتم. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('خطا در پاک کردن سبد خرید. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
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

  // Show loading state
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              خطا در بارگذاری سبد خرید
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {cartError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart
  if (!cart || cart.getItems().length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('emptyCart')}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
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

  // Render cart items
  const renderCartItem = (item: any) => {
    const commonProps = {
      isUpdating: isUpdating === item.id,
      onQuantityChange: handleQuantityChange,
      onRemove: handleRemoveItem,
      formatPrice,
      formatDate
    };

    switch (item.productType) {
      case 'tour':
        return (
          <TourCartItemComponent
            {...commonProps}
            item={item}
            onParticipantChange={handleParticipantChange}
          />
        );
      case 'event':
        return (
          <EventCartItemComponent
            {...commonProps}
            item={item}
          />
        );
      case 'transfer':
        return (
          <TransferCartItemComponent
            {...commonProps}
            item={item}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('cart')} ({getCartItemCount()})
          </h1>
          <p className="text-gray-600">
            {t('cartDescription')}
          </p>
        </div>

        {/* Cart Items */}
        <div className="space-y-6 mb-8">
          {cart.getItems().map((item) => (
            <div key={item.id}>
              {renderCartItem(item)}
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('summary')}
            </h2>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {t('clearCart')}
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-700">
                {t('total')}:
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(getCartTotal(), 'USD')}
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors shadow-md"
            >
              {t('proceedToCheckout')}
            </button>
          </div>
        </div>

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('clearCartConfirm')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('clearCartWarning')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleClearCart}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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