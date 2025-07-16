import { apiClient } from './client';
import { 
  Cart, 
  CartItem, 
  CartSummary, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartValidationResult,
  Order,
  CheckoutRequest,
  CheckoutResponse
} from '../../domain/entities/Cart';
import { PaginatedResponse } from '../../domain/entities/Common';

export class CartApi {
  private readonly basePath = '/cart';

  // Cart management
  async getCart(): Promise<Cart> {
    return apiClient.get<Cart>(`${this.basePath}/`);
  }

  async createCart(): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/`);
  }

  async clearCart(): Promise<void> {
    return apiClient.delete(`${this.basePath}/`);
  }

  async getCartSummary(): Promise<CartSummary> {
    return apiClient.get<CartSummary>(`${this.basePath}/summary/`);
  }

  // Cart items
  async getCartItems(): Promise<CartItem[]> {
    return apiClient.get<CartItem[]>(`${this.basePath}/items/`);
  }

  async addToCart(item: AddToCartRequest): Promise<CartItem> {
    return apiClient.post<CartItem>(`${this.basePath}/items/`, item);
  }

  async updateCartItem(itemId: string, updates: UpdateCartItemRequest): Promise<CartItem> {
    return apiClient.patch<CartItem>(`${this.basePath}/items/${itemId}/`, updates);
  }

  async removeCartItem(itemId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/items/${itemId}/`);
  }

  async getCartItem(itemId: string): Promise<CartItem> {
    return apiClient.get<CartItem>(`${this.basePath}/items/${itemId}/`);
  }

  // Bulk operations
  async addMultipleToCart(items: AddToCartRequest[]): Promise<CartItem[]> {
    return apiClient.post<CartItem[]>(`${this.basePath}/items/bulk/`, { items });
  }

  async updateMultipleCartItems(updates: Array<{
    item_id: string;
    updates: UpdateCartItemRequest;
  }>): Promise<CartItem[]> {
    return apiClient.patch<CartItem[]>(`${this.basePath}/items/bulk/`, { updates });
  }

  async removeMultipleCartItems(itemIds: string[]): Promise<void> {
    return apiClient.delete(`${this.basePath}/items/bulk/`, {
      data: { item_ids: itemIds }
    });
  }

  // Cart validation
  async validateCart(): Promise<CartValidationResult> {
    return apiClient.post<CartValidationResult>(`${this.basePath}/validate/`);
  }

  async validateCartItem(itemId: string): Promise<CartValidationResult> {
    return apiClient.post<CartValidationResult>(`${this.basePath}/items/${itemId}/validate/`);
  }

  // Cart synchronization (for guest/user cart merge)
  async synchronizeCart(guestCartId?: string): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/sync/`, {
      guest_cart_id: guestCartId
    });
  }

  async mergeGuestCart(guestCartId: string): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/merge/`, {
      guest_cart_id: guestCartId
    });
  }

  // Cart sharing
  async shareCart(): Promise<{ share_url: string; share_code: string }> {
    return apiClient.post(`${this.basePath}/share/`);
  }

  async getSharedCart(shareCode: string): Promise<Cart> {
    return apiClient.get<Cart>(`${this.basePath}/shared/${shareCode}/`);
  }

  // Cart persistence
  async saveCart(): Promise<void> {
    return apiClient.post(`${this.basePath}/save/`);
  }

  async restoreCart(cartId: string): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/restore/`, { cart_id: cartId });
  }

  // Cart history
  async getCartHistory(): Promise<PaginatedResponse<Cart>> {
    return apiClient.getPaginated<Cart>(`${this.basePath}/history/`);
  }

  async getCartVersion(versionId: string): Promise<Cart> {
    return apiClient.get<Cart>(`${this.basePath}/history/${versionId}/`);
  }

  // Discounts and coupons
  async applyCoupon(code: string): Promise<CartSummary> {
    return apiClient.post<CartSummary>(`${this.basePath}/coupons/apply/`, { code });
  }

  async removeCoupon(code: string): Promise<CartSummary> {
    return apiClient.delete<CartSummary>(`${this.basePath}/coupons/${code}/`);
  }

  async getAvailableCoupons(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/coupons/available/`);
  }

  async validateCoupon(code: string): Promise<{
    valid: boolean;
    discount_amount: number;
    message: string;
  }> {
    return apiClient.post(`${this.basePath}/coupons/validate/`, { code });
  }

  // Price calculation
  async calculatePrices(): Promise<CartSummary> {
    return apiClient.post<CartSummary>(`${this.basePath}/calculate/`);
  }

  async calculateItemPrice(itemId: string): Promise<{
    unit_price: number;
    total_price: number;
    currency: string;
  }> {
    return apiClient.post(`${this.basePath}/items/${itemId}/calculate/`);
  }

  // Checkout preparation
  async prepareCheckout(): Promise<{
    cart_valid: boolean;
    checkout_data: any;
    payment_methods: any[];
    shipping_options: any[];
  }> {
    return apiClient.post(`${this.basePath}/checkout/prepare/`);
  }

  async checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return apiClient.post<CheckoutResponse>(`${this.basePath}/checkout/`, data);
  }

  // Express checkout
  async expressCheckout(paymentMethod: string): Promise<CheckoutResponse> {
    return apiClient.post<CheckoutResponse>(`${this.basePath}/checkout/express/`, {
      payment_method: paymentMethod
    });
  }

  // Cart analytics
  async getCartAnalytics(): Promise<{
    total_items: number;
    total_value: number;
    average_item_price: number;
    most_expensive_item: any;
    least_expensive_item: any;
    categories: any[];
  }> {
    return apiClient.get(`${this.basePath}/analytics/`);
  }

  async trackCartEvent(event: string, data?: any): Promise<void> {
    return apiClient.post(`${this.basePath}/analytics/events/`, {
      event,
      data
    });
  }

  // Recommendations based on cart
  async getCartRecommendations(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/recommendations/`);
  }

  async getComplementaryProducts(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/complementary/`);
  }

  // Cart export/import
  async exportCart(): Promise<{
    export_url: string;
    format: 'json' | 'csv' | 'pdf';
  }> {
    return apiClient.post(`${this.basePath}/export/`);
  }

  async importCart(data: any): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/import/`, data);
  }

  // Wishlist integration
  async moveToWishlist(itemId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/items/${itemId}/move-to-wishlist/`);
  }

  async moveFromWishlist(wishlistItemId: string): Promise<CartItem> {
    return apiClient.post<CartItem>(`${this.basePath}/items/from-wishlist/`, {
      wishlist_item_id: wishlistItemId
    });
  }

  // Cart comparison
  async compareCarts(cartIds: string[]): Promise<any> {
    return apiClient.post(`${this.basePath}/compare/`, { cart_ids: cartIds });
  }

  // Cart notifications
  async getCartNotifications(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/notifications/`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return apiClient.patch(`${this.basePath}/notifications/${notificationId}/`, {
      is_read: true
    });
  }

  // Guest cart management
  async createGuestCart(): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/guest/`);
  }

  async getGuestCart(sessionId: string): Promise<Cart> {
    return apiClient.get<Cart>(`${this.basePath}/guest/${sessionId}/`);
  }

  async convertGuestCart(sessionId: string): Promise<Cart> {
    return apiClient.post<Cart>(`${this.basePath}/guest/${sessionId}/convert/`);
  }
}

// Export singleton instance
export const cartApi = new CartApi();
export default cartApi; 