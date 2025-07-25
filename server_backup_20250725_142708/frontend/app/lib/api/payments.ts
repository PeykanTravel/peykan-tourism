import axios from 'axios';
import type { Payment, CreatePaymentPayload } from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/payments/';

export const getPayments = (token: string) => 
  axios.get<Payment[]>(API_URL, { headers: { Authorization: `Bearer ${token}` } });

export const getPaymentDetail = (payment_id: string, token: string) => 
  axios.get<Payment>(`${API_URL}${payment_id}/`, { headers: { Authorization: `Bearer ${token}` } });

export const createPayment = (data: CreatePaymentPayload, token: string) => 
  axios.post<{ message: string; payment: Payment }>(`${API_URL}create/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Re-export types for convenience
export type { Payment, CreatePaymentPayload }; 