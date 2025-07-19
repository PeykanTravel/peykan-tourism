/**
 * Order Repository Implementation
 * API-based implementation of OrderRepository interface
 */

import { OrderRepository, OrderCreateData, OrderUpdateData, OrderSearchCriteria } from '../../domain/repositories/OrderRepository';
import { OrderAggregate } from '../../domain/aggregates/OrderAggregate';
import { Order, OrderStatus, PaymentStatus } from '../../domain/entities/Order';
import { Price } from '../../domain/value-objects/Price';
import { Currency } from '../../domain/value-objects/Currency';
import { ContactInfo } from '../../domain/value-objects/ContactInfo';
import { apiClient, ApiResponse } from '../api/ApiClient';

export class OrderRepositoryImpl implements OrderRepository {
  private readonly baseUrl = '/orders';

  /**
   * Find order by ID
   */
  async findById(id: string): Promise<OrderAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
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
  async findByOrderNumber(orderNumber: string): Promise<OrderAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/by-number/${orderNumber}`);
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding order by order number:', error);
      return null;
    }
  }

  /**
   * Find orders with search criteria
   */
  async find(criteria: OrderSearchCriteria): Promise<{
    orders: OrderAggregate[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (criteria.page) params.append('page', criteria.page.toString());
      if (criteria.limit) params.append('limit', criteria.limit.toString());
      if (criteria.search) params.append('search', criteria.search);
      if (criteria.status) params.append('status', criteria.status);
      if (criteria.paymentStatus) params.append('payment_status', criteria.paymentStatus);
      if (criteria.userId) params.append('user_id', criteria.userId);
      if (criteria.dateFrom) params.append('date_from', criteria.dateFrom.toISOString());
      if (criteria.dateTo) params.append('date_to', criteria.dateTo.toISOString());
      if (criteria.minAmount !== undefined) params.append('min_amount', criteria.minAmount.toString());
      if (criteria.maxAmount !== undefined) params.append('max_amount', criteria.maxAmount.toString());
      if (criteria.currency) params.append('currency', criteria.currency);
      if (criteria.sortBy) params.append('sort_by', criteria.sortBy);
      if (criteria.sortOrder) params.append('sort_order', criteria.sortOrder);

      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const orders = response.data.results.map((orderData: any) => this.mapToOrderAggregate(orderData));
        
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
    orders: OrderAggregate[];
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

      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const orders = response.data.results.map((orderData: any) => this.mapToOrderAggregate(orderData));
        
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
   * Create new order
   */
  async create(data: OrderCreateData): Promise<OrderAggregate> {
    try {
      const requestData = this.mapFromOrderCreateData(data);
      
      const response = await apiClient.post<ApiResponse<any>>(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
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
  async update(id: string, data: OrderUpdateData): Promise<OrderAggregate> {
    try {
      const requestData = this.mapFromOrderUpdateData(data);
      
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
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
      const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: OrderStatus, notes?: string): Promise<OrderAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/status`, {
        status,
        notes
      });
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
      }
      
      throw new Error('Failed to update order status');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus, transactionId?: string): Promise<OrderAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/payment-status`, {
        paymentStatus,
        transactionId
      });
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
      }
      
      throw new Error('Failed to update payment status');
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancel(id: string, reason?: string): Promise<OrderAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/cancel`, {
        reason
      });
      
      if (response.success && response.data) {
        return this.mapToOrderAggregate(response.data);
      }
      
      throw new Error('Failed to cancel order');
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
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
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/statistics`);
      
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
   * Map API response to OrderAggregate
   */
  private mapToOrderAggregate(orderData: any): OrderAggregate {
    // Create ContactInfo value object
    const contactInfo = ContactInfo.create(
      orderData.contactInfo.firstName,
      orderData.contactInfo.lastName,
      orderData.contactInfo.email,
      orderData.contactInfo.phone,
      orderData.contactInfo.address,
      orderData.contactInfo.city,
      orderData.contactInfo.country
    );

    // Create Order entity
    const order = Order.create(
      orderData.id,
      orderData.orderNumber,
      orderData.userId,
      orderData.status as OrderStatus,
      orderData.items.map((itemData: any) => ({
        id: itemData.id,
        productId: itemData.productId,
        productType: itemData.productType,
        productTitle: itemData.productTitle,
        productSlug: itemData.productSlug,
        variantId: itemData.variantId,
        variantName: itemData.variantName,
        quantity: itemData.quantity,
        unitPrice: Price.create(itemData.unitPrice.amount, itemData.unitPrice.currency),
        totalPrice: Price.create(itemData.totalPrice.amount, itemData.totalPrice.currency),
        selectedOptions: itemData.selectedOptions || [],
        metadata: itemData.metadata || {}
      })),
      Price.create(orderData.subtotal.amount, orderData.subtotal.currency),
      Price.create(orderData.taxAmount.amount, orderData.taxAmount.currency),
      Price.create(orderData.discountAmount.amount, orderData.discountAmount.currency),
      Price.create(orderData.totalAmount.amount, orderData.totalAmount.currency),
      Currency.create(orderData.currency),
      contactInfo,
      orderData.participants || [],
      {
        id: orderData.payment.id,
        method: orderData.payment.method,
        status: orderData.payment.status as PaymentStatus,
        amount: Price.create(orderData.payment.amount.amount, orderData.payment.amount.currency),
        transactionId: orderData.payment.transactionId,
        gatewayResponse: orderData.payment.gatewayResponse,
        processedAt: orderData.payment.processedAt ? new Date(orderData.payment.processedAt) : undefined,
        metadata: orderData.payment.metadata || {}
      },
      orderData.notes,
      orderData.metadata || {},
      orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
      orderData.updatedAt ? new Date(orderData.updatedAt) : new Date(),
      orderData.confirmedAt ? new Date(orderData.confirmedAt) : undefined,
      orderData.completedAt ? new Date(orderData.completedAt) : undefined,
      orderData.cancelledAt ? new Date(orderData.cancelledAt) : undefined
    );

    // Create OrderAggregate
    const orderAggregate = OrderAggregate.create(order);

    return orderAggregate;
  }

  /**
   * Map OrderCreateData to API request format
   */
  private mapFromOrderCreateData(data: OrderCreateData): any {
    return {
      orderNumber: data.orderNumber,
      userId: data.userId,
      contactInfo: {
        firstName: data.contactInfo.getFirstName(),
        lastName: data.contactInfo.getLastName(),
        email: data.contactInfo.getEmail(),
        phone: data.contactInfo.getPhone(),
        address: data.contactInfo.getAddress(),
        city: data.contactInfo.getCity(),
        country: data.contactInfo.getCountry()
      },
      items: data.items.map(item => ({
        productId: item.productId,
        productType: item.productType,
        productTitle: item.productTitle,
        productSlug: item.productSlug,
        productImage: item.productImage,
        unitPrice: {
          amount: item.unitPrice.getAmount(),
          currency: item.unitPrice.getCurrency().getCode()
        },
        quantity: item.quantity,
        variantId: item.variantId,
        variantName: item.variantName,
        selectedOptions: item.selectedOptions
      })),
      subtotal: {
        amount: data.subtotal.getAmount(),
        currency: data.subtotal.getCurrency().getCode()
      },
      tax: {
        amount: data.tax.getAmount(),
        currency: data.tax.getCurrency().getCode()
      },
      discount: {
        amount: data.discount.getAmount(),
        currency: data.discount.getCurrency().getCode()
      },
      total: {
        amount: data.total.getAmount(),
        currency: data.total.getCurrency().getCode()
      },
      currency: data.currency.getCode(),
      status: data.status,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      specialRequests: data.specialRequests,
      billingAddress: data.billingAddress
    };
  }

  /**
   * Map OrderUpdateData to API request format
   */
  private mapFromOrderUpdateData(data: OrderUpdateData): any {
    const updateData: any = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.transactionId !== undefined) updateData.transactionId = data.transactionId;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return updateData;
  }
} 