/**
 * Currency API client for Peykan Tourism Platform.
 */

import { apiClient } from './client';

// Types
export interface Currency {
  currency_code: string;
  currency_name: string;
  symbol: string;
  is_default: boolean;
  is_active: boolean;
}

export interface CurrencyRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  last_updated: string;
}

export interface SupportedCurrenciesResponse {
  currencies: Currency[];
  default_currency: string;
  exchange_rates: Record<string, number>;
}

export interface CurrencyConversionRequest {
  amount: number;
  from_currency: string;
  to_currency: string;
}

export interface CurrencyConversionResponse {
  from_currency: string;
  to_currency: string;
  original_amount: number;
  converted_amount: number;
  rate: number;
  formatted_amount: string;
}

export interface CurrencyFormatRequest {
  amount: number;
  currency: string;
  locale?: string;
}

export interface CurrencyFormatResponse {
  formatted_amount: string;
  currency: string;
  locale: string;
}

export interface UserCurrencyPreference {
  currency: string;
  currency_name: string;
  symbol: string;
}

export interface SessionCurrencyRequest {
  currency: string;
}

export interface SessionCurrencyResponse {
  message: string;
  currency: string;
  currency_name: string;
  symbol: string;
}

// Currency API functions
export const currencyApi = {
  /**
   * Get supported currencies and exchange rates
   */
  getSupportedCurrencies: async (): Promise<SupportedCurrenciesResponse> => {
    const response = await apiClient.get('/shared/currency/supported/');
    return response.data;
  },

  /**
   * Get current exchange rates
   */
  getExchangeRates: async (): Promise<Record<string, number>> => {
    const response = await apiClient.get('/shared/currency/rates/');
    return response.data.exchange_rates;
  },

  /**
   * Convert currency
   */
  convertCurrency: async (data: CurrencyConversionRequest): Promise<CurrencyConversionResponse> => {
    const response = await apiClient.post('/shared/currency/convert/', data);
    return response.data;
  },

  /**
   * Format price
   */
  formatPrice: async (data: CurrencyFormatRequest): Promise<CurrencyFormatResponse> => {
    const response = await apiClient.post('/shared/currency/format/', data);
    return response.data;
  },

  /**
   * Bulk currency conversion
   */
  bulkConvert: async (conversions: CurrencyConversionRequest[]): Promise<CurrencyConversionResponse[]> => {
    const response = await apiClient.post('/shared/currency/bulk-convert/', {
      conversions
    });
    return response.data.converted_amounts;
  },

  /**
   * Get user currency preference (authenticated users)
   */
  getUserCurrencyPreference: async (): Promise<UserCurrencyPreference> => {
    const response = await apiClient.get('/shared/currency/preference/');
    return response.data;
  },

  /**
   * Update user currency preference (authenticated users)
   */
  setUserCurrencyPreference: async (currency: string): Promise<UserCurrencyPreference> => {
    const response = await apiClient.put('/shared/currency/preference/', { currency });
    return response.data;
  },

  /**
   * Set session currency (guest users)
   */
  setSessionCurrency: async (currency: string): Promise<SessionCurrencyResponse> => {
    const response = await apiClient.post('/shared/currency/session/', { currency });
    return response.data;
  },
};

export default currencyApi; 