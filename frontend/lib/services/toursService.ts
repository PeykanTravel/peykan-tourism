/**
 * Tours Service
 * 
 * Service for managing tours data and operations
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Tour {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;
  location: string;
  duration: string;
  price: number;
  max_participants: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface TourVariant {
  id: string;
  tour_id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  max_participants: number;
  includes: string[];
  excludes: string[];
}

export interface TourSchedule {
  id: string;
  tour_id: string;
  variant_id: string;
  date: string;
  time: string;
  available_spots: number;
  guide_name?: string;
  meeting_point: string;
}

export interface TourOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'addon' | 'upgrade';
}

export class ToursService {
  private static instance: ToursService;
  private api = axios.create({
    baseURL: `${API_BASE_URL}/tours`,
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

  public static getInstance(): ToursService {
    if (!ToursService.instance) {
      ToursService.instance = new ToursService();
    }
    return ToursService.instance;
  }

  async getTours(params?: {
    limit?: number;
    category?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: Tour[]; count: number; next?: string; previous?: string }> {
    try {
      const response = await this.api.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      throw error;
    }
  }

  async getTourBySlug(slug: string): Promise<Tour> {
    try {
      const response = await this.api.get(`/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tour:', error);
      throw error;
    }
  }

  async getTourVariants(tourId: string): Promise<TourVariant[]> {
    try {
      const response = await this.api.get(`/${tourId}/variants/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tour variants:', error);
      throw error;
    }
  }

  async getTourSchedules(tourId: string, variantId?: string): Promise<TourSchedule[]> {
    try {
      const params = variantId ? { variant_id: variantId } : {};
      const response = await this.api.get(`/${tourId}/schedules/`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tour schedules:', error);
      throw error;
    }
  }

  async getTourOptions(tourId: string): Promise<TourOption[]> {
    try {
      const response = await this.api.get(`/${tourId}/options/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tour options:', error);
      throw error;
    }
  }

  async checkAvailability(scheduleId: string, participants: number): Promise<boolean> {
    try {
      const response = await this.api.post(`/schedules/${scheduleId}/check-availability/`, {
        participants,
      });
      return response.data.available;
    } catch (error) {
      console.error('Failed to check availability:', error);
      throw error;
    }
  }

  async reserveTour(scheduleId: string, participants: number, customerInfo: any, optionIds?: string[]): Promise<any> {
    try {
      const response = await this.api.post(`/schedules/${scheduleId}/reserve/`, {
        participants,
        customer_info: customerInfo,
        option_ids: optionIds || [],
      });
      return response.data;
    } catch (error) {
      console.error('Failed to reserve tour:', error);
      throw error;
    }
  }

  async calculatePrice(scheduleId: string, participants: number, optionIds?: string[]): Promise<number> {
    try {
      const response = await this.api.post(`/schedules/${scheduleId}/calculate-price/`, {
        participants,
        option_ids: optionIds || [],
      });
      return response.data.total_price;
    } catch (error) {
      console.error('Failed to calculate price:', error);
      throw error;
    }
  }
}

export const toursService = ToursService.getInstance(); 