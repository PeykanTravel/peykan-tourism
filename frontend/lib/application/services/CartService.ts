import { AddToCartUseCase } from '../use-cases/cart/AddToCartUseCase';
import { RemoveFromCartUseCase } from '../use-cases/cart/RemoveFromCartUseCase';
import { UpdateCartItemUseCase } from '../use-cases/cart/UpdateCartItemUseCase';
import { CartRepository } from '../../domain/repositories/CartRepository';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Cart } from '../../domain/entities/Cart';
import { CartItem } from '../../domain/entities/CartItem';

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  date?: string;
  participants?: number;
}

export interface UpdateCartItemRequest {
  userId: string;
  itemId: string;
  quantity?: number;
  date?: string;
  participants?: number;
}

export interface CartResponse {
  cart: Cart;
  success: boolean;
}

export class CartService {
  private addToCartUseCase: AddToCartUseCase;
  private removeFromCartUseCase: RemoveFromCartUseCase;
  private updateCartItemUseCase: UpdateCartItemUseCase;

  constructor(
    cartRepository: CartRepository,
    productRepository: ProductRepository
  ) {
    this.addToCartUseCase = new AddToCartUseCase(cartRepository, productRepository);
    this.removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository);
    this.updateCartItemUseCase = new UpdateCartItemUseCase(cartRepository);
  }

  async addToCart(request: AddToCartRequest): Promise<{ cart: Cart; addedItem: CartItem }> {
    try {
      const result = await this.addToCartUseCase.execute({
        userId: request.userId,
        productId: request.productId,
        quantity: request.quantity,
        variantId: request.variantId,
        date: request.date,
        participants: request.participants
      });

      return {
        cart: result.cart,
        addedItem: result.addedItem
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add to cart: ${error.message}`);
      }
      throw new Error('Failed to add to cart: Unknown error');
    }
  }

  async removeFromCart(userId: string, itemId: string): Promise<CartResponse> {
    try {
      const result = await this.removeFromCartUseCase.execute({
        userId,
        itemId
      });

      return {
        cart: result.cart,
        success: result.success
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to remove from cart: ${error.message}`);
      }
      throw new Error('Failed to remove from cart: Unknown error');
    }
  }

  async updateCartItem(request: UpdateCartItemRequest): Promise<{ cart: Cart; updatedItem: any }> {
    try {
      const result = await this.updateCartItemUseCase.execute({
        userId: request.userId,
        itemId: request.itemId,
        quantity: request.quantity,
        date: request.date,
        participants: request.participants
      });

      return {
        cart: result.cart,
        updatedItem: result.updatedItem
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update cart item: ${error.message}`);
      }
      throw new Error('Failed to update cart item: Unknown error');
    }
  }

  async getCart(userId: string): Promise<Cart | null> {
    // This would use a GetCartUseCase
    throw new Error('Get cart functionality not implemented yet');
  }

  async clearCart(userId: string): Promise<boolean> {
    // This would use a ClearCartUseCase
    throw new Error('Clear cart functionality not implemented yet');
  }

  async getCartTotal(userId: string): Promise<number> {
    // This would use a GetCartTotalUseCase
    throw new Error('Get cart total functionality not implemented yet');
  }
} 