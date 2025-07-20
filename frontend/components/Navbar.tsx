'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { User, ShoppingCart, LogOut, Settings, Heart, Package, Menu, X, Plane, Sun, Moon } from 'lucide-react';
import { useAuth } from '../lib/contexts/AuthContext';
import { useCart } from '../lib/hooks/useCart';
import { Button } from './ui/Button';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const locale = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const prefix = `/${locale}`;

  // Check theme on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    setIsDark(theme === 'dark');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push(`${prefix}/login`);
    } catch (error) {
      console.error('خطا در خروج:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

  const navItems = [
    { href: `${prefix}/`, label: 'خانه', active: pathname === `${prefix}/` || pathname === `${prefix}` },
    { href: `${prefix}/tours`, label: t('tours'), active: pathname.includes('/tours') },
    { href: `${prefix}/events`, label: t('events'), active: pathname.includes('/events') },
    { href: `${prefix}/transfers`, label: t('transfers'), active: pathname.includes('/transfers') },
    { href: `${prefix}/contact`, label: 'تماس', active: pathname.includes('/contact') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href={`${prefix}/`} className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Peykan
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  item.active 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {item.label}
                {item.active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg transition-transform duration-300 ${
                isDark ? 'translate-y-0' : '-translate-y-full'
              }`}></div>
              <Sun className={`w-5 h-5 transition-all duration-300 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              <Moon className={`absolute w-5 h-5 transition-all duration-300 ${isDark ? 'text-white' : 'text-gray-600'}`} />
            </Button>

            <LanguageSwitcher />
            
            {/* Cart */}
            <Link href={`${prefix}/cart`} className="relative group">
              <Button
                variant={totalItems > 0 ? "default" : "outline"}
                size="sm"
                leftIcon={<ShoppingCart className="w-4 h-4" />}
                className="relative overflow-hidden"
              >
                <span>{t('cart')}</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Authentication */}
            {isAuthenticated && user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </span>
                </Button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-down">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
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
                        className="flex items-center gap-3 px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={`${prefix}/login`}>
                  <Button variant="ghost" size="sm">
                    {t('login')}
                  </Button>
                </Link>
                <Link href={`${prefix}/register`}>
                  <Button variant="default" size="sm">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 animate-slide-down">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4">
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 