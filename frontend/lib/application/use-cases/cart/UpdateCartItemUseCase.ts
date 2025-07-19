import { CartRepository } from '../../../domain/repositories/CartRepository';
import { Cart } from '../../../domain/entities/Cart';
import { Quantity } from '../../../domain/value-objects/Quantity';

export interface UpdateCartItemUseCaseRequest {
  userId: string;
  itemId: string;
  quantity?: number;
  date?: string;
  participants?: number;
}

export interface UpdateCartItemUseCaseResponse {
  cart: Cart;
  updatedItem: any;
}

export class UpdateCartItemUseCase {
  constructor(private cartRepository: CartRepository) {}

  async execute(request: UpdateCartItemUseCaseRequest): Promise<UpdateCartItemUseCaseResponse> {
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

      // Find item
      const item = cart.findItemById(request.itemId);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      // Update item
      if (request.quantity !== undefined) {
        const quantity = Quantity.create(request.quantity);
        cart.updateItemQuantity(request.itemId, quantity);
      }

      if (request.date !== undefined) {
        cart.updateItemDate(request.itemId, request.date);
      }

      if (request.participants !== undefined) {
        cart.updateItemParticipants(request.itemId, request.participants);
      }

      // Save cart
      const saveResult = await this.cartRepository.save(cart);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save cart');
      }

      // Get updated item
      const updatedItem = cart.findItemById(request.itemId);
      if (!updatedItem) {
        throw new Error('Failed to update item');
      }

      return {
        cart,
        updatedItem
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update cart item: ${error.message}`);
      }
      throw new Error('Failed to update cart item: Unknown error');
    }
  }
} 