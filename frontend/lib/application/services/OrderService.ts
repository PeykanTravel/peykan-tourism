import { CreateOrderUseCase } from '../use-cases/orders/CreateOrderUseCase';
import { GetUserOrdersUseCase } from '../use-cases/orders/GetUserOrdersUseCase';
import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { CartRepository } from '../../domain/repositories/CartRepository';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { Order } from '../../domain/entities/Order';

export interface CreateOrderRequest {
  userId: string;
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

export interface GetUserOrdersRequest {
  userId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetUserOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class OrderService {
  private createOrderUseCase: CreateOrderUseCase;
  private getUserOrdersUseCase: GetUserOrdersUseCase;

  constructor(
    orderRepository: OrderRepository,
    cartRepository: CartRepository,
    userRepository: UserRepository
  ) {
    this.createOrderUseCase = new CreateOrderUseCase(orderRepository, cartRepository, userRepository);
    this.getUserOrdersUseCase = new GetUserOrdersUseCase(orderRepository);
  }

  async createOrder(request: CreateOrderRequest): Promise<{ order: Order; success: boolean }> {
    try {
      const result = await this.createOrderUseCase.execute({
        userId: request.userId,
        cartId: request.cartId,
        contactInfo: request.contactInfo,
        paymentMethod: request.paymentMethod,
        currency: request.currency,
        notes: request.notes
      });

      return {
        order: result.order,
        success: result.success
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }
      throw new Error('Failed to create order: Unknown error');
    }
  }

  async getUserOrders(request: GetUserOrdersRequest): Promise<GetUserOrdersResponse> {
    try {
      const result = await this.getUserOrdersUseCase.execute({
        userId: request.userId,
        status: request.status,
        page: request.page,
        limit: request.limit
      });

      return {
        orders: result.orders,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      throw new Error('Failed to fetch orders: Unknown error');
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    // This would use a GetOrderByIdUseCase
    throw new Error('Get order by ID functionality not implemented yet');
  }

  async cancelOrder(orderId: string, userId: string): Promise<boolean> {
    // This would use a CancelOrderUseCase
    throw new Error('Cancel order functionality not implemented yet');
  }

  async getOrderStatus(orderId: string): Promise<string> {
    // This would use a GetOrderStatusUseCase
    throw new Error('Get order status functionality not implemented yet');
  }
} 