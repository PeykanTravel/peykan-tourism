import axios from 'axios';
import type { 
  Tour, TourCategory, TourSearchParams, TourBookingPayload, 
  TourSchedule, TourReview, PaginatedResponse 
} from '../types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/tours/';

export const getTours = (params?: Record<string, any>) => 
  axios.get<PaginatedResponse<Tour>>(API_URL, { params });

export const getTourDetail = (slug: string) => 
  axios.get<Tour>(`${API_URL}${slug}/`);

export const searchTours = (data: TourSearchParams) => 
  axios.post<PaginatedResponse<Tour>>(`${API_URL}search/`, data);

export const bookTour = (data: TourBookingPayload, token: string) => 
  axios.post<{ message: string; booking: any }>(`${API_URL}booking/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

export const getTourCategories = () => 
  axios.get<TourCategory[]>(`${API_URL}categories/`);

export const getTourSchedules = (slug: string) => 
  axios.get<TourSchedule[]>(`${API_URL}${slug}/schedules/`);

export const getTourStats = (slug: string) => 
  axios.get<{
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<number, number>;
    recent_bookings: number;
    is_popular: boolean;
  }>(`${API_URL}${slug}/stats/`);

export const getTourAvailability = (slug: string, params?: { date_from: string; date_to: string }) => 
  axios.get<{
    tour: { id: string; title: string; slug: string };
    availability: Array<{
      date: string;
      start_time: string;
      end_time: string;
      available_capacity: number;
      is_full: boolean;
    }>;
  }>(`${API_URL}${slug}/availability/`, { params });

export const getTourReviews = (slug: string) => 
  axios.get<TourReview[]>(`${API_URL}${slug}/reviews/`);

export const createTourReview = (slug: string, data: { rating: number; title: string; comment: string }, token: string) => 
  axios.post<TourReview>(`${API_URL}${slug}/reviews/create/`, data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });

// Re-export types for convenience
export type { 
  Tour, TourCategory, TourSearchParams, TourBookingPayload, 
  TourSchedule, TourReview 
}; 