'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  locale: string;
  isRTL: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLocale: (locale: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isDark, setIsDark] = useState(true);
  const [locale, setLocaleState] = useState('fa');
  const [isRTL, setIsRTL] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Initialize theme and locale from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLocale = localStorage.getItem('locale') || 'fa';
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      setThemeState('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    setLocaleState(savedLocale);
    setIsRTL(savedLocale === 'fa');
    localStorage.setItem('locale', savedLocale);
    
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setIsDark(systemTheme === 'dark');
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, mounted]);

  // Apply locale and direction to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Set lang and dir attributes
    root.lang = locale;
    root.dir = isRTL ? 'rtl' : 'ltr';
    
    // Add/remove RTL classes
    if (isRTL) {
      root.classList.add('rtl');
      root.classList.remove('ltr');
    } else {
      root.classList.add('ltr');
      root.classList.remove('rtl');
    }
  }, [locale, isRTL, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    setIsRTL(newLocale === 'fa');
    localStorage.setItem('locale', newLocale);
  };

  const value = {
    theme,
    isDark,
    locale,
    isRTL,
    setTheme,
    toggleTheme,
    setLocale,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values instead of throwing error
    return {
      theme: 'dark' as Theme,
      isDark: true,
      locale: 'fa',
      isRTL: true,
      setTheme: () => {},
      toggleTheme: () => {},
      setLocale: () => {},
    };
  }
  return context;
} 