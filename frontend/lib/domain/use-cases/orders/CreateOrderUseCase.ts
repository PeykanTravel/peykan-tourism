/**
 * Create Order Use Case
 * Handles order creation and management logic
 */

import { OrderRepository, OrderCreateData, OrderUpdateData } from '../../repositories/OrderRepository';
import { CartRepository } from '../../repositories/CartRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { OrderAggregate } from '../../aggregates/OrderAggregate';
import { CartAggregate } from '../../aggregates/CartAggregate';
import { UserAggregate } from '../../aggregates/UserAggregate';
import { Order, OrderStatus, PaymentStatus } from '../../entities/Order';
import { Price } from '../../value-objects/Price';
import { Currency } from '../../value-objects/Currency';
import { ContactInfo } from '../../value-objects/ContactInfo';

export interface CreateOrderRequest {
  cartId: string;
  userId?: string;
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
  };
  specialRequests?: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash';
  billingAddress?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}

export interface CreateOrderResponse {
  success: boolean;
  order?: OrderAggregate;
  message?: string;
  errors?: string[];
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  order?: OrderAggregate;
  message?: string;
  errors?: string[];
}

export interface UpdatePaymentStatusRequest {
  orderId: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  notes?: string;
}

export interface UpdatePaymentStatusResponse {
  success: boolean;
  order?: OrderAggregate;
  message?: string;
  errors?: string[];
}

export interface CancelOrderRequest {
  orderId: string;
  reason?: string;
}

export interface CancelOrderResponse {
  success: boolean;
  order?: OrderAggregate;
  message?: string;
  errors?: string[];
}

export interface GetOrderRequest {
  orderId: string;
}

export interface GetOrderResponse {
  success: boolean;
  order?: OrderAggregate;
  message?: string;
  errors?: string[];
}

