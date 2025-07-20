'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChevronDown, Loader2, Globe } from 'lucide-react';
import { useLanguage } from '../lib/stores/languageStore';
import { Button } from './ui/Button';

const languageNames = {
  fa: 'فارسی',
  en: 'English',
  tr: 'Türkçe',
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  
  const {
    currentLanguage,
    supportedLanguages,
    setLanguage,
    isLoading,
    error,
    initialize
  } = useLanguage();

  // Initialize language store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLanguageChange = async (newLanguage: string) => {
    if (newLanguage !== currentLanguage) {
      try {
        // Set language in backend
        await setLanguage(newLanguage);
        
        // Update URL
        let pathWithoutLocale = pathname;
        
        // Remove the current locale prefix from the pathname
        if (pathname.startsWith(`/${currentLocale}/`)) {
          pathWithoutLocale = pathname.substring(currentLocale.length + 1);
        } else if (pathname === `/${currentLocale}`) {
          pathWithoutLocale = '/';
        }
        
        // Ensure we have a valid path
        if (pathWithoutLocale === '') {
          pathWithoutLocale = '/';
        }
        
        // Create the new path with the new locale prefix
        const newPath = `/${newLanguage}${pathWithoutLocale}`;
        
        router.push(newPath);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  // Error state
  if (error) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-red-500"
        onClick={() => initialize()}
      >
        <Globe className="w-4 h-4" />
        <span>Error</span>
      </Button>
    );
  }

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">
          {languageNames[currentLanguage as keyof typeof languageNames] || currentLanguage}
        </span>
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </Button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {supportedLanguages.map((language) => (
          <button
            key={language}
            onClick={() => handleLanguageChange(language)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              language === currentLanguage
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="flex-1 text-left">
              {languageNames[language as keyof typeof languageNames] || language}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {language}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
} 