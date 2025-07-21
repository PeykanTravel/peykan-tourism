import axios from 'axios';
import type { Order, CreateOrderPayload } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const getOrders = (token: string) => 
  axios.get<Order[]>(`${API_URL}/orders/`, { headers: { Authorization: `Bearer ${token}` } });

export const getOrderDetail = (order_number: string, token: string) => 
  axios.get<Order>(`${API_URL}/orders/${order_number}/`, { headers: { Authorization: `Bearer ${token}` } });

export const createOrder = (data: CreateOrderPayload, token: string) => 
  axios.post<{ message: string; order: Order }>(`${API_URL}/orders/create/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const updateOrder = (order_number: string, data: Partial<Order>, token: string) => 
  axios.patch<{ message: string; order: Order }>(`${API_URL}/orders/${order_number}/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const cancelOrder = (order_number: string, token: string) => 
  axios.post<{ message: string }>(`${API_URL}/orders/${order_number}/cancel/`, {}, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Re-export types for convenience
export type { Order, CreateOrderPayload }; 