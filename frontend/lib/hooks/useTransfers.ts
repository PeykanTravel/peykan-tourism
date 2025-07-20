/**
 * SWR hooks for Transfer data management.
 * Updated to match backend implementation.
 */

import useSWR, { SWRConfiguration, mutate } from 'swr';
import { 
  Transfer, TransferListResponse, TransferDetailResponse, 
  TransferSearchParams, TransferBookingRequest,
  TransferLocation, TransferRoute, TransferSchedule,
  TransferVariant, TransferOption
} from '../types/api';
import * as transfersApi from '../api/transfers';

// Transfer Routes
export const useTransferRoutes = (
  params?: {
    search?: string;
    origin?: string;
    destination?: string;
  },
  config?: SWRConfiguration
) => {
  const key = params ? ['transfer-routes', params] : 'transfer-routes';
  
  return useSWR<{ results: transfersApi.TransferRoute[] }>(
    key,
    () => transfersApi.getTransferRoutes(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Transfer Route by ID
export const useTransferRoute = (
  routeId: string,
  config?: SWRConfiguration
) => {
  return useSWR<{ data: transfersApi.TransferRoute }>(
    routeId ? ['transfer-route', routeId] : null,
    () => transfersApi.getTransferRoute(routeId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Transfer Pricing Calculation
export const useTransferPricing = (
  routeId: string | null,
  pricingRequest: transfersApi.PricingCalculationRequest | null,
  config?: SWRConfiguration
) => {
  const key = routeId && pricingRequest ? ['transfer-pricing', routeId, pricingRequest] : null;
  
  return useSWR<transfersApi.PricingCalculationResponse>(
    key,
    () => transfersApi.calculateTransferPrice(routeId!, pricingRequest!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

// Transfer Mutations
export const useTransferMutations = () => {
  const addToCart = async (bookingData: transfersApi.TransferBookingRequest) => {
    try {
      const result = await transfersApi.addTransferToCart(bookingData);
      if (result.success) {
        // Invalidate cart data
        mutate('cart');
        return { success: true, data: result };
      } else {
        return { success: false, error: result.message };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add to cart' };
    }
  };

  return {
    addToCart
  };
};

// Legacy hooks for backward compatibility (to be removed)
export const useTransferLocations = (
  params?: {
    search?: string;
    city?: string;
    country?: string;
  },
  config?: SWRConfiguration
) => {
  console.warn('useTransferLocations is deprecated. Use useTransferRoutes instead.');
  return useSWR<any[]>(
    params ? ['transfer-locations', params] : 'transfer-locations',
    () => transfersApi.getTransferLocations(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransfers = (
  params?: any,
  config?: SWRConfiguration
) => {
  console.warn('useTransfers is deprecated. Use useTransferRoutes instead.');
  return useSWR<any>(
    params ? ['transfers', params] : 'transfers',
    () => transfersApi.getTransfers(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferSearch = (
  searchParams: any,
  config?: SWRConfiguration
) => {
  console.warn('useTransferSearch is deprecated. Use useTransferRoutes instead.');
  return useSWR<any>(
    ['transfer-search', searchParams],
    () => transfersApi.searchTransfers(searchParams),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferBySlug = (
  slug: string,
  config?: SWRConfiguration
) => {
  console.warn('useTransferBySlug is deprecated. Use useTransferRoute instead.');
  return useSWR<any>(
    slug ? ['transfer', slug] : null,
    () => transfersApi.getTransferBySlug(slug),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferById = (
  id: string,
  config?: SWRConfiguration
) => {
  console.warn('useTransferById is deprecated. Use useTransferRoute instead.');
  return useSWR<any>(
    id ? ['transfer', id] : null,
    () => transfersApi.getTransferById(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferSchedules = (
  transferId: string,
  config?: SWRConfiguration
) => {
  console.warn('useTransferSchedules is deprecated. Schedules are not used in transfer routes.');
  return useSWR<any[]>(
    transferId ? ['transfer-schedules', transferId] : null,
    () => transfersApi.getTransferSchedules(transferId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferAvailability = (
  transferId: string,
  config?: SWRConfiguration
) => {
  console.warn('useTransferAvailability is deprecated. Transfers are always available.');
  return useSWR<any>(
    transferId ? ['transfer-availability', transferId] : null,
    () => transfersApi.getTransferAvailability(transferId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferFilters = (config?: SWRConfiguration) => {
  console.warn('useTransferFilters is deprecated.');
  return useSWR<any>(
    'transfer-filters',
    () => transfersApi.getTransferFilters(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferStats = (
  transferId: string,
  config?: SWRConfiguration
) => {
  console.warn('useTransferStats is deprecated.');
  return useSWR<any>(
    transferId ? ['transfer-stats', transferId] : null,
    () => transfersApi.getTransferStats(transferId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useRouteByLocations = (
  pickupLocationId: string,
  dropoffLocationId: string,
  config?: SWRConfiguration
) => {
  console.warn('useRouteByLocations is deprecated. Use useTransferRoutes with origin/destination params.');
  return useSWR<any[]>(
    ['route-by-locations', pickupLocationId, dropoffLocationId],
    () => transfersApi.getRouteByLocations(pickupLocationId, dropoffLocationId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
};

export const useTransferBooking = (transferId: string) => {
  console.warn('useTransferBooking is deprecated. Use useTransferMutations instead.');
  return {
    bookTransfer: async (bookingData: any) => {
      return transfersApi.bookTransfer(transferId, bookingData);
    }
  };
};

export const useTransferSearchWithFilters = (searchParams: any) => {
  console.warn('useTransferSearchWithFilters is deprecated. Use useTransferRoutes instead.');
  return useTransferSearch(searchParams);
}; 

// Transfer Options
export const useTransferOptions = (
  config?: SWRConfiguration
) => {
  return useSWR<{ count: number; next: string | null; previous: string | null; results: transfersApi.TransferOption[] }>(
    'transfer-options',
    () => transfersApi.getTransferOptions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config
    }
  );
}; 