import useSWR, { mutate } from 'swr';
import { getOrders, getOrderDetail, createOrder } from '../api/orders';
import type { Order, CreateOrderPayload } from '../api/orders';

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Fetcher functions
const ordersFetcher = async (url: string, token: string) => {
  const response = await getOrders(token);
  return response.data;
};

const orderDetailFetcher = async (orderNumber: string, token: string) => {
  const response = await getOrderDetail(orderNumber, token);
  return response.data;
};

// Hook for orders list
export const useOrders = () => {
  const token = getAuthToken();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? ['/api/orders', token] : null,
    ([url, authToken]) => ordersFetcher(url, authToken),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  const createNewOrder = async (orderData: CreateOrderPayload) => {
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
  
  const { data, error, isLoading, mutate } = useSWR(
    token && orderNumber ? [`/api/orders/${orderNumber}`, token] : null,
    ([url, authToken]) => orderDetailFetcher(orderNumber, authToken),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    order: data,
    isLoading,
    error,
    mutate,
  };
}; 