export interface GetUserOrdersRequest {
  userId: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface GetUserOrdersResponse {
  success: boolean;
  orders?: OrderAggregate[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  errors?: string[];
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Create a new order from cart
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate input
      const validation = this.validateCreateOrderRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get cart
      const cart = await this.cartRepository.findById(request.cartId);
      if (!cart) {
        return {
          success: false,
          message: 'Cart not found',
          errors: ['Cart does not exist']
        };
      }

      // Check if cart is empty
      if (cart.isEmpty()) {
        return {
          success: false,
          message: 'Cart is empty',
          errors: ['Cannot create order from empty cart']
        };
      }

      // Check if cart is expired
      if (cart.isExpired()) {
        return {
          success: false,
          message: 'Cart has expired',
          errors: ['Cart has expired and cannot be used to create order']
        };
      }

      // Get user if provided
      let user: UserAggregate | null = null;
      if (request.userId) {
        user = await this.userRepository.findById(request.userId);
        if (!user) {
          return {
            success: false,
            message: 'User not found',
            errors: ['User does not exist']
          };
        }
      }

      // Create contact info
      const contactInfo = ContactInfo.create(
        request.contactInfo.firstName,
        request.contactInfo.lastName,
        request.contactInfo.email,
        request.contactInfo.phone,
        request.contactInfo.address,
        request.contactInfo.city,
        request.contactInfo.country
      );

      // Create order data
      const orderData: OrderCreateData = {
        orderNumber: this.generateOrderNumber(),
        userId: user?.getId(),
        contactInfo: contactInfo,
        items: cart.getItems().map(item => ({
          productId: item.productId,
          productType: item.productType,
          productTitle: item.productTitle,
          productSlug: item.productSlug,
          productImage: item.productImage,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          variantId: item.variantId,
          variantName: item.variantName,
          selectedOptions: item.selectedOptions
        })),
        subtotal: cart.getSubtotal(),
        tax: cart.getTax(),
        discount: cart.getDiscount(),
        total: cart.getTotal(),
        currency: cart.getCurrency(),
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: request.paymentMethod,
        specialRequests: request.specialRequests,
        billingAddress: request.billingAddress
      };

      // Create order
      const order = await this.orderRepository.create(orderData);

      // Clear cart after successful order creation
      await this.cartRepository.clear(request.cartId);

      return {
        success: true,
        order,
        message: 'Order created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Order creation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateOrderStatusRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get order
      const order = await this.orderRepository.findById(request.orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          errors: ['Order does not exist']
        };
      }

      // Check if status transition is valid
      if (!this.isValidStatusTransition(order.getStatus(), request.status)) {
        return {
          success: false,
          message: 'Invalid status transition',
          errors: [`Cannot change status from ${order.getStatus()} to ${request.status}`]
        };
      }

      // Update order status
      const updateData: OrderUpdateData = {
        status: request.status,
        notes: request.notes
      };

      const updatedOrder = await this.orderRepository.update(request.orderId, updateData);

      return {
        success: true,
        order: updatedOrder,
        message: 'Order status updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to update order status',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(request: UpdatePaymentStatusRequest): Promise<UpdatePaymentStatusResponse> {
    try {
      // Validate input
      const validation = this.validateUpdatePaymentStatusRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Get order
      const order = await this.orderRepository.findById(request.orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          errors: ['Order does not exist']
        };
      }

      // Update payment status
      const updateData: OrderUpdateData = {
        paymentStatus: request.paymentStatus,
        transactionId: request.transactionId,
        notes: request.notes
      };

      const updatedOrder = await this.orderRepository.update(request.orderId, updateData);

      return {
        success: true,
        order: updatedOrder,
        message: 'Payment status updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to update payment status',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(request: CancelOrderRequest): Promise<CancelOrderResponse> {
    try {
      // Validate input
      if (!request.orderId) {
        return {
          success: false,
          message: 'Order ID is required',
          errors: ['Order ID must be provided']
        };
      }

      // Get order
      const order = await this.orderRepository.findById(request.orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          errors: ['Order does not exist']
        };
      }

      // Check if order can be cancelled
      if (!this.canCancelOrder(order.getStatus())) {
        return {
          success: false,
          message: 'Order cannot be cancelled',
          errors: [`Order with status ${order.getStatus()} cannot be cancelled`]
        };
      }

      // Cancel order
      const updateData: OrderUpdateData = {
        status: OrderStatus.CANCELLED,
        notes: request.reason
      };

      const cancelledOrder = await this.orderRepository.update(request.orderId, updateData);

      return {
        success: true,
        order: cancelledOrder,
        message: 'Order cancelled successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to cancel order',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(request: GetOrderRequest): Promise<GetOrderResponse> {
    try {
      // Validate input
      if (!request.orderId) {
        return {
          success: false,
          message: 'Order ID is required',
          errors: ['Order ID must be provided']
        };
      }

      // Get order
      const order = await this.orderRepository.findById(request.orderId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          errors: ['Order does not exist']
        };
      }

      return {
        success: true,
        order,
        message: 'Order retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to get order',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(request: GetUserOrdersRequest): Promise<GetUserOrdersResponse> {
    try {
      // Validate input
      if (!request.userId) {
        return {
          success: false,
          message: 'User ID is required',
          errors: ['User ID must be provided']
        };
      }

      // Get user orders
      const result = await this.orderRepository.findByUserId(
        request.userId,
        {
          page: request.page || 1,
          limit: request.limit || 10,
          status: request.status
        }
      );

      return {
        success: true,
        orders: result.orders,
        total: result.total,
        page: result.page,
        limit: result.limit,
        message: 'User orders retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to get user orders',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Check if status transition is valid
   */
  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Check if order can be cancelled
   */
  private canCancelOrder(status: OrderStatus): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(status);
  }

  /**
   * Validate create order request
   */
  private validateCreateOrderRequest(request: CreateOrderRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.cartId) {
      errors.push('Cart ID is required');
    }

    if (!request.contactInfo) {
      errors.push('Contact information is required');
    } else {
      if (!request.contactInfo.firstName || request.contactInfo.firstName.trim().length === 0) {
        errors.push('First name is required');
      }
      if (!request.contactInfo.lastName || request.contactInfo.lastName.trim().length === 0) {
        errors.push('Last name is required');
      }
      if (!request.contactInfo.email || !this.isValidEmail(request.contactInfo.email)) {
        errors.push('Valid email address is required');
      }
      if (!request.contactInfo.phone || request.contactInfo.phone.trim().length === 0) {
        errors.push('Phone number is required');
      }
    }

    if (!request.paymentMethod) {
      errors.push('Payment method is required');
    } else if (!['credit_card', 'bank_transfer', 'cash'].includes(request.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update order status request
   */
  private validateUpdateOrderStatusRequest(request: UpdateOrderStatusRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.orderId) {
      errors.push('Order ID is required');
    }

    if (!request.status) {
      errors.push('Order status is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update payment status request
   */
  private validateUpdatePaymentStatusRequest(request: UpdatePaymentStatusRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.orderId) {
      errors.push('Order ID is required');
    }

    if (!request.paymentStatus) {
      errors.push('Payment status is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 