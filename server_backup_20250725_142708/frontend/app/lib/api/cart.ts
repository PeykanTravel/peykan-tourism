import axios from 'axios';
import type { Cart, CartItem, AddToCartPayload, UpdateCartItemPayload } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/cart/';

export const getCart = (token: string) => 
  axios.get<Cart>(API_URL, { headers: { Authorization: `Bearer ${token}` } });

export const getCartSummary = (token: string) => 
  axios.get<{
    total_items: number;
    subtotal: number;
    total_price: number;
    currency: string;
    items: CartItem[];
  }>(`${API_URL}summary/`, { headers: { Authorization: `Bearer ${token}` } });

export const getCartCount = (token: string) => 
  axios.get<{ count: number }>(`${API_URL}count/`, { headers: { Authorization: `Bearer ${token}` } });

export const addToCart = (data: AddToCartPayload, token: string) => 
  axios.post<{ message: string; cart_item: CartItem }>(`${API_URL}add/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const updateCartItem = (item_id: string, data: UpdateCartItemPayload, token: string) => 
  axios.put<{ message: string; cart_item: CartItem }>(`${API_URL}items/${item_id}/update/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const removeFromCart = (item_id: string, token: string) => 
  axios.delete<{ message: string }>(`${API_URL}items/${item_id}/remove/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const clearCart = (token: string) => 
  axios.delete<{ message: string }>(`${API_URL}clear/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const mergeCart = (session_key: string, token: string) => 
  axios.post<{ message: string; cart: Cart }>(`${API_URL}merge/`, { session_key }, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Re-export types for convenience
export type { Cart, CartItem, AddToCartPayload, UpdateCartItemPayload }; 