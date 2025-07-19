import { CartRepository } from '../../../domain/repositories/CartRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { Cart } from '../../../domain/entities/Cart';
import { Product } from '../../../domain/entities/Product';
import { CartItem } from '../../../domain/entities/CartItem';
import { Quantity } from '../../../domain/value-objects/Quantity';

export interface AddToCartUseCaseRequest {
  userId: string;
  productId: string;
  quantity: number;
  variantId?: string;
  date?: string;
  participants?: number;
}

export interface AddToCartUseCaseResponse {
  cart: Cart;
  addedItem: CartItem;
}

export class AddToCartUseCase {
  constructor(
    private cartRepository: CartRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(request: AddToCartUseCaseRequest): Promise<AddToCartUseCaseResponse> {
    try {
      // Validate input
      if (!request.userId) {
        throw new Error('User ID is required');
      }
      
      if (!request.productId) {
        throw new Error('Product ID is required');
      }
      
      const quantity = Quantity.create(request.quantity);

      // Get product
      const productResult = await this.productRepository.findById(request.productId);
      if (!productResult.success || !productResult.product) {
        throw new Error('Product not found');
      }
      
      const product = productResult.product;

      // Check product availability
      if (!product.isAvailable()) {
        throw new Error('Product is not available');
      }

      // Get or create cart
      let cartResult = await this.cartRepository.findByUserId(request.userId);
      let cart: Cart;
      
      if (!cartResult.success || !cartResult.cart) {
        // Create new cart
        cart = Cart.create({
          userId: request.userId,
          items: []
        });
      } else {
        cart = cartResult.cart;
      }

      // Check if item already exists in cart
      const existingItem = cart.findItem(request.productId, request.variantId);
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity.add(quantity);
        cart.updateItemQuantity(existingItem.id, newQuantity);
      } else {
        // Add new item
        const cartItem = CartItem.create({
          productId: request.productId,
          productType: product.type,
          quantity,
          variantId: request.variantId,
          date: request.date,
          participants: request.participants
        });
        
        cart.addItem(cartItem);
      }

      // Save cart
      const saveResult = await this.cartRepository.save(cart);
      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save cart');
      }

      // Get the added/updated item
      const addedItem = cart.findItem(request.productId, request.variantId);
      if (!addedItem) {
        throw new Error('Failed to add item to cart');
      }

      return {
        cart,
        addedItem
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to add to cart: ${error.message}`);
      }
      throw new Error('Failed to add to cart: Unknown error');
    }
  }
} 