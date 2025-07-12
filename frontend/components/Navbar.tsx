'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { User, ShoppingCart, LogOut, Settings, Heart, Package, Menu, X, Plane } from 'lucide-react';
import { useAuth } from '../lib/contexts/AuthContext';
import { useCart } from '../lib/hooks/useCart';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const prefix = `/${locale}`;

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push(`${prefix}/login`);
    } catch (error) {
      console.error('خطا در خروج:', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Peykan
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              href={`${prefix}/`} 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                pathname === `${prefix}/` || pathname === `${prefix}` ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              خانه
            </Link>
            <Link 
              href={`${prefix}/tours`} 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                pathname.includes('/tours') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {t('tours')}
            </Link>
            <Link 
              href={`${prefix}/events`} 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                pathname.includes('/events') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {t('events')}
            </Link>
            <Link 
              href={`${prefix}/transfers`} 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                pathname.includes('/transfers') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {t('transfers')}
            </Link>
            <Link 
              href={`${prefix}/contact`} 
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                pathname.includes('/contact') ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              تماس
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button 
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                if (document.documentElement.classList.contains('dark')) {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } else {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <LanguageSwitcher />
            
            {/* Cart */}
            {totalItems > 0 ? (
              <Link 
                href={`${prefix}/cart`} 
                className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('cart')}</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              </Link>
            ) : (
              <Link 
                href={`${prefix}/cart`} 
                className="relative bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('cart')}</span>
                <span className="absolute -top-1 -right-1 bg-gray-400 dark:bg-gray-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  0
                </span>
              </Link>
            )}

            {/* Authentication */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    
                    <Link
                      href={`${prefix}/profile`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    
                    <Link
                      href={`${prefix}/orders`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package className="w-4 h-4" />
                      {t('orders')}
                    </Link>
                    
                    <Link
                      href={`${prefix}/wishlist`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Heart className="w-4 h-4" />
                      {t('wishlist')}
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-right"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href={`${prefix}/login`} 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {t('login')}
                </Link>
                <Link 
                  href={`${prefix}/register`} 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {showMobileMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <Link 
                  href={`${prefix}/`} 
                  className={`block text-lg font-medium transition-colors ${
                    pathname === `${prefix}/` || pathname === `${prefix}` 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  خانه
                </Link>
                <Link 
                  href={`${prefix}/tours`} 
                  className={`block text-lg font-medium transition-colors ${
                    pathname.includes('/tours') 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('tours')}
                </Link>
                <Link 
                  href={`${prefix}/events`} 
                  className={`block text-lg font-medium transition-colors ${
                    pathname.includes('/events') 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('events')}
                </Link>
                <Link 
                  href={`${prefix}/transfers`} 
                  className={`block text-lg font-medium transition-colors ${
                    pathname.includes('/transfers') 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('transfers')}
                </Link>
                <Link 
                  href={`${prefix}/contact`} 
                  className={`block text-lg font-medium transition-colors ${
                    pathname.includes('/contact') 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  تماس
                </Link>
              </div>

              {/* Mobile Cart */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {totalItems > 0 ? (
                  <Link 
                    href={`${prefix}/cart`} 
                    className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-medium">{t('cart')}</span>
                    </div>
                    <span className="bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  </Link>
                ) : (
                  <Link 
                    href={`${prefix}/cart`} 
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-medium">{t('cart')}</span>
                    </div>
                    <span className="bg-gray-400 dark:bg-gray-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      0
                    </span>
                  </Link>
                )}
              </div>

              {/* Mobile Authentication */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* User Menu Links */}
                    <Link
                      href={`${prefix}/profile`}
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">{t('profile')}</span>
                    </Link>
                    
                    <Link
                      href={`${prefix}/orders`}
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Package className="w-5 h-5" />
                      <span className="font-medium">{t('orders')}</span>
                    </Link>
                    
                    <Link
                      href={`${prefix}/wishlist`}
                      className="flex items-center gap-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">{t('wishlist')}</span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center gap-3 p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full text-right"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">{t('logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      href={`${prefix}/login`} 
                      className="block text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg transition-colors font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link 
                      href={`${prefix}/register`} 
                      className="block text-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">تنظیمات</span>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <button 
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => {
                        if (document.documentElement.classList.contains('dark')) {
                          document.documentElement.classList.remove('dark');
                          localStorage.setItem('theme', 'light');
                        } else {
                          document.documentElement.classList.add('dark');
                          localStorage.setItem('theme', 'dark');
                        }
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 