import useSWR, { mutate } from 'swr';
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
import { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { SafeStorage } from '../../../lib/utils/storage';

// Helper to get auth token
const getAuthToken = () => {
  const token = SafeStorage.getItem('access_token');
  return token;
};

// Local cart storage helpers for guests
const LOCAL_CART_KEY = 'peykan_local_cart';

const getLocalCart = (): CartItem[] => {
  try {
    const stored = SafeStorage.getItem(LOCAL_CART_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error parsing local cart:', error);
    return [];
  }
};

const setLocalCart = (items: CartItem[]) => {
  try {
    const jsonString = JSON.stringify(items);
    SafeStorage.setItem(LOCAL_CART_KEY, jsonString);
  } catch (error) {
    console.error('Failed to save local cart:', error);
  }
};

const addToLocalCart = (itemData: AddToCartPayload): CartItem => {
  const items = getLocalCart();
  
  // Check if item already exists
  const existingIndex = items.findIndex(item => 
    item.product_type === itemData.product_type &&
    item.product_id === itemData.product_id &&
    item.variant_id === itemData.variant_id
  );

  if (existingIndex >= 0) {
    // Update quantity
    items[existingIndex].quantity += itemData.quantity;
    items[existingIndex].total_price = items[existingIndex].unit_price * items[existingIndex].quantity;
  } else {
    // Add new item
    const newItem: CartItem = {
      id: `local_${Date.now()}_${Math.random()}`,
      product_type: itemData.product_type,
      product_id: itemData.product_id,
      product_title: 'Unknown Product', // Will be updated when we have product details
      product_slug: '',
      variant_id: itemData.variant_id,
      variant_name: itemData.variant_id ? 'Selected Variant' : undefined,
      quantity: itemData.quantity,
      unit_price: 0, // Will be updated when we have product details
      total_price: 0, // Will be calculated
      currency: 'USD',
      selected_options: (itemData.selected_options || []).map(option => ({
        ...option,
        price: 0 // Will be updated when we have product details
      })),
      special_requests: itemData.special_requests,
      created_at: new Date().toISOString(),
    };
    items.push(newItem);
  }

  setLocalCart(items);
  
  const resultItem = items[existingIndex >= 0 ? existingIndex : items.length - 1];
  return resultItem;
};

const updateLocalCartItem = (itemId: string, itemData: UpdateCartItemPayload): CartItem | null => {
  const items = getLocalCart();
  const itemIndex = items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) return null;
  
  items[itemIndex] = {
    ...items[itemIndex],
    quantity: itemData.quantity || items[itemIndex].quantity,
    total_price: items[itemIndex].unit_price * (itemData.quantity || items[itemIndex].quantity),
    selected_options: (itemData.selected_options || []).map(option => ({
      ...option,
      price: 0 // Will be updated when we have product details
    })),
    special_requests: itemData.special_requests,
  };
  
  setLocalCart(items);
  return items[itemIndex];
};

const removeFromLocalCart = (itemId: string): boolean => {
  const items = getLocalCart();
  const filteredItems = items.filter(item => item.id !== itemId);
  
  if (filteredItems.length !== items.length) {
    setLocalCart(filteredItems);
    return true;
  }
  
  return false;
};

const clearLocalCart = (): boolean => {
  try {
    SafeStorage.removeItem(LOCAL_CART_KEY);
    return true;
  } catch {
    return false;
  }
};

// SWR fetchers
const cartFetcher = async (url: string, token: string) => {
  const response = await getCart(token);
  return response.data;
};

const cartSummaryFetcher = async (url: string, token: string) => {
  const response = await getCartSummary(token);
  return response.data;
};

// Hook for cart data - Updated for local cart support
export const useCart = () => {
  const { user, isAuthenticated } = useAuth();
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
  
  // For authenticated users, use SWR
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated && token ? ['/api/cart', token] : null,
    ([url, authToken]) => cartFetcher(url, authToken),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
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
  
  const { data, error, isLoading, mutate } = useSWR(
    isAuthenticated ? ['/api/cart/summary', token] : null,
    ([url, authToken]) => cartSummaryFetcher(url, authToken),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
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

// Hook for cart count (for navbar)
export const useCartCount = () => {
  const { totalItems } = useCart();
  return totalItems;
}; 