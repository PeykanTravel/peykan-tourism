'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { User, ShoppingCart, LogOut, Settings, Heart, Package, Menu, X, Plane, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/contexts/AuthContext';
import { useUnifiedCart } from '../lib/contexts/UnifiedCartContext';
import { useTheme } from '../lib/contexts/ThemeContext';

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useUnifiedCart();
  const { isDark, toggleTheme } = useTheme();
  
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
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Peykan
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link 
              href={`${prefix}/`} 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname === `${prefix}/` || pathname === `${prefix}` 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              خانه
            </Link>
            <Link 
              href={`${prefix}/tours`} 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname.includes('/tours') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {t('tours')}
            </Link>
            <Link 
              href={`${prefix}/events`} 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname.includes('/events') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {t('events')}
            </Link>
            <Link 
              href={`${prefix}/transfers`} 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname.includes('/transfers') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {t('transfers')}
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              className="p-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <LanguageSwitcher />
            
            {/* Cart */}
            <Link 
              href={`${prefix}/cart`} 
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                totalItems > 0 
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{t('cart')}</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 border border-blue-200 dark:border-blue-700"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.first_name} {user.last_name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 backdrop-blur-lg">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <Link
                        href={`${prefix}/profile`}
                        className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        {t('profile')}
                      </Link>
                      
                      <Link
                        href={`${prefix}/orders`}
                        className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-4 h-4" />
                        {t('orders')}
                      </Link>
                      
                      <Link
                        href={`${prefix}/wishlist`}
                        className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="w-4 h-4" />
                        {t('wishlist')}
                      </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
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
                  className="px-6 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  {t('login')}
                </Link>
                <Link 
                  href={`${prefix}/register`} 
                  className="px-6 py-2 rounded-xl font-medium bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
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
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link 
                  href={`${prefix}/`} 
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    pathname === `${prefix}/` || pathname === `${prefix}` 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  خانه
                </Link>
                <Link 
                  href={`${prefix}/tours`} 
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    pathname.includes('/tours') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('tours')}
                </Link>
                <Link 
                  href={`${prefix}/events`} 
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    pathname.includes('/events') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('events')}
                </Link>
                <Link 
                  href={`${prefix}/transfers`} 
                  className={`block px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    pathname.includes('/transfers') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t('transfers')}
                </Link>
              </div>

              {/* Mobile Cart & Auth */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link 
                  href={`${prefix}/cart`} 
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    totalItems > 0 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5" />
                    <span>{t('cart')}</span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                    totalItems > 0 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-400 dark:bg-gray-600 text-white'
                  }`}>
                    {totalItems}
                  </span>
                </Link>

                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <Link
                      href={`${prefix}/profile`}
                      className="flex items-center gap-3 p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">{t('profile')}</span>
                    </Link>
                    
                    <Link
                      href={`${prefix}/orders`}
                      className="flex items-center gap-3 p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Package className="w-5 h-5" />
                      <span className="font-medium">{t('orders')}</span>
                    </Link>
                    
                    <Link
                      href={`${prefix}/wishlist`}
                      className="flex items-center gap-3 p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
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
                      className="flex items-center gap-3 p-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">{t('logout')}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link 
                      href={`${prefix}/login`} 
                      className="block text-center px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('login')}
                    </Link>
                    <Link 
                      href={`${prefix}/register`} 
                      className="block text-center px-4 py-3 rounded-xl font-medium bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-all duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Theme & Language */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">تنظیمات</span>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <button 
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                    onClick={toggleTheme}
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <NavbarContent />
  );
} 