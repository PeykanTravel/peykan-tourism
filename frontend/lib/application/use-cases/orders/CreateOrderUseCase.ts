import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { CartRepository } from '../../../domain/repositories/CartRepository';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { Order } from '../../../domain/entities/Order';
import { Cart } from '../../../domain/entities/Cart';
import { User } from '../../../domain/entities/User';
import { ContactInfo } from '../../../domain/value-objects/ContactInfo';
import { Price } from '../../../domain/value-objects/Price';
import { Currency } from '../../../domain/value-objects/Currency';

export interface CreateOrderUseCaseRequest {
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

export interface CreateOrderUseCaseResponse {
  order: Order;
  success: boolean;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private cartRepository: CartRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    try {
      // Validate input
      if (!request.userId) {
        throw new Error('User ID is required');
      }
      
      if (!request.cartId) {
        throw new Error('Cart ID is required');
      }

      // Get user
      const userResult = await this.userRepository.findById(request.userId);
      if (!userResult.success || !userResult.user) {
        throw new Error('User not found');
      }
      
      const user = userResult.user;

      // Get cart
      const cartResult = await this.cartRepository.findById(request.cartId);
      if (!cartResult.success || !cartResult.cart) {
        throw new Error('Cart not found');
      }
      
      const cart = cartResult.cart;

      // Validate cart ownership
      if (cart.userId !== request.userId) {
        throw new Error('Cart does not belong to user');
      }

      // Validate cart has items
      if (cart.isEmpty()) {
        throw new Error('Cart is empty');
      }

      // Validate contact info
      const contactInfo = ContactInfo.create({
        firstName: request.contactInfo.firstName,
        lastName: request.contactInfo.lastName,
        phone: request.contactInfo.phone
      });

      // Create order
      const currency = request.currency ? Currency.create(request.currency) : Currency.create('USD');
      
      const order = Order.create({
        userId: request.userId,
        items: cart.items,
        contactInfo,
        paymentMethod: request.paymentMethod,
        currency,
        notes: request.notes,
        total: cart.getTotal()
      });

      // Validate order
      if (!order.isValid()) {
        throw new Error('Order validation failed');
      }

      // Save order
      const saveResult = await this.orderRepository.save(order);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save order');
      }

      // Clear cart
      const clearResult = await this.cartRepository.clear(request.cartId);
      if (!clearResult.success) {
        // Log warning but don't fail the order creation
        console.warn('Failed to clear cart after order creation');
      }

      return {
        order,
        success: true
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create order: ${error.message}`);
      }
      throw new Error('Failed to create order: Unknown error');
    }
  }
} 