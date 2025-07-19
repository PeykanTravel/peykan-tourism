import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../domain/entities/User';
import { CartItem } from '../domain/entities/CartItem';
import { Currency } from '../domain/value-objects/Currency';
import { Language } from '../domain/value-objects/Language';

// State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  isDark: boolean;
  isRTL: boolean;
}

export interface CurrencyState {
  currentCurrency: Currency;
  exchangeRates: Record<string, number>;
  isLoading: boolean;
}

export interface LanguageState {
  currentLanguage: Language;
  isLoading: boolean;
}

// Combined App State
export interface AppState {
  auth: AuthState;
  cart: CartState;
  theme: ThemeState;
  currency: CurrencyState;
  language: LanguageState;
}

// Action Types
export type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

export type CartAction =
  | { type: 'CART_START' }
  | { type: 'CART_SUCCESS'; payload: CartItem[] }
  | { type: 'CART_FAILURE'; payload: string }
  | { type: 'CART_ADD_ITEM'; payload: CartItem }
  | { type: 'CART_UPDATE_ITEM'; payload: { id: string; item: CartItem } }
  | { type: 'CART_REMOVE_ITEM'; payload: string }
  | { type: 'CART_CLEAR' }
  | { type: 'CART_CLEAR_ERROR' };

export type ThemeAction =
  | { type: 'THEME_TOGGLE' }
  | { type: 'THEME_SET_DARK'; payload: boolean }
  | { type: 'THEME_SET_RTL'; payload: boolean };

export type CurrencyAction =
  | { type: 'CURRENCY_START' }
  | { type: 'CURRENCY_SUCCESS'; payload: { currency: Currency; rates: Record<string, number> } }
  | { type: 'CURRENCY_FAILURE'; payload: string }
  | { type: 'CURRENCY_SET'; payload: Currency };

export type LanguageAction =
  | { type: 'LANGUAGE_START' }
  | { type: 'LANGUAGE_SUCCESS'; payload: Language }
  | { type: 'LANGUAGE_FAILURE'; payload: string }
  | { type: 'LANGUAGE_SET'; payload: Language };

export type AppAction = AuthAction | CartAction | ThemeAction | CurrencyAction | LanguageAction;

// Initial State
const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
  },
  theme: {
    isDark: false,
    isRTL: false,
  },
  currency: {
    currentCurrency: Currency.create('USD'),
    exchangeRates: {},
    isLoading: false,
  },
  language: {
    currentLanguage: Language.create('fa'),
    isLoading: false,
  },
};

// Reducers
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CART_START':
      return { ...state, isLoading: true, error: null };
    case 'CART_SUCCESS':
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.reduce((sum, item) => sum + item.quantity.value, 0),
        totalPrice: action.payload.reduce((sum, item) => {
          const totalPrice = item.getTotalPrice();
          return sum + (totalPrice ? totalPrice.getAmount() : 0);
        }, 0),
        isLoading: false,
        error: null,
      };
    case 'CART_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'CART_ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = action.payload;
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity.value, 0),
          totalPrice: updatedItems.reduce((sum, item) => {
            const totalPrice = item.getTotalPrice();
            return sum + (totalPrice ? totalPrice.getAmount() : 0);
          }, 0),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        totalItems: state.totalItems + action.payload.quantity.value,
        totalPrice: state.totalPrice + (action.payload.getTotalPrice()?.getAmount() || 0),
      };
    case 'CART_UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id ? action.payload.item : item
      );
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity.value, 0),
        totalPrice: updatedItems.reduce((sum, item) => {
          const totalPrice = item.getTotalPrice();
          return sum + (totalPrice ? totalPrice.getAmount() : 0);
        }, 0),
      };
    case 'CART_REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity.value, 0),
        totalPrice: filteredItems.reduce((sum, item) => {
          const totalPrice = item.getTotalPrice();
          return sum + (totalPrice ? totalPrice.getAmount() : 0);
        }, 0),
      };
    case 'CART_CLEAR':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    case 'CART_CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'THEME_TOGGLE':
      return { ...state, isDark: !state.isDark };
    case 'THEME_SET_DARK':
      return { ...state, isDark: action.payload };
    case 'THEME_SET_RTL':
      return { ...state, isRTL: action.payload };
    default:
      return state;
  }
};

const currencyReducer = (state: CurrencyState, action: CurrencyAction): CurrencyState => {
  switch (action.type) {
    case 'CURRENCY_START':
      return { ...state, isLoading: true };
    case 'CURRENCY_SUCCESS':
      return {
        ...state,
        currentCurrency: action.payload.currency,
        exchangeRates: action.payload.rates,
        isLoading: false,
      };
    case 'CURRENCY_FAILURE':
      return { ...state, isLoading: false };
    case 'CURRENCY_SET':
      return { ...state, currentCurrency: action.payload };
    default:
      return state;
  }
};

