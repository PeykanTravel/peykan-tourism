/**
 * Combined hook for currency and language management.
 */

import { useCurrency } from '../stores/currencyStore';
import { useLanguage } from '../stores/languageStore';

export const useCurrencyLanguage = () => {
  const currency = useCurrency();
  const language = useLanguage();

  return {
    // Currency
    currentCurrency: currency.currentCurrency,
    supportedCurrencies: currency.supportedCurrencies,
    setCurrency: currency.setCurrency,
    convertPrice: currency.convertPrice,
    formatPrice: currency.formatPrice,
    currencyLoading: currency.isLoading,
    currencyError: currency.error,

    // Language
    currentLanguage: language.currentLanguage,
    supportedLanguages: language.supportedLanguages,
    setLanguage: language.setLanguage,
    isRTL: language.isRTL,
    getTextDirection: language.getTextDirection,
    languageLoading: language.isLoading,
    languageError: language.error,

    // Combined
    isLoading: currency.isLoading || language.isLoading,
    hasError: currency.error || language.error,
  };
}; 