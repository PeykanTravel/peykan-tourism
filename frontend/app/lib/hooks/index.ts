import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api/client';
import { API_CONFIG } from '../../../lib/config/api';

// Export all hooks for easy importing
export { useCart, useCartSummary, useCartCount } from './useCart';

// Simple hooks implementation without complex imports
export const useTours = (params?: any) => {
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.TOURS.LIST);
        setTours(response.data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tours');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [params]);

  return { tours, isLoading, error };
};

export const useTourDetail = (slug: string) => {
  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.TOURS.DETAIL(slug));
        setTour(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tour not found');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchTour();
    }
  }, [slug]);

  return { tour, isLoading, error };
};

export const useTourCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(API_CONFIG.ENDPOINTS.TOURS.CATEGORIES);
        setCategories(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
};

// Mock hooks for other features - will be implemented later
export const useTourSearch = () => ({ tours: [], isLoading: false, error: null });
export const useTourStats = () => ({ stats: null, isLoading: false, error: null });
export const useTourAvailability = () => ({ availability: null, isLoading: false, error: null });

export const useOrders = () => ({ orders: [], isLoading: false, error: null });
export const useOrderDetail = () => ({ order: null, isLoading: false, error: null });

// Re-export types for convenience
export type {
  User, UserProfile, AuthResponse, LoginPayload, RegisterPayload,
  Tour, TourCategory, TourSearchParams, TourBookingPayload,
  Cart, CartItem, AddToCartPayload, UpdateCartItemPayload,
  Order, CreateOrderPayload, Payment, CreatePaymentPayload,
  Agent, AgentSummary
} from '../types/api'; 