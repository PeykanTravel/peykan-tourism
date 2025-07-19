import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { Order } from '../../../domain/entities/Order';

export interface GetUserOrdersUseCaseRequest {
  userId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetUserOrdersUseCaseResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class GetUserOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async execute(request: GetUserOrdersUseCaseRequest): Promise<GetUserOrdersUseCaseResponse> {
    try {
      // Validate input
      if (!request.userId) {
        throw new Error('User ID is required');
      }

      const page = request.page || 1;
      const limit = request.limit || 10;

      // Get orders
      const result = await this.orderRepository.findByUserId(
        request.userId,
        request.status,
        page,
        limit
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch orders');
      }

      return {
        orders: result.orders,
        total: result.total,
        page,
        limit,
        hasMore: (page * limit) < result.total
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      throw new Error('Failed to fetch orders: Unknown error');
    }
  }
} 