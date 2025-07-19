import { useState, useEffect, useCallback } from 'react';
import { CartService } from '../services/CartService';
import { Cart } from '../../domain/entities/Cart';
import { CartItem } from '../../domain/entities/CartItem';
import { CartRepository } from '../../domain/repositories/CartRepository';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { CartRepositoryImpl } from '../../infrastructure/repositories/CartRepositoryImpl';
import { ProductRepositoryImpl } from '../../infrastructure/repositories/ProductRepositoryImpl';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { useAuth } from './useAuth';

export interface UseCartReturn {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number, options?: AddToCartOptions) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, updates: UpdateCartItemOptions) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearError: () => void;
}

export interface AddToCartOptions {
  variantId?: string;
  date?: string;
  participants?: number;
}

export interface UpdateCartItemOptions {
  quantity?: number;
  date?: string;
  participants?: number;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Initialize cart service
  const apiClient = new ApiClient();
  const cartRepository = new CartRepositoryImpl(apiClient);
  const productRepository = new ProductRepositoryImpl(apiClient);
  const cartService = new CartService(cartRepository, productRepository);

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const loadCart = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This would be implemented with a GetCartUseCase
      // For now, we'll create an empty cart
      const emptyCart = Cart.create({
        userId: user.id,
        items: []
      });
      setCart(emptyCart);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load cart';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(async (productId: string, quantity: number, options?: AddToCartOptions) => {
    if (!user) {
      throw new Error('User must be logged in to add items to cart');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cartService.addToCart({
        userId: user.id,
        productId,
        quantity,
        variantId: options?.variantId,
        date: options?.date,
        participants: options?.participants
      });
      
      setCart(result.cart);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cartService, user]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!user) {
      throw new Error('User must be logged in to remove items from cart');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cartService.removeFromCart(user.id, itemId);
      setCart(result.cart);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from cart';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cartService, user]);

  const updateCartItem = useCallback(async (itemId: string, updates: UpdateCartItemOptions) => {
    if (!user) {
      throw new Error('User must be logged in to update cart items');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cartService.updateCartItem({
        userId: user.id,
        itemId,
        quantity: updates.quantity,
        date: updates.date,
        participants: updates.participants
      });
      
      setCart(result.cart);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update cart item';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cartService, user]);

  const clearCart = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in to clear cart');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await cartService.clearCart(user.id);
      setCart(null);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cartService, user]);

  const getCartTotal = useCallback(() => {
    return cart ? cart.getTotal() : 0;
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart ? cart.getItemCount() : 0;
  }, [cart]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cart,
    isLoading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
    getCartItemCount,
    clearError
  };
} 