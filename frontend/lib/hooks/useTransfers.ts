/**
 * SWR hooks for Transfer data management.
 * Updated to match backend implementation.
 */

import { useCustomHook } from './hookFactory';
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
  }
) => {
  const key = params ? ['transfer-routes', params] : 'transfer-routes';
  
  return useCustomHook<{ results: transfersApi.TransferRoute[] }>(
    key,
    () => transfersApi.getTransferRoutes(params)
  );
};

// Transfer Route by ID
export const useTransferRoute = (
  routeId: string
) => {
  return useCustomHook<{ data: transfersApi.TransferRoute }>(
    routeId ? ['transfer-route', routeId] : null,
    () => transfersApi.getTransferRoute(routeId)
  );
};

// Transfer Pricing Calculation
export const useTransferPricing = (
  routeId: string | null,
  pricingRequest: transfersApi.PricingCalculationRequest | null
) => {
  const key = routeId && pricingRequest ? ['transfer-pricing', routeId, pricingRequest] : null;
  
  return useCustomHook<transfersApi.PricingCalculationResponse>(
    key,
    () => transfersApi.calculateTransferPrice(routeId!, pricingRequest!)
  );
};

// Transfer Mutations
export const useTransferMutations = () => {
  const addToCart = async (bookingData: transfersApi.TransferBookingRequest) => {
    try {
      const result = await transfersApi.addTransferToCart(bookingData);
      if (result.success) {
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

// Transfer Options
export const useTransferOptions = () => {
  return useCustomHook<{ 
    count: number; 
    next: string | null; 
    previous: string | null; 
    results: transfersApi.TransferOption[] 
  }>(
    'transfer-options',
    () => transfersApi.getTransferOptions()
  );
}; 