const languageReducer = (state: LanguageState, action: LanguageAction): LanguageState => {
  switch (action.type) {
    case 'LANGUAGE_START':
      return { ...state, isLoading: true };
    case 'LANGUAGE_SUCCESS':
    case 'LANGUAGE_SET':
      return { ...state, currentLanguage: action.payload, isLoading: false };
    case 'LANGUAGE_FAILURE':
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

// Main App Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  return {
    auth: authReducer(state.auth, action as AuthAction),
    cart: cartReducer(state.cart, action as CartAction),
    theme: themeReducer(state.theme, action as ThemeAction),
    currency: currencyReducer(state.currency, action as CurrencyAction),
    language: languageReducer(state.language, action as LanguageAction),
  };
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      dispatch({ type: 'THEME_SET_DARK', payload: savedTheme === 'dark' });
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', state.theme.isDark ? 'dark' : 'light');
  }, [state.theme.isDark]);

  // Initialize language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      dispatch({ type: 'LANGUAGE_SET', payload: Language.create(savedLanguage) });
    }
  }, []);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('language', state.language.currentLanguage.getCode());
  }, [state.language.currentLanguage]);

  // Initialize currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      dispatch({ type: 'CURRENCY_SET', payload: Currency.create(savedCurrency) });
    }
  }, []);

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem('currency', state.currency.currentCurrency.getCode());
  }, [state.currency.currentCurrency]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hooks
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const useAuth = () => {
  const { state, dispatch } = useAppContext();
  return {
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    login: (user: User) => dispatch({ type: 'AUTH_SUCCESS', payload: user }),
    logout: () => dispatch({ type: 'AUTH_LOGOUT' }),
    setLoading: (loading: boolean) => {
      if (loading) {
        dispatch({ type: 'AUTH_START' });
      } else if (state.auth.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: state.auth.user });
      }
    },
    setError: (error: string) => dispatch({ type: 'AUTH_FAILURE', payload: error }),
    clearError: () => dispatch({ type: 'AUTH_CLEAR_ERROR' }),
  };
};

export const useCart = () => {
  const { state, dispatch } = useAppContext();
  return {
    items: state.cart.items,
    totalItems: state.cart.totalItems,
    totalPrice: state.cart.totalPrice,
    isLoading: state.cart.isLoading,
    error: state.cart.error,
    addItem: (item: CartItem) => dispatch({ type: 'CART_ADD_ITEM', payload: item }),
    updateItem: (id: string, item: CartItem) => 
      dispatch({ type: 'CART_UPDATE_ITEM', payload: { id, item } }),
    removeItem: (id: string) => dispatch({ type: 'CART_REMOVE_ITEM', payload: id }),
    clearCart: () => dispatch({ type: 'CART_CLEAR' }),
    setItems: (items: CartItem[]) => dispatch({ type: 'CART_SUCCESS', payload: items }),
    setLoading: (loading: boolean) => {
      if (loading) {
        dispatch({ type: 'CART_START' });
      } else {
        dispatch({ type: 'CART_SUCCESS', payload: state.cart.items });
      }
    },
    setError: (error: string) => dispatch({ type: 'CART_FAILURE', payload: error }),
    clearError: () => dispatch({ type: 'CART_CLEAR_ERROR' }),
  };
};

export const useTheme = () => {
  const { state, dispatch } = useAppContext();
  return {
    isDark: state.theme.isDark,
    isRTL: state.theme.isRTL,
    toggleTheme: () => dispatch({ type: 'THEME_TOGGLE' }),
    setDark: (isDark: boolean) => dispatch({ type: 'THEME_SET_DARK', payload: isDark }),
    setRTL: (isRTL: boolean) => dispatch({ type: 'THEME_SET_RTL', payload: isRTL }),
  };
};

export const useCurrency = () => {
  const { state, dispatch } = useAppContext();
  return {
    currentCurrency: state.currency.currentCurrency,
    exchangeRates: state.currency.exchangeRates,
    isLoading: state.currency.isLoading,
    setCurrency: (currency: Currency) => dispatch({ type: 'CURRENCY_SET', payload: currency }),
    setExchangeRates: (rates: Record<string, number>) => 
      dispatch({ type: 'CURRENCY_SUCCESS', payload: { currency: state.currency.currentCurrency, rates } }),
    setLoading: (loading: boolean) => {
      if (loading) {
        dispatch({ type: 'CURRENCY_START' });
      } else {
        dispatch({ type: 'CURRENCY_SUCCESS', payload: { currency: state.currency.currentCurrency, rates: state.currency.exchangeRates } });
      }
    },
  };
};

export const useLanguage = () => {
  const { state, dispatch } = useAppContext();
  return {
    currentLanguage: state.language.currentLanguage,
    isLoading: state.language.isLoading,
    setLanguage: (language: Language) => dispatch({ type: 'LANGUAGE_SET', payload: language }),
    setLoading: (loading: boolean) => {
      if (loading) {
        dispatch({ type: 'LANGUAGE_START' });
      } else {
        dispatch({ type: 'LANGUAGE_SET', payload: state.language.currentLanguage });
      }
    },
  };
}; 