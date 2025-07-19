'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ChevronDown,
  Grid,
  List,
  X,
  Map,
  Heart,
  Share2,
  Eye
} from 'lucide-react';
import EventCard from '@/components/events/EventCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useEventsStore } from '@/lib/application/stores/eventsStore';
import { EventSearchParams } from '@/lib/types/api';

interface EventFilters {
  search: string;
  category: string;
  venue: string;
  style: string;
  min_price: number;
  max_price: number;
  date_from: string;
  date_to: string;
  sort_by: string;
}

export default function EventsPage() {
  const t = useTranslations('events');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Use events store
  const {
    events,
    filters,
    loadEvents,
    loadEventFilters,
    setEventFilters,
    clearEventFilters,
    clearErrors
  } = useEventsStore();
  
  // Local state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter state
  const [localFilters, setLocalFilters] = useState<EventFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    venue: searchParams.get('venue') || '',
    style: searchParams.get('style') || '',
    min_price: Number(searchParams.get('min_price')) || 0,
    max_price: Number(searchParams.get('max_price')) || 1000,
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    sort_by: searchParams.get('sort_by') || 'date_asc'
  });
  
  // Utility functions
  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, []);
  
  const formatTime = useCallback((time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);
  
  const formatPrice = useCallback((price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };
  
  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    const url = params.toString() ? `?${params.toString()}` : '';
    router.push(url, { scroll: false });
  }, [localFilters, currentPage, router]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof EventFilters, value: string | number) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setLocalFilters({
      search: '',
      category: '',
      venue: '',
      style: '',
      min_price: 0,
      max_price: 1000,
      date_from: '',
      date_to: '',
      sort_by: 'date_asc'
    });
    setCurrentPage(1);
    clearEventFilters();
  }, [clearEventFilters]);
  
  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === 'min_price' && value === 0) return false;
      if (key === 'max_price' && value === 1000) return false;
      if (key === 'sort_by' && value === 'date_asc') return false;
      return value && value !== '';
    }).length;
  }, [localFilters]);
  
  // Load events when filters change
  useEffect(() => {
    const searchParams: EventSearchParams = {
      query: localFilters.search || undefined,
      category: localFilters.category || undefined,
      venue: localFilters.venue || undefined,
      style: localFilters.style || undefined,
      min_price: localFilters.min_price > 0 ? localFilters.min_price : undefined,
      max_price: localFilters.max_price < 1000 ? localFilters.max_price : undefined,
      date_from: localFilters.date_from || undefined,
      date_to: localFilters.date_to || undefined,
      sort_by: localFilters.sort_by || undefined,
    };
    
    setEventFilters(searchParams);
    loadEvents(searchParams, currentPage);
  }, [localFilters, currentPage, setEventFilters, loadEvents]);
  
  // Load filters on mount
  useEffect(() => {
    loadEventFilters();
  }, [loadEventFilters]);
  
  // Update URL when filters change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);
  
  if (events.isLoading && events.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Page Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Events & Shows</h1>
              <p className="text-xl opacity-90">Discover amazing events and performances</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (events.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('error')}</h1>
          <p className="text-gray-600 mb-8">{events.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Events & Shows</h1>
            <p className="text-xl opacity-90">Discover amazing events and performances</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('searchEvents')}
                  value={localFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {t('filters')}
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('category')}
                  </label>
                  <select
                    value={localFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('allCategories')}</option>
                    {filters.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Venue Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('venue')}
                  </label>
                  <select
                    value={localFilters.venue}
                    onChange={(e) => handleFilterChange('venue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('allVenues')}</option>
                    {filters.venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('priceRange')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t('min')}
                      value={localFilters.min_price || ''}
                      onChange={(e) => handleFilterChange('min_price', Number(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder={t('max')}
                      value={localFilters.max_price || ''}
                      onChange={(e) => handleFilterChange('max_price', Number(e.target.value) || 1000)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('sortBy')}
                  </label>
                  <select
                    value={localFilters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date_asc">{t('dateAsc')}</option>
                    <option value="date_desc">{t('dateDesc')}</option>
                    <option value="price_asc">{t('priceAsc')}</option>
                    <option value="price_desc">{t('priceDesc')}</option>
                    <option value="name_asc">{t('nameAsc')}</option>
                    <option value="name_desc">{t('nameDesc')}</option>
                  </select>
                </div>
              </div>
              
              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('clearFilters')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t('showingResults', { count: events.items.length, total: events.pagination.totalCount })}
          </p>
        </div>
        
        {/* Events Grid/List */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
                     {events.items.map((event) => (
             <EventCard
               key={event.id}
               event={event}
               viewMode={viewMode}
               formatDate={formatDate}
               formatTime={formatTime}
               formatPrice={formatPrice}
             />
           ))}
        </div>
        
        {/* Loading More */}
        {events.isLoading && events.items.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              {t('loadingMore')}
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {events.pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={events.pagination.totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
        
        {/* No Results */}
        {!events.isLoading && events.items.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noEventsFound')}</h3>
            <p className="text-gray-600 mb-6">{t('tryAdjustingFilters')}</p>
            <button
              onClick={clearFilters}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: { 
  currentPage: number; 
  totalPages: number; 
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>; 
}) {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Previous
      </button>
      
      {startPage > 1 && (
        <>
          <button
            onClick={() => setCurrentPage(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}
      
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-2 border rounded-lg ${
            page === currentPage
              ? 'bg-blue-500 text-white border-blue-500'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Next
      </button>
    </div>
  );
} 