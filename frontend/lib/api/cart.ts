import axios from 'axios';
import type { 
  CartResponse, 
  CartItemResponse, 
  CartSummaryResponse,
  AddToCartPayload, 
  UpdateCartItemPayload 
} from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Cart API endpoints
export const getCart = (token: string) => 
  axios.get<CartResponse>(`${API_URL}/cart/`, { headers: { Authorization: `Bearer ${token}` } });

export const getCartSummary = (token: string) => 
  axios.get<CartSummaryResponse>(`${API_URL}/cart/summary/`, { headers: { Authorization: `Bearer ${token}` } });

export const addToCart = (data: AddToCartPayload, token: string) => 
  axios.post<{ message: string; cart_item: CartItemResponse }>(`${API_URL}/cart/add/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const updateCartItem = (itemId: string, data: UpdateCartItemPayload, token: string) => 
  axios.patch<{ message: string; cart_item: CartItemResponse }>(`${API_URL}/cart/items/${itemId}/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const removeFromCart = (itemId: string, token: string) => 
  axios.delete<{ message: string }>(`${API_URL}/cart/items/${itemId}/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const clearCart = (token: string) => 
  axios.delete<{ message: string }>(`${API_URL}/cart/clear/`, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Event-specific cart operations
export const addEventSeatsToCart = (data: {
  event_id: string;
  performance_id: string;
  ticket_type_id: string;
  seats: Array<{
    seat_id: string;
    seat_number: string;
    row_number: string;
    section: string;
    price: number;
  }>;
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
}, token: string) => 
  axios.post<{ message: string; cart_item: CartItemResponse }>(`${API_URL}/cart/events/seats/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Tour-specific cart operations
export const addTourToCart = (data: {
  tour_id: string;
  variant_id?: string;
  quantity: number;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
}, token: string) => 
  axios.post<{ message: string; cart_item: CartItemResponse }>(`${API_URL}/cart/tours/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Transfer-specific cart operations
export const addTransferToCart = (data: {
  transfer_id: string;
  vehicle_type_id?: string;
  quantity: number;
  passengers?: {
    adults: number;
    children: number;
    infants: number;
  };
  selected_options?: Array<{
    option_id: string;
    quantity: number;
  }>;
  special_requests?: string;
}, token: string) => 
  axios.post<{ message: string; cart_item: CartItemResponse }>(`${API_URL}/cart/transfers/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  }); 