'use client';

import { useEffect, useState } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
  isRTL: boolean;
  locale: string;
}

export default function ThemeProvider({ children, isRTL, locale }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Set HTML lang and dir attributes
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Add RTL/LTR classes to documentElement for testing
    document.documentElement.classList.remove('rtl', 'ltr');
    document.documentElement.classList.add(isRTL ? 'rtl' : 'ltr');
    
    // Check theme from localStorage
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [locale, isRTL]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={`bg-white text-gray-900 min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`bg-white text-gray-900 dark:bg-gray-900 dark:text-white min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      {children}
    </div>
  );
} 