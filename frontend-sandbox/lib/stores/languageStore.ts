/**
 * Language Store using Zustand for state management.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import languageApi, { 
  SupportedLanguagesResponse,
  LanguagePreferenceResponse 
} from '../api/language';

interface LanguageState {
  // State
  currentLanguage: string;
  supportedLanguages: string[];
  rtlLanguages: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  isRTL: (language?: string) => boolean;
  getTextDirection: (language?: string) => 'ltr' | 'rtl';
  clearError: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLanguage: 'fa',
      supportedLanguages: ['fa', 'en', 'tr'],
      rtlLanguages: ['fa'],
      isLoading: false,
      error: null,

      // Initialize store
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Get supported languages
          const languagesData = await languageApi.getSupportedLanguages();
          
          set({
            supportedLanguages: languagesData.languages,
            currentLanguage: languagesData.default_language,
            isLoading: false
          });
          
          // Try to get user preference if authenticated
          try {
            const userPreference = await languageApi.getUserLanguagePreference();
            set({ currentLanguage: userPreference.language });
          } catch (error) {
            // User not authenticated or no preference set, use default
            console.log('No user language preference found, using default');
          }
        } catch (error) {
          console.error('Failed to initialize language store:', error);
          // Use fallback values instead of showing error
          set({ 
            supportedLanguages: ['fa', 'en', 'tr'],
            currentLanguage: 'fa',
            isLoading: false,
            error: null // Don't show error, use fallback
          });
        }
      },

      // Set language preference
      setLanguage: async (language: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Validate language
          const { supportedLanguages } = get();
          const isValidLanguage = supportedLanguages.includes(language);
          
          if (!isValidLanguage) {
            throw new Error(`Invalid language: ${language}`);
          }

          // Try to set user preference if authenticated
          try {
            await languageApi.setUserLanguagePreference(language);
          } catch (error) {
            // User not authenticated, set session language
            try {
              await languageApi.setSessionLanguage(language);
            } catch (sessionError) {
              // Backend not available, just update local state
              console.log('Backend not available, updating local language state');
            }
          }

          set({ 
            currentLanguage: language, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to set language:', error);
          // Don't show error, just update local state
          set({ 
            currentLanguage: language,
            isLoading: false,
            error: null
          });
        }
      },

      // Check if language is RTL
      isRTL: (language?: string) => {
        const { rtlLanguages, currentLanguage } = get();
        const lang = language || currentLanguage;
        return rtlLanguages.includes(lang);
      },

      // Get text direction
      getTextDirection: (language?: string) => {
        const { rtlLanguages, currentLanguage } = get();
        const lang = language || currentLanguage;
        return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'language-store',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        supportedLanguages: state.supportedLanguages,
        rtlLanguages: state.rtlLanguages
      })
    }
  )
);

// Hook for easy access to language store
export const useLanguage = () => {
  const store = useLanguageStore();
  
  return {
    ...store,
    // Convenience methods
    getCurrentLanguage: () => store.currentLanguage,
    getSupportedLanguages: () => store.supportedLanguages,
    getRtlLanguages: () => store.rtlLanguages,
  };
}; 