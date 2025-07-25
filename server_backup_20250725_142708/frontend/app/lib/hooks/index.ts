import { useState, useEffect } from 'react';

// Export all hooks for easy importing
export { useAuth } from './useAuth';
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
        const response = await fetch('http://167.235.140.125:8000/api/v1/tours/tours/');
        if (response.ok) {
          const data = await response.json();
          setTours(data.results || []);
        } else {
          setError('Failed to fetch tours');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
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
        const response = await fetch(`http://167.235.140.125:8000/api/v1/tours/tours/${slug}/`);
        if (response.ok) {
          const data = await response.json();
          setTour(data);
        } else {
          setError('Tour not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
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
        const response = await fetch('http://167.235.140.125:8000/api/v1/tours/categories/');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
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