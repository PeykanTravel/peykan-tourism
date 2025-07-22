/**
 * Currency Store using Zustand for state management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import currencyApi, { 
  Currency, 
  SupportedCurrenciesResponse,
  CurrencyConversionRequest,
  CurrencyFormatRequest 
} from '../api/currency';

interface CurrencyState {
  // State
  currentCurrency: string;
  supportedCurrencies: Currency[];
  exchangeRates: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  convertPrice: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number>;
  formatPrice: (amount: number, currency: string, locale?: string) => Promise<string>;
  refreshRates: () => Promise<void>;
  clearError: () => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCurrency: 'USD',
      supportedCurrencies: [],
      exchangeRates: {},
      isLoading: false,
      error: null,

      // Initialize store
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get supported currencies
          const currenciesData: SupportedCurrenciesResponse = await currencyApi.getSupportedCurrencies();
          
          set({
            supportedCurrencies: currenciesData.currencies,
            exchangeRates: currenciesData.exchange_rates,
            currentCurrency: currenciesData.default_currency,
            isLoading: false
          });
          
          // Try to get user preference if authenticated
          try {
            const userPreference = await currencyApi.getUserCurrencyPreference();
            set({ currentCurrency: userPreference.currency });
          } catch (error) {
            // User not authenticated or no preference set, use default
            console.log('No user currency preference found, using default');
          }
        } catch (error) {
          console.error('Failed to initialize currency store:', error);
          // Use fallback values instead of showing error
          set({ 
            supportedCurrencies: [
              { currency_code: 'USD', currency_name: 'US Dollar', symbol: '$', is_active: true, is_default: true },
              { currency_code: 'EUR', currency_name: 'Euro', symbol: '€', is_active: true, is_default: false },
              { currency_code: 'TRY', currency_name: 'Turkish Lira', symbol: '₺', is_active: true, is_default: false },
              { currency_code: 'IRR', currency_name: 'Iranian Rial', symbol: 'ریال', is_active: true, is_default: false }
            ],
            exchangeRates: { USD: 1, EUR: 0.85, TRY: 30, IRR: 420000 },
            currentCurrency: 'USD',
            isLoading: false,
            error: null // Don't show error, use fallback
          });
        }
      },

      // Set currency preference
      setCurrency: async (currency: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Validate currency
          const { supportedCurrencies } = get();
          const isValidCurrency = supportedCurrencies.some(c => c.currency_code === currency);
          
          if (!isValidCurrency) {
            throw new Error(`Invalid currency: ${currency}`);
          }

          // Try to set user preference if authenticated
          try {
            await currencyApi.setUserCurrencyPreference(currency);
          } catch (error) {
            // User not authenticated, set session currency
            try {
              await currencyApi.setSessionCurrency(currency);
            } catch (sessionError) {
              // Backend not available, just update local state
              console.log('Backend not available, updating local currency state');
            }
          }

          set({ 
            currentCurrency: currency, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to set currency:', error);
          // Don't show error, just update local state
          set({ 
            currentCurrency: currency,
            isLoading: false,
            error: null
          });
        }
      },

      // Convert price
      convertPrice: async (amount: number, fromCurrency: string, toCurrency: string): Promise<number> => {
        try {
          // Handle zero and negative amounts
          if (amount === 0) return 0;
          
          // If same currency, return original amount
          if (fromCurrency === toCurrency) return amount;

          const conversionData: CurrencyConversionRequest = {
            amount,
            from_currency: fromCurrency,
            to_currency: toCurrency
          };

          const result = await currencyApi.convertCurrency(conversionData);
          return result.converted_amount;
        } catch (error) {
          console.error('Failed to convert currency:', error);
          // Return original amount on error
          return amount;
        }
      },

      // Format price
      formatPrice: async (amount: number, currency: string, locale?: string): Promise<string> => {
        try {
          // Handle invalid inputs
          if (amount === null || amount === undefined || isNaN(amount)) {
            return '0';
          }

          const formatData: CurrencyFormatRequest = {
            amount,
            currency,
            locale: locale || 'en'
          };

          const result = await currencyApi.formatPrice(formatData);
          return result.formatted_amount;
        } catch (error) {
          console.error('Failed to format price:', error);
          // Fallback formatting with better error handling
          try {
            return new Intl.NumberFormat(locale || 'en', {
              style: 'currency',
              currency: currency || 'USD'
            }).format(amount);
          } catch (formatError) {
            console.error('Fallback formatting also failed:', formatError);
            // Ultimate fallback
            return `${amount} ${currency || 'USD'}`;
          }
        }
      },

      // Refresh exchange rates
      refreshRates: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const rates = await currencyApi.getExchangeRates();
          set({ 
            exchangeRates: rates, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to refresh rates:', error);
          set({ 
            error: 'Failed to refresh exchange rates', 
            isLoading: false 
          });
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'currency-store',
      partialize: (state) => ({
        currentCurrency: state.currentCurrency,
        supportedCurrencies: state.supportedCurrencies,
        exchangeRates: state.exchangeRates
      })
    }
  )
);

// Hook for easy access to currency store
export const useCurrency = () => {
  const store = useCurrencyStore();
  
  return {
    ...store,
    // Convenience methods
    getCurrentCurrency: () => store.currentCurrency,
    getSupportedCurrencies: () => store.supportedCurrencies,
    getExchangeRates: () => store.exchangeRates,
    isRTL: () => store.currentCurrency === 'IRR', // IRR is RTL
  };
}; 