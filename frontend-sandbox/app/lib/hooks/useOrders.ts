import { useCustomHook } from '../../../lib/hooks/hookFactory';
import { getOrders, getOrderDetail, createOrder } from '../api/orders';
import type { Order, CreateOrderPayload } from '../api/orders';

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Fetcher functions
const ordersFetcher = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');
  const response = await getOrders(token);
  return response.data;
};

const orderDetailFetcher = async (orderNumber: string) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');
  const response = await getOrderDetail(orderNumber, token);
  return response.data;
};

// Hook for orders list
export const useOrders = () => {
  const token = getAuthToken();
  
  const { data, error, isLoading, mutate } = useCustomHook(
    token ? 'orders' : null,
    ordersFetcher
  );

  const createNewOrder = async (orderData: CreateOrderPayload) => {
    const token = getAuthToken();
    if (!token) throw new Error('Authentication required');
    
    try {
      const response = await createOrder(orderData, token);
      await mutate();
      return { success: true, order: response.data.order };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create order' 
      };
    }
  };

  return {
    orders: data || [],
    isLoading,
    error,
    createOrder: createNewOrder,
    mutate,
  };
};

// Hook for order detail
export const useOrderDetail = (orderNumber: string) => {
  const token = getAuthToken();
  
  const { data, error, isLoading, mutate } = useCustomHook(
    token && orderNumber ? ['order-detail', orderNumber] : null,
    () => orderDetailFetcher(orderNumber)
  );

  return {
    order: data,
    isLoading,
    error,
    mutate,
  };
}; 