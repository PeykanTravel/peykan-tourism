import useSWR from 'swr';
import { getTours, getTourDetail, searchTours, getTourCategories, getTourStats, getTourAvailability } from '../api/tours';
import type { Tour, TourCategory, TourSearchParams } from '../api/tours';

// Fetcher functions
const toursFetcher = async (url: string, params?: Record<string, any>) => {
  const response = await getTours(params);
  return response.data;
};

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
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/tours', params],
    ([url, searchParams]) => toursFetcher(url, searchParams),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    tours: data?.results || [],
    pagination: {
      count: data?.count || 0,
      next: data?.next,
      previous: data?.previous,
    },
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour detail
export const useTourDetail = (slug: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `/api/tours/${slug}` : null,
    () => tourDetailFetcher(slug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
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
  const { data, error, isLoading, mutate } = useSWR(
    searchParams ? ['/api/tours/search', searchParams] : null,
    ([url, params]) => tourSearchFetcher(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    tours: data?.results || [],
    pagination: {
      count: data?.count || 0,
      next: data?.next,
      previous: data?.previous,
    },
    isLoading,
    error,
    mutate,
  };
};

// Hook for tour categories
export const useTourCategories = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/tours/categories',
    categoriesFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
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
  const { data, error, isLoading, mutate } = useSWR(
    slug ? `/api/tours/${slug}/stats` : null,
    () => tourStatsFetcher(slug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
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
  const { data, error, isLoading, mutate } = useSWR(
    slug && dateFrom && dateTo ? [`/api/tours/${slug}/availability`, { date_from: dateFrom, date_to: dateTo }] : null,
    ([url, params]) => tourAvailabilityFetcher(slug, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    availability: data?.availability || [],
    tour: data?.tour,
    isLoading,
    error,
    mutate,
  };
}; 