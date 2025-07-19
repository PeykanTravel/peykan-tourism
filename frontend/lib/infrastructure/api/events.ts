import { apiClient } from './client';
import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance,
  EventPricingRequest, EventPricingBreakdown,
  EventSeatMap, EventAvailabilityCalendar,
  EventSeatReservation
} from '../../types/api';
import { PaginatedResponse } from '../../domain/entities/Common';

export class EventsApi {
  private readonly basePath = '/events';

  // Event Categories
  async getEventCategories(): Promise<EventCategory[]> {
    return apiClient.get<EventCategory[]>(`${this.basePath}/categories/`);
  }

  // Venues
  async getVenues(params?: {
    search?: string;
    city?: string;
    country?: string;
  }): Promise<Venue[]> {
    return apiClient.get<Venue[]>(`${this.basePath}/venues/`, { params });
  }

  // Artists
  async getArtists(params?: {
    search?: string;
  }): Promise<Artist[]> {
    return apiClient.get<Artist[]>(`${this.basePath}/artists/`, { params });
  }

  // Enhanced Events API
  async getEvents(params?: {
    search?: string;
    category?: string;
    venue?: string;
    style?: string;
    min_price?: number;
    max_price?: number;
    date_from?: string;
    date_to?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<EventListResponse> {
    return apiClient.get<EventListResponse>(`${this.basePath}/events/`, { params });
  }

  async searchEvents(searchParams: EventSearchParams): Promise<EventListResponse> {
    return apiClient.get<EventListResponse>(`${this.basePath}/events/search/`, { 
      params: searchParams 
    });
  }

  async getEventBySlug(slug: string): Promise<EventDetailResponse> {
    return apiClient.get<EventDetailResponse>(`${this.basePath}/events/${slug}/`);
  }

  async getEventById(id: string): Promise<EventDetailResponse> {
    return apiClient.get<EventDetailResponse>(`${this.basePath}/events/${id}/`);
  }

  // Enhanced Performance APIs
  async getEventPerformancesDetailed(eventId: string): Promise<{
    event_id: string;
    performances: Array<{
      id: string;
      date: string;
      start_time: string;
      end_time: string;
      is_available: boolean;
      capacity_summary: any;
      available_sections: any[];
      booking_cutoff: string;
    }>;
  }> {
    return apiClient.get(`${this.basePath}/events/${eventId}/performances-detailed/`);
  }

  async getEventAvailabilityCalendar(eventId: string): Promise<EventAvailabilityCalendar> {
    return apiClient.get<EventAvailabilityCalendar>(`${this.basePath}/events/${eventId}/availability-calendar/`);
  }

  // Enhanced Pricing APIs
  async calculateEventPricing(
    eventId: string,
    pricingRequest: EventPricingRequest
  ): Promise<{
    event_id: string;
    performance_id: string;
    pricing_breakdown: EventPricingBreakdown;
    calculation_timestamp: string;
  }> {
    return apiClient.post(`${this.basePath}/events/${eventId}/calculate-pricing/`, pricingRequest);
  }

  async getEventOptions(eventId: string): Promise<{
    event_id: string;
    options: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      currency: string;
      option_type: string;
      max_quantity: number;
      is_available: boolean;
    }>;
  }> {
    return apiClient.get(`${this.basePath}/events/${eventId}/available-options/`);
  }

  // Enhanced Seat Management APIs
  async getEventSeatMap(
    eventId: string,
    performanceId: string
  ): Promise<EventSeatMap> {
    return apiClient.get<EventSeatMap>(`${this.basePath}/events/${eventId}/seat-map/`, {
      params: { performance_id: performanceId }
    });
  }

  async reserveEventSeats(
    eventId: string,
    reservation: EventSeatReservation
  ): Promise<{
    message: string;
    reservation_id: string;
    expires_at: string;
  }> {
    return apiClient.post(`${this.basePath}/events/${eventId}/reserve-seats/`, reservation);
  }

  // Event Reviews
  async getEventReviews(
    eventId: string, 
    params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<EventReview>> {
    return apiClient.getPaginated<EventReview>(`${this.basePath}/events/${eventId}/reviews/`, { params });
  }

  async addEventReview(
    eventId: string, 
    reviewData: {
      rating: number;
      title: string;
      comment: string;
    }
  ): Promise<EventReview> {
    return apiClient.post<EventReview>(`${this.basePath}/events/${eventId}/reviews/`, reviewData);
  }

  // Event Booking
  async bookEvent(
    eventId: string, 
    bookingData: EventBookingRequest
  ): Promise<{
    message: string;
    event_id: string;
    booking_data: EventBookingRequest;
  }> {
    return apiClient.post(`${this.basePath}/events/${eventId}/book/`, bookingData);
  }

  // Event Filters
  async getEventFilters(): Promise<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }> {
    const response = await apiClient.get<{
      categories: EventCategory[];
      venues: Venue[];
      styles: Array<{ value: string; label: string }>;
    }>(`${this.basePath}/filters/`);
    return {
      categories: Array.isArray(response.categories) ? response.categories : [],
      venues: Array.isArray(response.venues) ? response.venues : [],
      styles: Array.isArray(response.styles) ? response.styles : [],
    };
  }

  // Event Stats
  async getEventStats(eventId: string): Promise<{
    average_rating: number;
    review_count: number;
    total_performances: number;
    upcoming_performances: number;
  }> {
    return apiClient.get(`${this.basePath}/events/${eventId}/stats/`);
  }

  // Add Event to Cart
  async addEventToCart(eventCartData: {
    event_id: string;
    performance_id: string;
    section_name: string;
    ticket_type_id: string;
    quantity: number;
    selected_seats?: string[];
    selected_options?: Array<{
      option_id: string;
      quantity: number;
    }>;
    special_requirements?: string;
  }): Promise<{
    message: string;
    cart_item_id: string;
    expires_at: string;
  }> {
    return apiClient.post('/cart/add-event/', eventCartData);
  }
}

// Export singleton instance
export const eventsApi = new EventsApi(); 