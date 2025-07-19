import { useState, useCallback } from 'react';
import { ProductService } from '../services/ProductService';
import { ApiClient } from '../../infrastructure/api/client';
import { ProductFilters } from '../../domain/repositories/ProductRepository';
import { Product, Tour, Event, Transfer } from '../../domain/entities/Product';
import { PaginatedResponse } from '../../domain/entities/Common';

// Create singleton instances
const apiClient = new ApiClient();
const productService = new ProductService(apiClient);

export const useProductService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(
    request: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await request();
      return result;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generic Product Operations
  const getProducts = useCallback(async (filters?: ProductFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Product> | null> => {
    return handleRequest(() => productService.getProducts(filters, page, limit));
  }, [handleRequest]);

  const getProductById = useCallback(async (id: string): Promise<Product | null> => {
    const response = await handleRequest(() => productService.getProductById(id));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const searchProducts = useCallback(async (query: string, filters?: ProductFilters): Promise<PaginatedResponse<Product> | null> => {
    return handleRequest(() => productService.searchProducts(query, filters));
  }, [handleRequest]);

  const getFeaturedProducts = useCallback(async (): Promise<Product[] | null> => {
    const response = await handleRequest(() => productService.getFeaturedProducts());
    return response?.success ? response.data : null;
  }, [handleRequest]);

  // Tours
  const getTours = useCallback(async (filters?: ProductFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Tour> | null> => {
    return handleRequest(() => productService.getTours(filters, page, limit));
  }, [handleRequest]);

  const getTourById = useCallback(async (id: string): Promise<Tour | null> => {
    const response = await handleRequest(() => productService.getTourById(id));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getTourBySlug = useCallback(async (slug: string): Promise<Tour | null> => {
    const response = await handleRequest(() => productService.getTourBySlug(slug));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getTourAvailability = useCallback(async (id: string, date: string): Promise<any | null> => {
    const response = await handleRequest(() => productService.getTourAvailability(id, date));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getFeaturedTours = useCallback(async (): Promise<PaginatedResponse<Tour> | Tour[] | null> => {
    return handleRequest(() => productService.getFeaturedTours());
  }, [handleRequest]);

  // Events
  const getEvents = useCallback(async (filters?: ProductFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Event> | null> => {
    return handleRequest(() => productService.getEvents(filters, page, limit));
  }, [handleRequest]);

  const getEventById = useCallback(async (id: string): Promise<Event | null> => {
    const response = await handleRequest(() => productService.getEventById(id));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getEventBySlug = useCallback(async (slug: string): Promise<Event | null> => {
    const response = await handleRequest(() => productService.getEventBySlug(slug));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getEventAvailability = useCallback(async (id: string, date: string): Promise<any | null> => {
    const response = await handleRequest(() => productService.getEventAvailability(id, date));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  // Transfers
  const getTransfers = useCallback(async (filters?: ProductFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Transfer> | null> => {
    return handleRequest(() => productService.getTransfers(filters, page, limit));
  }, [handleRequest]);

  const getTransferById = useCallback(async (id: string): Promise<Transfer | null> => {
    const response = await handleRequest(() => productService.getTransferById(id));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getTransferRoutes = useCallback(async (): Promise<any[] | null> => {
    const response = await handleRequest(() => productService.getTransferRoutes());
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getTransferPricing = useCallback(async (from: string, to: string, date: string): Promise<any | null> => {
    const response = await handleRequest(() => productService.getTransferPricing(from, to, date));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  // Categories & Locations
  const getCategories = useCallback(async (): Promise<any[] | null> => {
    const response = await handleRequest(() => productService.getCategories());
    return response?.success ? response.data : null;
  }, [handleRequest]);

  const getLocations = useCallback(async (): Promise<any[] | null> => {
    const response = await handleRequest(() => productService.getLocations());
    return response?.success ? response.data : null;
  }, [handleRequest]);

  // Reviews & Ratings
  const getProductReviews = useCallback(async (productId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<any> | null> => {
    return handleRequest(() => productService.getProductReviews(productId, page, limit));
  }, [handleRequest]);

  const submitProductReview = useCallback(async (productId: string, review: any): Promise<any | null> => {
    const response = await handleRequest(() => productService.submitProductReview(productId, review));
    return response?.success ? response.data : null;
  }, [handleRequest]);

  return {
    // State
    isLoading,
    error,
    
    // Generic Product Operations
    getProducts,
    getProductById,
    searchProducts,
    getFeaturedProducts,
    
    // Tours
    getTours,
    getTourById,
    getTourBySlug,
    getTourAvailability,
    getFeaturedTours,
    
    // Events
    getEvents,
    getEventById,
    getEventBySlug,
    getEventAvailability,
    
    // Transfers
    getTransfers,
    getTransferById,
    getTransferRoutes,
    getTransferPricing,
    
    // Categories & Locations
    getCategories,
    getLocations,
    
    // Reviews & Ratings
    getProductReviews,
    submitProductReview,
    
    // Utilities
    clearError: () => setError(null),
  };
}; 