/**
 * Language API client for Peykan Tourism Platform.
 */

import { apiClient } from './client';

// Types
export interface Language {
  code: string;
  name: string;
  native_name: string;
  is_rtl: boolean;
}

export interface SupportedLanguagesResponse {
  languages: string[];
  default_language: string;
  current_language: string;
  rtl_languages: string[];
}

export interface LanguagePreferenceRequest {
  language: string;
}

export interface LanguagePreferenceResponse {
  language: string;
  language_name: string;
  direction: 'ltr' | 'rtl';
}

export interface SessionLanguageRequest {
  language: string;
}

export interface SessionLanguageResponse {
  message: string;
  language: string;
  language_name: string;
  direction: 'ltr' | 'rtl';
}

// Language API functions
export const languageApi = {
  /**
   * Get supported languages and current language
   */
  getSupportedLanguages: async (): Promise<SupportedLanguagesResponse> => {
    const response = await apiClient.get('/shared/language/supported/');
    return response.data;
  },

  /**
   * Get user language preference (authenticated users)
   */
  getUserLanguagePreference: async (): Promise<LanguagePreferenceResponse> => {
    const response = await apiClient.get('/shared/language/preference/');
    return response.data;
  },

  /**
   * Update user language preference (authenticated users)
   */
  setUserLanguagePreference: async (language: string): Promise<LanguagePreferenceResponse> => {
    const response = await apiClient.put('/shared/language/preference/', { language });
    return response.data;
  },

  /**
   * Set session language (guest users)
   */
  setSessionLanguage: async (language: string): Promise<SessionLanguageResponse> => {
    const response = await apiClient.post('/shared/language/session/', { language });
    return response.data;
  },
};

export default languageApi; 