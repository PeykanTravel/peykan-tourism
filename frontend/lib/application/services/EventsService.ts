import { EventsRepository } from '../../domain/repositories/EventsRepository';
import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance,
  EventPricingRequest, EventPricingBreakdown,
  EventSeatMap, EventAvailabilityCalendar,
  EventSeatReservation
} from '../../types/api';
import { ApiResponse, PaginatedResponse } from '../../domain/entities/Common';

export class EventsService {
  constructor(private eventsRepository: EventsRepository) {}

  // Event Categories
  async getEventCategories(): Promise<ApiResponse<EventCategory[]>> {
    return this.eventsRepository.getEventCategories();
  }
  
  // Venues
  async getVenues(params?: {
    search?: string;
    city?: string;
    country?: string;
  }): Promise<ApiResponse<Venue[]>> {
    return this.eventsRepository.getVenues(params);
  }
  
  // Artists
  async getArtists(params?: {
    search?: string;
  }): Promise<ApiResponse<Artist[]>> {
    return this.eventsRepository.getArtists(params);
  }
  
  // Events
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
  }): Promise<PaginatedResponse<Event>> {
    return this.eventsRepository.getEvents(params);
  }
  
  async searchEvents(searchParams: EventSearchParams): Promise<PaginatedResponse<Event>> {
    return this.eventsRepository.searchEvents(searchParams);
  }
  
  async getEventBySlug(slug: string): Promise<ApiResponse<Event>> {
    return this.eventsRepository.getEventBySlug(slug);
  }
  
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    return this.eventsRepository.getEventById(id);
  }
  
  // Event Performances
  async getEventPerformancesDetailed(eventId: string): Promise<ApiResponse<{
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
  }>> {
    return this.eventsRepository.getEventPerformancesDetailed(eventId);
  }
  
  async getEventAvailabilityCalendar(eventId: string): Promise<ApiResponse<EventAvailabilityCalendar>> {
    return this.eventsRepository.getEventAvailabilityCalendar(eventId);
  }
  
  // Event Pricing
  async calculateEventPricing(
    eventId: string,
    pricingRequest: EventPricingRequest
  ): Promise<ApiResponse<{
    event_id: string;
    performance_id: string;
    pricing_breakdown: EventPricingBreakdown;
    calculation_timestamp: string;
  }>> {
    return this.eventsRepository.calculateEventPricing(eventId, pricingRequest);
  }
  
  async getEventOptions(eventId: string): Promise<ApiResponse<{
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
  }>> {
    return this.eventsRepository.getEventOptions(eventId);
  }
  
  // Seat Management
  async getEventSeatMap(
    eventId: string,
    performanceId: string
  ): Promise<ApiResponse<EventSeatMap>> {
    return this.eventsRepository.getEventSeatMap(eventId, performanceId);
  }
  
  async reserveEventSeats(
    eventId: string,
    reservation: EventSeatReservation
  ): Promise<ApiResponse<{
    message: string;
    reservation_id: string;
    expires_at: string;
  }>> {
    return this.eventsRepository.reserveEventSeats(eventId, reservation);
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
    return this.eventsRepository.getEventReviews(eventId, params);
  }
  
  async addEventReview(
    eventId: string, 
    reviewData: {
      rating: number;
      title: string;
      comment: string;
    }
  ): Promise<ApiResponse<EventReview>> {
    return this.eventsRepository.addEventReview(eventId, reviewData);
  }
  
  // Event Booking
  async bookEvent(
    eventId: string, 
    bookingData: EventBookingRequest
  ): Promise<ApiResponse<{
    message: string;
    event_id: string;
    booking_data: EventBookingRequest;
  }>> {
    return this.eventsRepository.bookEvent(eventId, bookingData);
  }
  
  // Event Filters
  async getEventFilters(): Promise<ApiResponse<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }>> {
    return this.eventsRepository.getEventFilters();
  }
  
  // Event Stats
  async getEventStats(eventId: string): Promise<ApiResponse<{
    average_rating: number;
    review_count: number;
    total_performances: number;
    upcoming_performances: number;
  }>> {
    return this.eventsRepository.getEventStats(eventId);
  }
  
  // Cart Integration
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
  }): Promise<ApiResponse<{
    message: string;
    cart_item_id: string;
    expires_at: string;
  }>> {
    return this.eventsRepository.addEventToCart(eventCartData);
  }
} 