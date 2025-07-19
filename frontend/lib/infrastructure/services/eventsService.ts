/**
 * Events Service
 * 
 * Service for managing events data and operations
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Event {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  available_seats: number;
  category: string;
  status: 'active' | 'cancelled' | 'sold_out';
  created_at: string;
  updated_at: string;
}

export interface EventPerformance {
  id: string;
  event_id: string;
  date: string;
  time: string;
  available_seats: number;
  price: number;
}

export interface EventSeat {
  id: string;
  performance_id: string;
  seat_number: string;
  row: string;
  section: string;
  price: number;
  status: 'available' | 'reserved' | 'sold';
}

export interface EventOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'addon' | 'upgrade';
}

export class EventsService {
  private static instance: EventsService;
  private api = axios.create({
    baseURL: `${API_BASE_URL}/events/events`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {
    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  public static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }

  async getEvents(params?: {
    limit?: number;
    category?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: Event[]; count: number; next?: string; previous?: string }> {
    try {
      const response = await this.api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  async getEventBySlug(slug: string): Promise<Event> {
    try {
      const response = await this.api.get(`/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event:', error);
      throw error;
    }
  }

  async getEventPerformances(eventId: string): Promise<EventPerformance[]> {
    try {
      const response = await this.api.get(`/${eventId}/performances/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event performances:', error);
      throw error;
    }
  }

  async getEventSeats(performanceId: string): Promise<EventSeat[]> {
    try {
      const response = await this.api.get(`/performances/${performanceId}/seats/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event seats:', error);
      throw error;
    }
  }

  async getEventOptions(eventId: string): Promise<EventOption[]> {
    try {
      const response = await this.api.get(`/${eventId}/options/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event options:', error);
      throw error;
    }
  }

  async checkAvailability(performanceId: string, seatIds: string[]): Promise<boolean> {
    try {
      const response = await this.api.post(`/performances/${performanceId}/check-availability/`, {
        seat_ids: seatIds,
      });
      return response.data.available;
    } catch (error) {
      console.error('Failed to check availability:', error);
      throw error;
    }
  }

  async reserveSeats(performanceId: string, seatIds: string[], customerInfo: any): Promise<any> {
    try {
      const response = await this.api.post(`/performances/${performanceId}/reserve/`, {
        seat_ids: seatIds,
        customer_info: customerInfo,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reserve seats:', error);
      throw error;
    }
  }

  async calculatePrice(performanceId: string, seatIds: string[], optionIds?: string[]): Promise<number> {
    try {
      const response = await this.api.post(`/performances/${performanceId}/calculate-price/`, {
        seat_ids: seatIds,
        option_ids: optionIds || [],
      });
      return response.data.total_price;
    } catch (error) {
      console.error('Failed to calculate price:', error);
      throw error;
    }
  }
}

export const eventsService = EventsService.getInstance(); 