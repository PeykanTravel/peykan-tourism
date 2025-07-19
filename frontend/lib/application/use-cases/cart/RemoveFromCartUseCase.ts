import { CartRepository } from '../../../domain/repositories/CartRepository';
import { Cart } from '../../../domain/entities/Cart';

export interface RemoveFromCartUseCaseRequest {
  userId: string;
  itemId: string;
}

export interface RemoveFromCartUseCaseResponse {
  cart: Cart;
  success: boolean;
}

export class RemoveFromCartUseCase {
  constructor(private cartRepository: CartRepository) {}

  async execute(request: RemoveFromCartUseCaseRequest): Promise<RemoveFromCartUseCaseResponse> {
    try {
      // Validate input
      if (!request.userId) {
        throw new Error('User ID is required');
      }
      
      if (!request.itemId) {
        throw new Error('Item ID is required');
      }

      // Get cart
      const cartResult = await this.cartRepository.findByUserId(request.userId);
      if (!cartResult.success || !cartResult.cart) {
        throw new Error('Cart not found');
      }
      
      const cart = cartResult.cart;

      // Remove item
      const removed = cart.removeItem(request.itemId);
      if (!removed) {
        throw new Error('Item not found in cart');
      }

      // Save cart
      const saveResult = await this.cartRepository.save(cart);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save cart');
      }

      return {
        cart,
        success: true
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to remove from cart: ${error.message}`);
      }
      throw new Error('Failed to remove from cart: Unknown error');
    }
  }
} 