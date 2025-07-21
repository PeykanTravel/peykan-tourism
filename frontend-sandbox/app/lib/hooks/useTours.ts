import { useDataHook, useDataHookWithParams, useCustomHook } from '../../../lib/hooks/hookFactory';
import { getTours, getTourDetail, searchTours, getTourCategories, getTourStats, getTourAvailability } from '../api/tours';
import type { Tour, TourCategory, TourSearchParams } from '../api/tours';

// Custom fetchers for specific API calls
const tourDetailFetcher = async (slug: string) => {
  const response = await getTourDetail(slug);
  return response.data;
};

const tourSearchFetcher = async (searchParams: TourSearchParams) => {
  const response = await searchTours(searchParams);
  return response.data;
};

const categoriesFetcher = async () => {
  const response = await getTourCategories();
  return response.data;
};

const tourStatsFetcher = async (slug: string) => {
  const response = await getTourStats(slug);
  return response.data;
};

const tourAvailabilityFetcher = async (slug: string, params: { date_from: string; date_to: string }) => {
  const response = await getTourAvailability(slug, params);
  return response.data;
};

// Hook for tours list
export const useTours = (params?: Record<string, any>) => {
  const { data, error, isLoading, mutate } = useDataHookWithParams(
    params ? ['/api/tours', params] : null
  );

  return {
    tours: (data as any)?.results || [],
    pagination: {
      count: (data as any)?.count || 0,
      next: (data as any)?.next,
      previous: (data as any)?.previous,
    },
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour detail
export const useTourDetail = (slug: string) => {
  const { data, error, isLoading, mutate } = useCustomHook(
    slug ? `/api/tours/${slug}` : null,
    () => tourDetailFetcher(slug)
  );

  return {
    tour: data,
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour search
export const useTourSearch = (searchParams: TourSearchParams) => {
  const { data, error, isLoading, mutate } = useCustomHook(
    searchParams ? `/api/tours/search` : null,
    () => tourSearchFetcher(searchParams)
  );

  return {
    tours: (data as any)?.results || [],
    pagination: {
      count: (data as any)?.count || 0,
      next: (data as any)?.next,
      previous: (data as any)?.previous,
    },
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour categories
export const useTourCategories = () => {
  const { data, error, isLoading, mutate } = useCustomHook(
    '/api/tours/categories',
    categoriesFetcher
  );

  return {
    categories: data || [],
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour stats
export const useTourStats = (slug: string) => {
  const { data, error, isLoading, mutate } = useCustomHook(
    slug ? `/api/tours/${slug}/stats` : null,
    () => tourStatsFetcher(slug)
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour availability
export const useTourAvailability = (slug: string, dateFrom: string, dateTo: string) => {
  const { data, error, isLoading, mutate } = useCustomHook(
    slug && dateFrom && dateTo ? `/api/tours/${slug}/availability` : null,
    () => tourAvailabilityFetcher(slug, { date_from: dateFrom, date_to: dateTo })
  );

  return {
    availability: (data as any)?.availability || [],
    tour: (data as any)?.tour,
    isLoading,
    error,
    mutate,
  };
}; 