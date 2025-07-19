/**
 * Cart Repository Implementation
 * API-based implementation of CartRepository interface
 */

import { CartRepository, CartCreateData, CartItemData } from '../../domain/repositories/CartRepository';
import { CartAggregate } from '../../domain/aggregates/CartAggregate';
import { Cart, CartItemType } from '../../domain/entities/Cart';
import { Currency } from '../../domain/value-objects/Currency';
import { Price } from '../../domain/value-objects/Price';
import { apiClient, ApiResponse } from '../api/ApiClient';

export class CartRepositoryImpl implements CartRepository {
  private readonly baseUrl = '/carts';

  /**
   * Find cart by ID
   */
  async findById(id: string): Promise<CartAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding cart by ID:', error);
      return null;
    }
  }

  /**
   * Find cart by user ID
   */
  async findByUserId(userId: string): Promise<CartAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/by-user/${userId}`);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding cart by user ID:', error);
      return null;
    }
  }

  /**
   * Create new cart
   */
  async create(data: CartCreateData): Promise<CartAggregate> {
    try {
      const requestData = this.mapFromCartCreateData(data);
      
      const response = await apiClient.post<ApiResponse<any>>(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to create cart');
    } catch (error) {
      console.error('Error creating cart:', error);
      throw error;
    }
  }

  /**
   * Update cart
   */
  async update(id: string, data: Partial<CartCreateData>): Promise<CartAggregate> {
    try {
      const requestData = this.mapFromCartCreateData(data);
      
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to update cart');
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  /**
   * Delete cart
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting cart:', error);
      return false;
    }
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, itemData: CartItemData): Promise<CartAggregate> {
    try {
      const requestData = this.mapFromCartItemData(itemData);
      
      const response = await apiClient.post<ApiResponse<any>>(`${this.baseUrl}/${cartId}/items`, requestData);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to add item to cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${cartId}/items/${itemId}`, {
        quantity
      });
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to update item quantity');
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, itemId: string): Promise<CartAggregate> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${cartId}/items/${itemId}`);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to remove item from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  }

  /**
   * Clear cart
   */
  async clear(cartId: string): Promise<CartAggregate> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${cartId}/items`);
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to clear cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Update cart currency
   */
  async updateCurrency(cartId: string, currency: Currency): Promise<CartAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${cartId}/currency`, {
        currency: currency.getCode()
      });
      
      if (response.success && response.data) {
        return this.mapToCartAggregate(response.data);
      }
      
      throw new Error('Failed to update cart currency');
    } catch (error) {
      console.error('Error updating cart currency:', error);
      throw error;
    }
  }

  /**
   * Get cart statistics
   */
  async getStatistics(): Promise<{
    totalCarts: number;
    activeCarts: number;
    abandonedCarts: number;
    averageItemsPerCart: number;
    averageCartValue: number;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        totalCarts: 0,
        activeCarts: 0,
        abandonedCarts: 0,
        averageItemsPerCart: 0,
        averageCartValue: 0
      };
    } catch (error) {
      console.error('Error getting cart statistics:', error);
      return {
        totalCarts: 0,
        activeCarts: 0,
        abandonedCarts: 0,
        averageItemsPerCart: 0,
        averageCartValue: 0
      };
    }
  }

  /**
   * Map API response to CartAggregate
   */
  private mapToCartAggregate(cartData: any): CartAggregate {
    // Create Currency value object
    const currency = Currency.create(cartData.currency);

    // Create Cart entity
    const cart = Cart.create(
      cartData.id,
      cartData.userId,
      cartData.items.map((itemData: any) => ({
        id: itemData.id,
        productId: itemData.productId,
        productType: itemData.productType as CartItemType,
        productTitle: itemData.productTitle,
        productSlug: itemData.productSlug,
        productImage: itemData.productImage,
        unitPrice: Price.create(itemData.unitPrice.amount, itemData.unitPrice.currency),
        quantity: itemData.quantity,
        variantId: itemData.variantId,
        variantName: itemData.variantName,
        selectedOptions: itemData.selectedOptions || [],
        metadata: itemData.metadata || {}
      })),
      currency,
      cartData.createdAt ? new Date(cartData.createdAt) : new Date(),
      cartData.updatedAt ? new Date(cartData.updatedAt) : new Date(),
      cartData.expiresAt ? new Date(cartData.expiresAt) : undefined
    );

    // Create CartAggregate
    const cartAggregate = CartAggregate.create(cart);

    return cartAggregate;
  }

  /**
   * Map CartCreateData to API request format
   */
  private mapFromCartCreateData(data: CartCreateData): any {
    const requestData: any = {};

    if (data.userId !== undefined) requestData.userId = data.userId;
    if (data.currency !== undefined) requestData.currency = data.currency.getCode();

    return requestData;
  }

  /**
   * Map CartItemData to API request format
   */
  private mapFromCartItemData(data: CartItemData): any {
    return {
      productId: data.productId,
      productType: data.productType,
      productTitle: data.productTitle,
      productSlug: data.productSlug,
      productImage: data.productImage,
      unitPrice: {
        amount: data.unitPrice.getAmount(),
        currency: data.unitPrice.getCurrency().getCode()
      },
      quantity: data.quantity,
      variantId: data.variantId,
      variantName: data.variantName,
      selectedOptions: data.selectedOptions
    };
  }
} 