/**
 * Hook Factory for standardized data fetching
 * Ensures all hooks follow the same pattern
 */

import useSWR, { SWRConfiguration } from 'swr';
import { fetcher, fetcherWithParams, swrConfig, swrConfigRealtime, swrConfigStatic } from '../api/fetcher';

// Base hook interface
export interface BaseHookReturn<T> {
  data: T | undefined;
  error: any;
  isLoading: boolean;
  mutate: (data?: T, options?: any) => Promise<T | undefined>;
  isValidating: boolean;
}

// Hook factory for simple GET requests
export function useDataHook<T>(
  key: string | null,
  config?: SWRConfiguration
): BaseHookReturn<T> {
  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    key,
    fetcher,
    { ...swrConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  };
}

// Hook factory for GET requests with parameters
export function useDataHookWithParams<T>(
  key: [string, Record<string, any>] | null,
  config?: SWRConfiguration
): BaseHookReturn<T> {
  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    key,
    ([url, params]) => fetcherWithParams(url, params as Record<string, any>),
    { ...swrConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  };
}

// Hook factory for real-time data
export function useRealtimeHook<T>(
  key: string | null,
  config?: SWRConfiguration
): BaseHookReturn<T> {
  return useDataHook<T>(key, { ...swrConfigRealtime, ...config });
}

// Hook factory for static data
export function useStaticHook<T>(
  key: string | null,
  config?: SWRConfiguration
): BaseHookReturn<T> {
  return useDataHook<T>(key, { ...swrConfigStatic, ...config });
}

// Hook factory with custom fetcher
export function useCustomHook<T>(
  key: string | string[] | any[] | null,
  customFetcher: (...args: any[]) => Promise<T>,
  config?: SWRConfiguration
): BaseHookReturn<T> {
  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    key,
    customFetcher,
    { ...swrConfig, ...config }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  };
} 