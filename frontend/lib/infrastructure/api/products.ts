import { apiClient } from './client';
import { 
  Product, 
  Tour, 
  Event, 
  Transfer, 
  ProductFilters, 
  ProductSearchQuery,
  EventCategory,
  Location
} from '../../domain/entities/Product';
import { PaginatedResponse } from '../../domain/entities/Common';

export class ProductsApi {
  private readonly basePath = '/products';

  // Tours
  async getTours(filters?: ProductFilters): Promise<PaginatedResponse<Tour>> {
    return apiClient.getPaginated<Tour>(`${this.basePath}/tours/`, {
      params: filters
    });
  }

  async getTourById(id: string): Promise<Tour> {
    return apiClient.get<Tour>(`${this.basePath}/tours/${id}/`);
  }

  async getTourBySlug(slug: string): Promise<Tour> {
    return apiClient.get<Tour>(`${this.basePath}/tours/slug/${slug}/`);
  }

  async getTourVariants(tourId: string): Promise<any[]> {
    return apiClient.get(`${this.basePath}/tours/${tourId}/variants/`);
  }

  async checkTourAvailability(tourId: string, data: {
    variant_id?: string;
    date: string;
    participants: number;
  }): Promise<{
    available: boolean;
    available_spots: number;
    price: number;
    currency: string;
  }> {
    return apiClient.post(
      `${this.basePath}/tours/${tourId}/check-availability/`,
      data
    );
  }

  // Events
  async getEvents(filters?: ProductFilters): Promise<PaginatedResponse<Event>> {
    return apiClient.getPaginated<Event>(`${this.basePath}/events/`, {
      params: filters
    });
  }

  async getEventById(id: string): Promise<Event> {
    return apiClient.get<Event>(`${this.basePath}/events/${id}/`);
  }

  async getEventBySlug(slug: string): Promise<Event> {
    return apiClient.get<Event>(`${this.basePath}/events/slug/${slug}/`);
  }

  async getEventCategories(): Promise<EventCategory[]> {
    return apiClient.get<EventCategory[]>(`${this.basePath}/events/categories/`);
  }

  async getEventPricingOptions(eventId: string): Promise<any[]> {
    return apiClient.get(`${this.basePath}/events/${eventId}/pricing-options/`);
  }

  async checkEventAvailability(eventId: string, data: {
    pricing_option_id?: string;
    participants: number;
  }): Promise<{
    available: boolean;
    available_spots: number;
    price: number;
    currency: string;
  }> {
    return apiClient.post(
      `${this.basePath}/events/${eventId}/check-availability/`,
      data
    );
  }

  // Transfers
  async getTransfers(filters?: ProductFilters): Promise<PaginatedResponse<Transfer>> {
    return apiClient.getPaginated<Transfer>(`${this.basePath}/transfers/`, {
      params: filters
    });
  }

  async getTransferById(id: string): Promise<Transfer> {
    return apiClient.get<Transfer>(`${this.basePath}/transfers/${id}/`);
  }

  async getTransferRoutes(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/transfers/routes/`);
  }

  async getTransferSchedule(transferId: string, data: {
    date: string;
    route_id?: string;
  }): Promise<any[]> {
    return apiClient.get(`${this.basePath}/transfers/${transferId}/schedule/`, {
      params: data
    });
  }

  async checkTransferAvailability(transferId: string, data: {
    schedule_id: string;
    passengers: number;
  }): Promise<{
    available: boolean;
    available_seats: number;
    price: number;
    currency: string;
  }> {
    return apiClient.post(
      `${this.basePath}/transfers/${transferId}/check-availability/`,
      data
    );
  }

  // General product search
  async searchProducts(query: ProductSearchQuery): Promise<PaginatedResponse<Product>> {
    return apiClient.getPaginated<Product>(`${this.basePath}/search/`, {
      params: { q: query.query, ...query.filters }
    });
  }

  async getProductSuggestions(query: string): Promise<string[]> {
    return apiClient.get<string[]>(`${this.basePath}/search/suggestions/`, {
      params: { q: query }
    });
  }

  // Categories and filters
  async getProductCategories(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/categories/`);
  }

  async getLocations(): Promise<Location[]> {
    return apiClient.get<Location[]>(`${this.basePath}/locations/`);
  }

  async getPopularDestinations(): Promise<Location[]> {
    return apiClient.get<Location[]>(`${this.basePath}/destinations/popular/`);
  }

  // Product reviews and ratings
  async getProductReviews(productId: string, productType: string): Promise<PaginatedResponse<any>> {
    return apiClient.getPaginated(`${this.basePath}/${productType}s/${productId}/reviews/`);
  }

  async addProductReview(productId: string, productType: string, review: {
    rating: number;
    title: string;
    content: string;
    images?: string[];
  }): Promise<any> {
    return apiClient.post(
      `${this.basePath}/${productType}s/${productId}/reviews/`,
      review
    );
  }

  // Wishlist
  async getWishlist(): Promise<PaginatedResponse<Product>> {
    return apiClient.getPaginated<Product>(`${this.basePath}/wishlist/`);
  }

  async addToWishlist(productId: string, productType: string): Promise<void> {
    return apiClient.post(`${this.basePath}/wishlist/`, {
      product_id: productId,
      product_type: productType
    });
  }

  async removeFromWishlist(productId: string, productType: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/wishlist/${productId}/`, {
      params: { product_type: productType }
    });
  }

  // Recently viewed
  async getRecentlyViewed(): Promise<Product[]> {
    return apiClient.get<Product[]>(`${this.basePath}/recently-viewed/`);
  }

  async addToRecentlyViewed(productId: string, productType: string): Promise<void> {
    return apiClient.post(`${this.basePath}/recently-viewed/`, {
      product_id: productId,
      product_type: productType
    });
  }

  // Recommendations
  async getRecommendations(productId?: string, productType?: string): Promise<Product[]> {
    return apiClient.get<Product[]>(`${this.basePath}/recommendations/`, {
      params: { product_id: productId, product_type: productType }
    });
  }

  async getPersonalizedRecommendations(): Promise<Product[]> {
    return apiClient.get<Product[]>(`${this.basePath}/recommendations/personalized/`);
  }

  // Price comparison
  async compareProducts(productIds: string[]): Promise<any[]> {
    return apiClient.post(`${this.basePath}/compare/`, {
      product_ids: productIds
    });
  }

  // Availability calendar
  async getAvailabilityCalendar(productId: string, productType: string, month: string): Promise<any> {
    return apiClient.get(`${this.basePath}/${productType}s/${productId}/availability/`, {
      params: { month }
    });
  }

  // Bulk operations
  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    return apiClient.post<Product[]>(`${this.basePath}/bulk/`, {
      product_ids: productIds
    });
  }

  // Analytics
  async trackProductView(productId: string, productType: string): Promise<void> {
    return apiClient.post(`${this.basePath}/analytics/view/`, {
      product_id: productId,
      product_type: productType
    });
  }

  async trackProductInteraction(productId: string, productType: string, action: string): Promise<void> {
    return apiClient.post(`${this.basePath}/analytics/interaction/`, {
      product_id: productId,
      product_type: productType,
      action
    });
  }
}

// Export singleton instance
export const productsApi = new ProductsApi();
export default productsApi; 