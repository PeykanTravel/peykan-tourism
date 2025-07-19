import { 
  Event, EventListResponse, EventDetailResponse, 
  EventSearchParams, EventBookingRequest, EventReview,
  EventCategory, Venue, Artist, EventPerformance,
  EventPricingRequest, EventPricingBreakdown,
  EventSeatMap, EventAvailabilityCalendar,
  EventSeatReservation
} from '../../types/api';
import { ApiResponse, PaginatedResponse } from '../entities/Common';

export interface EventsRepository {
  // Event Categories
  getEventCategories(): Promise<ApiResponse<EventCategory[]>>;
  
  // Venues
  getVenues(params?: {
    search?: string;
    city?: string;
    country?: string;
  }): Promise<ApiResponse<Venue[]>>;
  
  // Artists
  getArtists(params?: {
    search?: string;
  }): Promise<ApiResponse<Artist[]>>;
  
  // Events
  getEvents(params?: {
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
  }): Promise<PaginatedResponse<Event>>;
  
  searchEvents(searchParams: EventSearchParams): Promise<PaginatedResponse<Event>>;
  getEventBySlug(slug: string): Promise<ApiResponse<Event>>;
  getEventById(id: string): Promise<ApiResponse<Event>>;
  
  // Event Performances
  getEventPerformancesDetailed(eventId: string): Promise<ApiResponse<{
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
  }>>;
  
  getEventAvailabilityCalendar(eventId: string): Promise<ApiResponse<EventAvailabilityCalendar>>;
  
  // Event Pricing
  calculateEventPricing(
    eventId: string,
    pricingRequest: EventPricingRequest
  ): Promise<ApiResponse<{
    event_id: string;
    performance_id: string;
    pricing_breakdown: EventPricingBreakdown;
    calculation_timestamp: string;
  }>>;
  
  getEventOptions(eventId: string): Promise<ApiResponse<{
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
  }>>;
  
  // Seat Management
  getEventSeatMap(
    eventId: string,
    performanceId: string
  ): Promise<ApiResponse<EventSeatMap>>;
  
  reserveEventSeats(
    eventId: string,
    reservation: EventSeatReservation
  ): Promise<ApiResponse<{
    message: string;
    reservation_id: string;
    expires_at: string;
  }>>;
  
  // Event Reviews
  getEventReviews(
    eventId: string, 
    params?: {
      page?: number;
      page_size?: number;
      ordering?: string;
    }
  ): Promise<PaginatedResponse<EventReview>>;
  
  addEventReview(
    eventId: string, 
    reviewData: {
      rating: number;
      title: string;
      comment: string;
    }
  ): Promise<ApiResponse<EventReview>>;
  
  // Event Booking
  bookEvent(
    eventId: string, 
    bookingData: EventBookingRequest
  ): Promise<ApiResponse<{
    message: string;
    event_id: string;
    booking_data: EventBookingRequest;
  }>>;
  
  // Event Filters
  getEventFilters(): Promise<ApiResponse<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }>>;
  
  // Event Stats
  getEventStats(eventId: string): Promise<ApiResponse<{
    average_rating: number;
    review_count: number;
    total_performances: number;
    upcoming_performances: number;
  }>>;
  
  // Cart Integration
  addEventToCart(eventCartData: {
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
  }>>;
} 