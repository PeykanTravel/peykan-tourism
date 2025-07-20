'use client';

import { useState, useEffect } from 'react';
import { useCustomHook } from '../../../lib/hooks/hookFactory';
import { 
  getCart, 
  getCartSummary, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../api/cart';
import type { 
  CartItem, 
  AddToCartPayload, 
  UpdateCartItemPayload 
} from '../types/api';

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('access_token');
  return token;
};

// Local storage helpers
const getLocalCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      return parsedCart.items || [];
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  
  return [];
};

const setLocalCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cart', JSON.stringify({ items }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const addToLocalCart = (itemData: AddToCartPayload): CartItem => {
  const items = getLocalCart();
  let newItem = {
    ...itemData,
    id: `local_${Date.now()}`,
  };
  if (Array.isArray((itemData as any).selected_options) && (itemData as any).selected_options.length > 0) {
    newItem.selected_options = (itemData as any).selected_options.map((opt: any) => ({
      ...opt,
      price: typeof opt.price === 'number' ? opt.price : 0,
    }));
  }
  items.push(newItem as any);
  setLocalCart(items);
  return newItem as any;
};

const updateLocalCartItem = (itemId: string, itemData: UpdateCartItemPayload): CartItem | null => {
  const items = getLocalCart();
  const itemIndex = items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) return null;
  
  const updatedItem = { ...items[itemIndex], ...itemData } as any;
  items[itemIndex] = updatedItem;
  setLocalCart(items);
  return updatedItem;
};

const removeFromLocalCart = (itemId: string): boolean => {
  const items = getLocalCart();
  const filteredItems = items.filter(item => item.id !== itemId);
  
  if (filteredItems.length === items.length) return false;
  
  setLocalCart(filteredItems);
  return true;
};

const clearLocalCart = (): boolean => {
  try {
    localStorage.removeItem('cart');
    return true;
  } catch (error) {
    console.error('Error clearing local cart:', error);
    return false;
  }
};

// Fetcher functions
const cartFetcher = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');
  const response = await getCart(token);
  return response.data;
};

const cartSummaryFetcher = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');
  const response = await getCartSummary(token);
  return response.data;
};

