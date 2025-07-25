import { apiClient } from './client';
import { Tour, TourListResponse, TourDetailResponse, TourSearchParams } from '../types/api';

// Get all tours
export const getTours = async (params?: TourSearchParams): Promise<TourListResponse> => {
  try {
    const response = await apiClient.get('/tours/tours/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tours:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get tour by slug
export const getTourBySlug = async (slug: string): Promise<TourDetailResponse | null> => {
  try {
    const response = await apiClient.get(`/tours/tours/${slug}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tour by slug:', error);
    return null;
  }
};

// Get tour by ID
export const getTourById = async (id: string): Promise<TourDetailResponse | null> => {
  try {
    const response = await apiClient.get(`/tours/tours/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tour by ID:', error);
    return null;
  }
};

// Search tours
export const searchTours = async (searchParams: TourSearchParams): Promise<TourListResponse> => {
  try {
    const response = await apiClient.get('/tours/tours/search/', { 
      params: searchParams 
    });
    return response.data;
  } catch (error) {
    console.error('Error searching tours:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get tour categories
export const getTourCategories = async () => {
  try {
    const response = await apiClient.get('/tours/categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching tour categories:', error);
    return [];
  }
}; 