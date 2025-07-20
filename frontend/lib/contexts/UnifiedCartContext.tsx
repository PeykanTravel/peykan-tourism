'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { tokenService } from '../services/tokenService';

// Unified cart item interface that matches backend structure
export interface CartItem {
  id: string;
  product_type: 'tour' | 'event' | 'transfer';
  product_id: string;
  product_title?: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  options_total: number;
  currency: string;
  booking_date: string;
  booking_time: string;
  selected_options: Array<{
    option_id: string;
    quantity: number;
    price?: number;
  }>;
  booking_data: {
    participants?: {
      adult: number;
      child: number;
      infant: number;
    };
    special_requests?: string;
    schedule_id?: string;
  };
  // Display fields
  title?: string;
  image?: string;
  duration?: string;
  location?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  isLoading: boolean;
  isClient: boolean;
  error: string | null;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'id' | 'total_price'>) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, updates: Partial<CartItem>) => Promise<{ success: boolean; error?: string }>;
  removeItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  getItemById: (id: string) => CartItem | undefined;
  isInCart: (productId: string, variantId?: string) => boolean;
  refreshCart: () => Promise<void>;
}

type CartContextType = CartState & CartActions;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function UnifiedCartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    currency: 'USD',
    isLoading: true,
    isClient: false,
    error: null,
  });

  // Initialize client-side state
  useEffect(() => {
    setState(prev => ({ ...prev, isClient: true }));
  }, []);

  // Load cart when authentication state changes
  useEffect(() => {
    if (state.isClient) {
      if (isAuthenticated && user) {
        loadCartFromBackend();
      } else {
        loadCartFromLocalStorage();
      }
    }
  }, [isAuthenticated, user, state.isClient]);

  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const items = parsedCart.items || [];
        updateState({ items, isLoading: false });
      } else {
        updateState({ items: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      updateState({ items: [], isLoading: false, error: 'Failed to load cart' });
    }
  }, []);

  const loadCartFromBackend = useCallback(async () => {
    try {
      const token = tokenService.getAccessToken();
      if (!token) {
        console.warn('No access token found, loading from localStorage');
        loadCartFromLocalStorage();
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/cart/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        const backendItems = cartData.items || [];
        
        // Convert backend items to frontend format
        const convertedItems: CartItem[] = backendItems.map((item: any) => ({
          id: item.id,
          product_type: item.product_type,
          product_id: item.product_id,
          product_title: item.product_title,
          variant_id: item.variant_id,
          variant_name: item.variant_name,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          total_price: parseFloat(item.total_price),
          options_total: parseFloat(item.options_total || 0),
          currency: item.currency,
          booking_date: item.booking_date,
          booking_time: item.booking_time,
          selected_options: item.selected_options || [],
          booking_data: item.booking_data || {},
          // Display fields
          title: item.product_title || item.variant_name,
          image: item.image,
          duration: item.duration,
          location: item.location,
        }));

        updateState({ items: convertedItems, isLoading: false });
        
        // Sync with localStorage
        localStorage.setItem('cart', JSON.stringify({ items: convertedItems }));
      } else if (response.status === 401) {
        console.error('Authentication failed, clearing cart');
        updateState({ items: [], isLoading: false, error: 'Authentication failed' });
        localStorage.removeItem('cart');
        
        // Try to refresh token
        const refreshSuccess = await tokenService.refreshToken();
        if (refreshSuccess) {
          loadCartFromBackend();
        }
      } else {
        console.error('Failed to load cart from backend:', response.status);
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      loadCartFromLocalStorage();
    }
  }, [loadCartFromLocalStorage]);

  const updateState = useCallback((updates: Partial<CartState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Calculate totals
      if (updates.items) {
        newState.totalItems = updates.items.reduce((sum, item) => {
          return sum + (item.booking_data.participants ? 
            item.booking_data.participants.adult + item.booking_data.participants.child + item.booking_data.participants.infant :
            item.quantity);
        }, 0);
        
        newState.totalPrice = updates.items.reduce((sum, item) => sum + item.total_price, 0);
        newState.currency = updates.items.length > 0 ? updates.items[0].currency : 'USD';
      }
      
      return newState;
    });
  }, []);

  const addItem = useCallback(async (newItem: Omit<CartItem, 'id' | 'total_price'>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (!token) {
          return { success: false, error: 'No authentication token' };
        }

        const response = await fetch('http://localhost:8000/api/v1/cart/add/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        });

        if (response.ok) {
          const result = await response.json();
          const backendItem = result.cart_item;
          
          // Convert backend item to frontend format
          const convertedItem: CartItem = {
            id: backendItem.id,
            product_type: backendItem.product_type,
            product_id: backendItem.product_id,
            product_title: backendItem.product_title,
            variant_id: backendItem.variant_id,
            variant_name: backendItem.variant_name,
            quantity: backendItem.quantity,
            unit_price: parseFloat(backendItem.unit_price),
            total_price: parseFloat(backendItem.total_price),
            options_total: parseFloat(backendItem.options_total || 0),
            currency: backendItem.currency,
            booking_date: backendItem.booking_date,
            booking_time: backendItem.booking_time,
            selected_options: backendItem.selected_options || [],
            booking_data: backendItem.booking_data || {},
            title: backendItem.product_title || backendItem.variant_name,
          };

          // Update local state
          const existingIndex = state.items.findIndex(item => item.id === convertedItem.id);
          let updatedItems;
          
          if (existingIndex >= 0) {
            updatedItems = [...state.items];
            updatedItems[existingIndex] = convertedItem;
          } else {
            updatedItems = [...state.items, convertedItem];
          }

          updateState({ items: updatedItems });
          
          // Sync with localStorage
          localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
          
          return { success: true };
        } else {
          const errorData = await response.json();
          return { success: false, error: errorData.error || 'Failed to add item' };
        }
      } else {
        // For unauthenticated users, store in localStorage
        const tempItem: CartItem = {
          ...newItem,
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          total_price: newItem.unit_price * newItem.quantity + newItem.options_total,
        };
        
        const updatedItems = [...state.items, tempItem];
        updateState({ items: updatedItems });
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { success: false, error: 'Failed to add item to cart' };
    }
  }, [isAuthenticated, state.items, updateState]);

  const updateItem = useCallback(async (id: string, updates: Partial<CartItem>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (!token) {
          return { success: false, error: 'No authentication token' };
        }

        const response = await fetch(`http://localhost:8000/api/v1/cart/items/${id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const result = await response.json();
          const backendItem = result.cart_item;
          
          // Update local state
          const updatedItems = state.items.map(item =>
            item.id === id ? { ...item, ...backendItem } : item
          );

          updateState({ items: updatedItems });
          localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
          
          return { success: true };
        } else {
          const errorData = await response.json();
          return { success: false, error: errorData.error || 'Failed to update item' };
        }
      } else {
        // For unauthenticated users, update localStorage
        const updatedItems = state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        );

        updateState({ items: updatedItems });
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, error: 'Failed to update item' };
    }
  }, [isAuthenticated, state.items, updateState]);

  const removeItem = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (!token) {
          return { success: false, error: 'No authentication token' };
        }

        const response = await fetch(`http://localhost:8000/api/v1/cart/items/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const updatedItems = state.items.filter(item => item.id !== id);
          updateState({ items: updatedItems });
          localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
          
          return { success: true };
        } else {
          const errorData = await response.json();
          return { success: false, error: errorData.error || 'Failed to remove item' };
        }
      } else {
        // For unauthenticated users, remove from localStorage
        const updatedItems = state.items.filter(item => item.id !== id);
        updateState({ items: updatedItems });
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
      return { success: false, error: 'Failed to remove item' };
    }
  }, [isAuthenticated, state.items, updateState]);

  const clearCart = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (!token) {
          return { success: false, error: 'No authentication token' };
        }

        const response = await fetch('http://localhost:8000/api/v1/cart/clear/', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          updateState({ items: [] });
          localStorage.removeItem('cart');
          
          return { success: true };
        } else {
          const errorData = await response.json();
          return { success: false, error: errorData.error || 'Failed to clear cart' };
        }
      } else {
        // For unauthenticated users, clear localStorage
        updateState({ items: [] });
        localStorage.removeItem('cart');
        
        return { success: true };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'Failed to clear cart' };
    }
  }, [isAuthenticated, updateState]);

  const getItemById = useCallback((id: string): CartItem | undefined => {
    return state.items.find(item => item.id === id);
  }, [state.items]);

  const isInCart = useCallback((productId: string, variantId?: string): boolean => {
    return state.items.some(item => 
      item.product_id === productId && 
      (variantId ? item.variant_id === variantId : true)
    );
  }, [state.items]);

  const refreshCart = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await loadCartFromBackend();
    } else {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated, loadCartFromBackend, loadCartFromLocalStorage]);

  const value: CartContextType = {
    ...state,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemById,
    isInCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useUnifiedCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useUnifiedCart must be used within a UnifiedCartProvider');
  }
  return context;
} 