// Hook for cart data - Updated for local cart support
export const useCart = () => {
  const [isClient, setIsClient] = useState(false);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [localTotalItems, setLocalTotalItems] = useState(0);
  const [localTotalPrice, setLocalTotalPrice] = useState(0);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
    const items = getLocalCart();
    setLocalItems(items);
    setLocalTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
    setLocalTotalPrice(items.reduce((sum, item) => sum + item.total_price, 0));
  }, []);

  const token = getAuthToken();
  const isAuthenticated = !!token;
  
  // For authenticated users, use SWR
  const { data, error, isLoading, mutate } = useCustomHook(
    isAuthenticated ? 'cart' : null,
    cartFetcher
  );

  const addItem = async (itemData: AddToCartPayload) => {
    if (isAuthenticated) {
      try {
        const response = await addToCart(itemData, token!);
        await mutate();
        return { success: true, data: response.data };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Failed to add item to cart' 
        };
      }
    } else {
      // Guest user - use local storage
      try {
        const newItem = addToLocalCart(itemData);
        
        // Update local state
        setLocalItems(prev => [...prev, newItem]);
        setLocalTotalItems(prev => prev + newItem.quantity);
        setLocalTotalPrice(prev => prev + newItem.total_price);
        
        return { success: true, data: { cart_item: newItem } };
      } catch (error: any) {
        return { 
          success: false, 
          error: 'Failed to add item to local cart' 
        };
      }
    }
  };

  const updateItem = async (itemId: string, itemData: UpdateCartItemPayload) => {
    if (isAuthenticated) {
      try {
        const response = await updateCartItem(itemId, itemData, token!);
        await mutate();
        return { success: true, data: response.data };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Failed to update cart item' 
        };
      }
    } else {
      // Guest user - use local storage
      try {
        const updatedItem = updateLocalCartItem(itemId, itemData);
        
        if (updatedItem) {
          // Update local state
          setLocalItems(prev => prev.map(item => 
            item.id === itemId ? updatedItem : item
          ));
          
          // Recalculate totals
          const items = getLocalCart();
          setLocalTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
          setLocalTotalPrice(items.reduce((sum, item) => sum + item.total_price, 0));
          
          return { success: true, data: { cart_item: updatedItem } };
        } else {
          return { success: false, error: 'Item not found in local cart' };
        }
      } catch (error: any) {
        return { 
          success: false, 
          error: 'Failed to update local cart item' 
        };
      }
    }
  };

  const removeItem = async (itemId: string) => {
    if (isAuthenticated) {
      try {
        await removeFromCart(itemId, token!);
        await mutate();
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Failed to remove item from cart' 
        };
      }
    } else {
      // Guest user - use local storage
      try {
        const success = removeFromLocalCart(itemId);
        
        if (success) {
          // Update local state
          const items = getLocalCart();
          setLocalItems(items);
          setLocalTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
          setLocalTotalPrice(items.reduce((sum, item) => sum + item.total_price, 0));
          
          return { success: true };
        } else {
          return { success: false, error: 'Item not found in local cart' };
        }
      } catch (error: any) {
        return { 
          success: false, 
          error: 'Failed to remove item from local cart' 
        };
      }
    }
  };

  const clearCartItems = async () => {
    if (isAuthenticated) {
      try {
        await clearCart(token!);
        await mutate();
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Failed to clear cart' 
        };
      }
    } else {
      // Guest user - use local storage
      try {
        const success = clearLocalCart();
        
        if (success) {
          // Update local state
          setLocalItems([]);
          setLocalTotalItems(0);
          setLocalTotalPrice(0);
          
          return { success: true };
        } else {
          return { success: false, error: 'Failed to clear local cart' };
        }
      } catch (error: any) {
        return { 
          success: false, 
          error: 'Failed to clear local cart' 
        };
      }
    }
  };

  // Return data based on authentication status
  const cartData = isAuthenticated ? data : {
    id: 'local_cart',
    items: localItems,
    total_items: localTotalItems,
    subtotal: localTotalPrice,
    total_price: localTotalPrice,
    currency: 'USD',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    cart: cartData,
    items: cartData?.items || [],
    totalItems: cartData?.total_items || 0,
    totalPrice: cartData?.total_price || 0,
    currency: cartData?.currency || 'USD',
    isAuthenticated,
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    isClient,
    addItem,
    updateItem,
    removeItem,
    clearCart: clearCartItems,
    mutate,
  };
};

// Hook for cart summary (optimized for checkout)
export const useCartSummary = () => {
  const [isClient, setIsClient] = useState(false);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);
  const [localTotalItems, setLocalTotalItems] = useState(0);
  const [localSubtotal, setLocalSubtotal] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const items = getLocalCart();
    setLocalItems(items);
    setLocalTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
    setLocalSubtotal(items.reduce((sum, item) => sum + item.total_price, 0));
  }, []);

  const token = getAuthToken();
  const isAuthenticated = !!token;
  
  const { data, error, isLoading, mutate } = useCustomHook(
    isAuthenticated ? 'cart-summary' : null,
    cartSummaryFetcher
  );

  const summaryData = isAuthenticated ? data : {
    total_items: localTotalItems,
    subtotal: localSubtotal,
    total_price: localSubtotal,
    currency: 'USD',
    items: localItems,
  };

  return {
    summary: summaryData,
    totalItems: summaryData?.total_items || 0,
    subtotal: summaryData?.subtotal || 0,
    totalPrice: summaryData?.total_price || 0,
    currency: summaryData?.currency || 'USD',
    items: summaryData?.items || [],
    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,
    isClient,
    mutate,
  };
};

// Hook for cart count (optimized for navbar)
export const useCartCount = () => {
  const { totalItems, isAuthenticated, isLoading } = useCart();
  
  return {
    count: totalItems,
    isAuthenticated,
    isLoading,
  };
}; 