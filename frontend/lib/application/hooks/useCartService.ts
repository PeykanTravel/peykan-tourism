import { useState, useCallback } from 'react';
import { CartService } from '../services/CartService';
import { ApiClient } from '../../infrastructure/api/client';
import { AddToCartData, UpdateCartItemData } from '../../domain/repositories/CartRepository';
import { Cart, CartItem } from '../../domain/entities/Cart';
import { ApiResponse } from '../../domain/entities/Common';

// Create singleton instances
const apiClient = new ApiClient();
const cartService = new CartService(apiClient);

export const useCartService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<ApiResponse<T>>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request();
      
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Request failed');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cart Operations
  const getCart = useCallback(async (): Promise<Cart | null> => {
    return handleRequest(() => cartService.getCart());
  }, [handleRequest]);

  const addToCart = useCallback(async (data: AddToCartData): Promise<CartItem | null> => {
    return handleRequest(() => cartService.addToCart(data));
  }, [handleRequest]);

  const updateCartItem = useCallback(async (itemId: string, data: UpdateCartItemData): Promise<CartItem | null> => {
    return handleRequest(() => cartService.updateCartItem(itemId, data));
  }, [handleRequest]);

  const removeFromCart = useCallback(async (itemId: string): Promise<void> => {
    await handleRequest(() => cartService.removeFromCart(itemId));
  }, [handleRequest]);

  const clearCart = useCallback(async (): Promise<void> => {
    await handleRequest(() => cartService.clearCart());
  }, [handleRequest]);

  // Cart Validation
  const validateCart = useCallback(async (): Promise<{ isValid: boolean; errors: string[] } | null> => {
    return handleRequest(() => cartService.validateCart());
  }, [handleRequest]);

  const validateCartItem = useCallback(async (itemId: string): Promise<{ isValid: boolean; errors: string[] } | null> => {
    return handleRequest(() => cartService.validateCartItem(itemId));
  }, [handleRequest]);

  // Pricing
  const calculateCartTotal = useCallback(async (): Promise<{ total: number; breakdown: any } | null> => {
    return handleRequest(() => cartService.calculateCartTotal());
  }, [handleRequest]);

  const applyDiscount = useCallback(async (code: string): Promise<{ discount: any; newTotal: number } | null> => {
    return handleRequest(() => cartService.applyDiscount(code));
  }, [handleRequest]);

  const removeDiscount = useCallback(async (): Promise<{ newTotal: number } | null> => {
    return handleRequest(() => cartService.removeDiscount());
  }, [handleRequest]);

  // Persistence
  const syncCart = useCallback(async (): Promise<Cart | null> => {
    return handleRequest(() => cartService.syncCart());
  }, [handleRequest]);

  const mergeGuestCart = useCallback(async (guestCart: Cart): Promise<Cart | null> => {
    return handleRequest(() => cartService.mergeGuestCart(guestCart));
  }, [handleRequest]);

  return {
    // State
    isLoading,
    error,
    
    // Cart Operations
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Cart Validation
    validateCart,
    validateCartItem,
    
    // Pricing
    calculateCartTotal,
    applyDiscount,
    removeDiscount,
    
    // Persistence
    syncCart,
    mergeGuestCart,
    
    // Utilities
    clearError: () => setError(null),
  };
}; 