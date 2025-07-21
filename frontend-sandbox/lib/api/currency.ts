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
    try {
      const response = await apiClient.get('/shared/currency/supported/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch supported currencies from backend:', error);
      // Return fallback data only if backend is completely unavailable
      return {
        currencies: [
          { currency_code: 'USD', currency_name: 'US Dollar', symbol: '$', is_active: true, is_default: true },
          { currency_code: 'EUR', currency_name: 'Euro', symbol: '€', is_active: true, is_default: false },
          { currency_code: 'TRY', currency_name: 'Turkish Lira', symbol: '₺', is_active: true, is_default: false },
          { currency_code: 'IRR', currency_name: 'Iranian Rial', symbol: 'ریال', is_active: true, is_default: false }
        ],
        default_currency: 'USD',
        exchange_rates: { USD: 1, EUR: 0.85, TRY: 30, IRR: 420000 }
      };
    }
  },

  /**
   * Get current exchange rates
   */
  getExchangeRates: async (): Promise<Record<string, number>> => {
    try {
      const response = await apiClient.get('/shared/currency/rates/');
      return response.data.exchange_rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates from backend:', error);
      // Return fallback rates only if backend is completely unavailable
      return { USD: 1, EUR: 0.85, TRY: 30, IRR: 420000 };
    }
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