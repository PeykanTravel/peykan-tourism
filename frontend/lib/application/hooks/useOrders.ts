import { useState, useEffect, useCallback } from 'react';
import { OrderService } from '../services/OrderService';
import { Order } from '../../domain/entities/Order';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { CartRepository } from '../../domain/repositories/CartRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { OrderRepositoryImpl } from '../../infrastructure/repositories/OrderRepositoryImpl';
import { CartRepositoryImpl } from '../../infrastructure/repositories/CartRepositoryImpl';
import { UserRepositoryImpl } from '../../infrastructure/repositories/UserRepositoryImpl';
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { useAuth } from './useAuth';

export interface UseOrdersReturn {
  orders: Order[];
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
  getUserOrders: (filters?: GetUserOrdersFilters) => Promise<void>;
  getOrderById: (orderId: string) => Promise<void>;
  createOrder: (data: CreateOrderData) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  clearError: () => void;
  clearOrders: () => void;
}

export interface GetUserOrdersFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateOrderData {
  cartId: string;
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  currency?: string;
  notes?: string;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const { user } = useAuth();

  // Initialize order service
  const apiClient = new ApiClient();
  const orderRepository = new OrderRepositoryImpl(apiClient);
  const cartRepository = new CartRepositoryImpl(apiClient);
  const userRepository = new UserRepositoryImpl(apiClient);
  const orderService = new OrderService(orderRepository, cartRepository, userRepository);

  const getUserOrders = useCallback(async (filters?: GetUserOrdersFilters) => {
    if (!user) {
      throw new Error('User must be logged in to fetch orders');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await orderService.getUserOrders({
        userId: user.id,
        status: filters?.status,
        page: filters?.page || 1,
        limit: filters?.limit || 10
      });
      
      setOrders(result.orders);
      setTotal(result.total);
      setPage(result.page);
      setHasMore(result.hasMore);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, user]);

  const getOrderById = useCallback(async (orderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await orderService.getOrderById(orderId);
      setOrder(result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [orderService]);

  const createOrder = useCallback(async (data: CreateOrderData) => {
    if (!user) {
      throw new Error('User must be logged in to create orders');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await orderService.createOrder({
        userId: user.id,
        cartId: data.cartId,
        contactInfo: data.contactInfo,
        paymentMethod: data.paymentMethod,
        currency: data.currency,
        notes: data.notes
      });
      
      setOrder(result.order);
      
      // Refresh orders list
      await getUserOrders();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, user, getUserOrders]);

  const cancelOrder = useCallback(async (orderId: string) => {
    if (!user) {
      throw new Error('User must be logged in to cancel orders');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await orderService.cancelOrder(orderId, user.id);
      
      // Refresh orders list
      await getUserOrders();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [orderService, user, getUserOrders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearOrders = useCallback(() => {
    setOrders([]);
    setOrder(null);
    setTotal(0);
    setPage(1);
    setHasMore(false);
  }, []);

  return {
    orders,
    order,
    isLoading,
    error,
    total,
    page,
    hasMore,
    getUserOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    clearError,
    clearOrders
  };
} 