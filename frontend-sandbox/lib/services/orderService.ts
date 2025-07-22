/**
 * Order Service for handling order-related API calls
 */

import { tokenService } from './tokenService';

export interface OrderItem {
  id: string;
  product_type: string;
  product_id: string;
  product_title: string;
  product_slug: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency: string;
  selected_options?: any;
  booking_date?: string;
  booking_time?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user: string;
  agent?: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  special_requests?: string;
  notes?: string;
}

export interface OrdersResponse {
  success: boolean;
  orders?: Order[];
  message?: string;
  errors?: Record<string, string[]>;
}

class OrderService {
  private baseUrl = '/api/v1/orders/';

  /**
   * Get user orders
   */
  async getUserOrders(): Promise<OrdersResponse> {
    try {
      const token = tokenService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.baseUrl}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get orders');
      }

      return {
        success: true,
        orders: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get orders',
      };
    }
  }

  /**
   * Get order details by order number
   */
  async getOrderDetails(orderNumber: string): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
      const token = tokenService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.baseUrl}${orderNumber}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get order details');
      }

      return {
        success: true,
        order: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get order details',
      };
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: any): Promise<{ success: boolean; order?: Order; message?: string }> {
    try {
      const token = tokenService.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return {
        success: true,
        order: data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to create order',
      };
    }
  }

  /**
   * Get order status label in Persian
   */
  getOrderStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'pending': 'در انتظار تایید',
      'confirmed': 'تایید شده',
      'cancelled': 'لغو شده',
      'completed': 'تکمیل شده',
      'refunded': 'بازپرداخت شده',
    };
    return statusLabels[status] || status;
  }

  /**
   * Get payment status label in Persian
   */
  getPaymentStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      'pending': 'در انتظار پرداخت',
      'paid': 'پرداخت شده',
      'failed': 'ناموفق',
      'refunded': 'بازپرداخت شده',
    };
    return statusLabels[status] || status;
  }

  /**
   * Get status color class
   */
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-green-100 text-green-800',
      'refunded': 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get payment status color class
   */
  getPaymentStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format date to Persian
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fa-IR');
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('fa-IR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

export const orderService = new OrderService(); 