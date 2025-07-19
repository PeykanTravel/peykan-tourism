import { ApiClient } from '../../infrastructure/api/client';

// Define ApiResponse interface locally
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface OrderItem {
  product_id: string;
  product_type: 'tour' | 'event' | 'transfer';
  quantity: number;
  price: number;
  [key: string]: any;
}

export interface Order {
  id: string;
  order_number: string;
  customer_info: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
  };
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
}

export interface CreateOrderData {
  customer_info: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
    special_requests?: string;
  };
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
}

export class OrdersService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.post('/orders/', orderData) as any;
      return {
        success: true,
        data: response.data,
        message: 'Order created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.message || 'Failed to create order',
        errors: error.response?.data?.errors
      };
    }
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await this.apiClient.get('/orders/') as any;
      return {
        success: true,
        data: response.data.results || response.data,
        message: 'Orders retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to retrieve orders',
        errors: error.response?.data?.errors
      };
    }
  }

  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await this.apiClient.get(`/orders/${orderId}/`) as any;
      return {
        success: true,
        data: response.data,
        message: 'Order retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.message || 'Failed to retrieve order',
        errors: error.response?.data?.errors
      };
    }
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      await this.apiClient.post(`/orders/${orderId}/cancel/`);
      return {
        success: true,
        data: null as any,
        message: 'Order cancelled successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.response?.data?.message || 'Failed to cancel order',
        errors: error.response?.data?.errors
      };
    }
  }
} 