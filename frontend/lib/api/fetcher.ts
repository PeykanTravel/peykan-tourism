/**
 * Centralized fetcher for SWR
 * Standardizes all API calls through a single interface
 */

import { apiClient } from './client';

// Main fetcher function
export const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

// Fetcher with parameters
export const fetcherWithParams = async (url: string, params?: Record<string, any>) => {
  const response = await apiClient.get(url, { params });
  return response.data;
};

// POST fetcher
export const postFetcher = async (url: string, data?: any) => {
  const response = await apiClient.post(url, data);
  return response.data;
};

// PUT fetcher
export const putFetcher = async (url: string, data?: any) => {
  const response = await apiClient.put(url, data);
  return response.data;
};

// DELETE fetcher
export const deleteFetcher = async (url: string) => {
  const response = await apiClient.delete(url);
  return response.data;
};

// SWR Configuration
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 300000, // 5 minutes
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// SWR Configuration for real-time data
export const swrConfigRealtime = {
  ...swrConfig,
  refreshInterval: 30000, // 30 seconds
  dedupingInterval: 30000, // 30 seconds
};

// SWR Configuration for static data
export const swrConfigStatic = {
  ...swrConfig,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 3600000, // 1 hour
}; 