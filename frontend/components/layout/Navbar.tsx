/**
 * Modern Navigation Bar Component
 * 
 * A comprehensive navbar with responsive design, user menu,
 * cart integration, and search functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingCart, 
  User, 
  Globe,
  ChevronDown,
  Heart,
  Bell
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Hooks
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/hooks/useCart';

// Types
interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const t = useTranslations('navbar');
  const router = useRouter();
  const pathname = usePathname();
  
  // State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hooks
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, cartTotal } = useCart();
  
  // Navigation items
  const navItems: NavItem[] = [
    {
      label: t('home'),
      href: '/',
    },
    {
      label: t('events'),
      href: '/events',
      children: [
        { label: t('eventsMenu.concerts'), href: '/events?category=concerts' },
        { label: t('eventsMenu.theater'), href: '/events?category=theater' },
        { label: t('eventsMenu.festivals'), href: '/events?category=festivals' },
      ],
    },
    {
      label: t('tours'),
      href: '/tours',
      children: [
        { label: t('toursMenu.city'), href: '/tours?category=city' },
        { label: t('toursMenu.historical'), href: '/tours?category=historical' },
        { label: t('toursMenu.cultural'), href: '/tours?category=cultural' },
      ],
    },
    {
      label: t('transfers'),
      href: '/transfers',
    },
    {
      label: t('about'),
      href: '/about',
    },
    {
      label: t('contact'),
      href: '/contact',
    },
  ];

  // Effects
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Event handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLanguageChange = (locale: string) => {
    const currentPath = pathname;
    const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${locale}`);
    router.push(newPath);
  };

  return (
    <nav className={className}>
      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="ml-2 text-xl font-bold text-neutral-900">
                  Peykan Tourism
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              {navItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.href
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Link>
                  
                  {/* Dropdown Menu */}
                  {item.children && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden lg:flex lg:items-center lg:space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600">
                  <Globe className="h-4 w-4 mr-1" />
                  EN
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('fa')}
                      className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      فارسی
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium text-neutral-700">
                      {user?.first_name || user?.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-50">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          {t('user.profile')}
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          {t('user.orders')}
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          {t('user.wishlist')}
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                          {t('user.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      {t('auth.login')}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">
                      {t('auth.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="ml-2 text-lg font-bold text-neutral-900">
                  Peykan
                </span>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              <Link href="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5 text-neutral-400" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-neutral-400 hover:text-neutral-600"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-neutral-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Search */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </form>

              {/* Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-700 hover:text-primary-600 hover:bg-neutral-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Auth Links */}
              {!isAuthenticated ? (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="ghost" fullWidth>
                      {t('auth.login')}
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button fullWidth>
                      {t('auth.register')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2 border-t border-neutral-200">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-primary-600"
                  >
                    {t('user.profile')}
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-3 py-2 text-base font-medium text-neutral-700 hover:text-primary-600"
                  >
                    {t('user.orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-700 hover:text-primary-600"
                  >
                    {t('user.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 