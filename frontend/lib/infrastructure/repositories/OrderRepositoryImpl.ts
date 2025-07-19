/**
 * Order Repository Implementation
 * API-based implementation of OrderRepository interface
 */

import { OrderRepository, OrderCreateData, OrderUpdateData, OrderSearchCriteria } from '../../domain/repositories/OrderRepository';
import { Order, OrderStatus, PaymentStatus } from '../../domain/entities/Order';
import { apiClient } from '../api/ApiClient';

export class OrderRepositoryImpl implements OrderRepository {
  private readonly baseUrl = '/orders';

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<Order | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToOrder(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding order by ID:', error);
      return null;
    }
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-number/${orderNumber}`);
      
      if (response.success && response.data) {
        return this.mapToOrder(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding order by order number:', error);
      return null;
    }
  }

  /**
   * Find orders by search criteria
   */
  async findByCriteria(criteria: OrderSearchCriteria): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (criteria.page) params.append('page', criteria.page.toString());
      if (criteria.limit) params.append('limit', criteria.limit.toString());
      if (criteria.user_id) params.append('user_id', criteria.user_id);
      if (criteria.status) params.append('status', criteria.status);
      if (criteria.payment_status) params.append('payment_status', criteria.payment_status);
      if (criteria.start_date) params.append('start_date', criteria.start_date.toISOString());
      if (criteria.end_date) params.append('end_date', criteria.end_date.toISOString());
      if (criteria.order_number) params.append('order_number', criteria.order_number);

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const orders = response.data.results?.map((orderData: any) => this.mapToOrder(orderData)) || [];
        
        return {
          orders,
          total: response.data.count || orders.length,
          page: response.data.page || 1,
          limit: response.data.limit || orders.length
        };
      }
      
      return { orders: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error finding orders:', error);
      return { orders: [], total: 0, page: 1, limit: 10 };
    }
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(userId: string, pagination?: { page: number; limit: number }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('user_id', userId);
      
      if (pagination) {
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
      }

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const orders = response.data.results?.map((orderData: any) => this.mapToOrder(orderData)) || [];
        
        return {
          orders,
          total: response.data.count || orders.length,
          page: response.data.page || 1,
          limit: response.data.limit || orders.length
        };
      }
      
      return { orders: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error finding orders by user ID:', error);
      return { orders: [], total: 0, page: 1, limit: 10 };
    }
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: OrderStatus): Promise<Order[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-status/${status}`);
      
      if (response.success && response.data) {
        return response.data.results?.map((orderData: any) => this.mapToOrder(orderData)) || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error finding orders by status:', error);
      return [];
    }
  }

  /**
   * Find orders by payment status
   */
  async findByPaymentStatus(paymentStatus: PaymentStatus): Promise<Order[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-payment-status/${paymentStatus}`);
      
      if (response.success && response.data) {
        return response.data.results?.map((orderData: any) => this.mapToOrder(orderData)) || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error finding orders by payment status:', error);
      return [];
    }
  }

  /**
   * Create a new order
   */
  async create(data: OrderCreateData): Promise<Order> {
    try {
      const requestData = this.mapFromOrderCreateData(data);
      
      const response = await apiClient.post(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToOrder(response.data);
      }
      
      throw new Error('Failed to create order');
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update order
   */
  async update(id: string, data: OrderUpdateData): Promise<Order> {
    try {
      const requestData = this.mapFromOrderUpdateData(data);
      
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToOrder(response.data);
      }
      
      throw new Error('Failed to update order');
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Delete order
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  /**
   * Check if order exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/exists/${id}`);
      return response.success && response.data?.exists === true;
    } catch (error) {
      console.error('Error checking order existence:', error);
      return false;
    }
  }

  /**
   * Check if order number exists
   */
  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/exists/number/${orderNumber}`);
      return response.success && response.data?.exists === true;
    } catch (error) {
      console.error('Error checking order number existence:', error);
      return false;
    }
  }

  /**
   * Get order statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
    byStatus: Record<string, number>;
    byPaymentStatus: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        byStatus: {},
        byPaymentStatus: {}
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        byStatus: {},
        byPaymentStatus: {}
      };
    }
  }

  /**
   * Map API response to Order entity
   */
  private mapToOrder(orderData: any): Order {
    return {
      id: orderData.id,
      order_number: orderData.order_number,
      user_id: orderData.user_id,
      status: orderData.status,
      payment_status: orderData.payment_status,
      items: orderData.items || [],
      subtotal: orderData.subtotal,
      tax_amount: orderData.tax_amount,
      discount_amount: orderData.discount_amount,
      total_amount: orderData.total_amount,
      currency: orderData.currency,
      customer_info: orderData.customer_info,
      billing_address: orderData.billing_address,
      shipping_address: orderData.shipping_address,
      payment_method: orderData.payment_method,
      transaction_id: orderData.transaction_id,
      notes: orderData.notes,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at
    };
  }

  /**
   * Map OrderCreateData to API request format
   */
  private mapFromOrderCreateData(data: OrderCreateData): any {
    return {
      user_id: data.user_id,
      items: data.items,
      customer_info: data.customer_info,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      discount_amount: data.discount_amount,
      total_amount: data.total_amount,
      currency: data.currency,
      payment_method: data.payment_method,
      notes: data.notes
    };
  }

  /**
   * Map OrderUpdateData to API request format
   */
  private mapFromOrderUpdateData(data: OrderUpdateData): any {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
    if (data.transaction_id !== undefined) updateData.transaction_id = data.transaction_id;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return updateData;
  }
} 