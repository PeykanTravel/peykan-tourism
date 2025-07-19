import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '../services/ProductService';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { ProductRepositoryImpl } from '../../infrastructure/repositories/ProductRepositoryImpl';
import { ApiClient } from '../../infrastructure/api/ApiClient';

export interface UseProductsReturn {
  products: Product[];
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
  getProducts: (filters?: GetProductsFilters) => Promise<void>;
  getProductById: (id: string) => Promise<void>;
  getTours: (filters?: Omit<GetProductsFilters, 'type'>) => Promise<void>;
  getEvents: (filters?: Omit<GetProductsFilters, 'type'>) => Promise<void>;
  getTransfers: (filters?: Omit<GetProductsFilters, 'type'>) => Promise<void>;
  searchProducts: (query: string, filters?: Omit<GetProductsFilters, 'search'>) => Promise<void>;
  clearError: () => void;
  clearProducts: () => void;
}

export interface GetProductsFilters {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  location?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Initialize product service
  const apiClient = new ApiClient();
  const productRepository = new ProductRepositoryImpl(apiClient);
  const productService = new ProductService(productRepository);

  const getProducts = useCallback(async (filters?: GetProductsFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await productService.getProducts({
        type: filters?.type,
        category: filters?.category,
        minPrice: filters?.minPrice,
        maxPrice: filters?.maxPrice,
        currency: filters?.currency,
        location: filters?.location,
        page: filters?.page || 1,
        limit: filters?.limit || 10,
        search: filters?.search
      });
      
      setProducts(result.products);
      setTotal(result.total);
      setPage(result.page);
      setHasMore(result.hasMore);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [productService]);

  const getProductById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await productService.getProductById(id);
      setProduct(result);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [productService]);

  const getTours = useCallback(async (filters?: Omit<GetProductsFilters, 'type'>) => {
    await getProducts({ ...filters, type: 'tour' });
  }, [getProducts]);

  const getEvents = useCallback(async (filters?: Omit<GetProductsFilters, 'type'>) => {
    await getProducts({ ...filters, type: 'event' });
  }, [getProducts]);

  const getTransfers = useCallback(async (filters?: Omit<GetProductsFilters, 'type'>) => {
    await getProducts({ ...filters, type: 'transfer' });
  }, [getProducts]);

  const searchProducts = useCallback(async (query: string, filters?: Omit<GetProductsFilters, 'search'>) => {
    await getProducts({ ...filters, search: query });
  }, [getProducts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearProducts = useCallback(() => {
    setProducts([]);
    setProduct(null);
    setTotal(0);
    setPage(1);
    setHasMore(false);
  }, []);

  return {
    products,
    product,
    isLoading,
    error,
    total,
    page,
    hasMore,
    getProducts,
    getProductById,
    getTours,
    getEvents,
    getTransfers,
    searchProducts,
    clearError,
    clearProducts
  };
} 