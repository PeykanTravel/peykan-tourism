/**
 * Cart Context
 * 
 * Manages shopping cart state and provides cart methods
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartItem {
  id: string;
  product_id: string;
  product_type: 'event' | 'tour' | 'transfer';
  title: string;
  price: number;
  quantity: number;
  image?: string;
  date?: string;
  time?: string;
  location?: string;
  options?: Record<string, any>;
}

interface CartContextType {
  cartItems: CartItem[];
  cartTotal: number;
  itemCount: number;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, productType: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `${item.product_type}_${item.product_id}_${Date.now()}`,
    };

    setCartItems(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(
        cartItem => 
          cartItem.product_id === item.product_id && 
          cartItem.product_type === item.product_type
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      } else {
        // Add new item
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (productId: string, productType: string) => {
    return cartItems.some(
      item => 
        item.product_id === productId && 
        item.product_type === productType
    );
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const value: CartContextType = {
    cartItems,
    cartTotal,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 