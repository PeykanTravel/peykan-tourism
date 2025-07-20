'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useLocale } from 'next-intl';

interface RTLContextType {
  isRTL: boolean;
  locale: string;
  textDirection: 'rtl' | 'ltr';
  fontFamily: string;
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

interface RTLProviderProps {
  children: ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  const locale = useLocale();
  const isRTL = locale === 'fa';
  const textDirection = isRTL ? 'rtl' : 'ltr';
  const fontFamily = isRTL ? 'font-persian' : 'font-english';

  const value: RTLContextType = {
    isRTL,
    locale,
    textDirection,
    fontFamily,
  };

  return (
    <RTLContext.Provider value={value}>
      <div 
        dir={textDirection} 
        className={`${fontFamily} ${isRTL ? 'rtl' : 'ltr'}`}
      >
        {children}
      </div>
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (!context) {
    throw new Error('useRTL must be used within RTLProvider');
  }
  return context;
}

// Utility components for RTL-aware layouts
export function RTLContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isRTL } = useRTL();
  
  return (
    <div className={`${isRTL ? 'rtl' : 'ltr'} ${className}`}>
      {children}
    </div>
  );
}

export function RTLFlex({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isRTL } = useRTL();
  
  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      {children}
    </div>
  );
}

export function RTLText({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isRTL } = useRTL();
  
  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </div>
  );
}

export function RTLMargin({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isRTL } = useRTL();
  
  return (
    <div className={`${isRTL ? 'mr-4' : 'ml-4'} ${className}`}>
      {children}
    </div>
  );
}

export function RTLPadding({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { isRTL } = useRTL();
  
  return (
    <div className={`${isRTL ? 'pr-4' : 'pl-4'} ${className}`}>
      {children}
    </div>
  );
} 