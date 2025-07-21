'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEvents, getEventFilters } from '@/lib/api/events';
import { Event, EventCategory, Venue, EventListResponse } from '@/lib/types/api';
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
  
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set default viewMode to 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<EventFilters>({
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
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<{
    categories: EventCategory[];
    venues: Venue[];
    styles: Array<{ value: string; label: string }>;
  }>({
    categories: [],
    venues: [],
    styles: []
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
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
  
  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const options = await getEventFilters();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);
  
  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: filters.search || undefined,
        category: filters.category || undefined,
        venue: filters.venue || undefined,
        style: filters.style || undefined,
        min_price: filters.min_price > 0 ? filters.min_price : undefined,
        max_price: filters.max_price < 1000 ? filters.max_price : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        ordering: filters.sort_by || undefined,
        page: currentPage,
        page_size: 12
      };
      
      const response: EventListResponse = await getEvents(params);
      
      // Enhance event data with mock information for better display
      const enhancedEvents = response.results.map((event: Event) => ({
        ...event,
        image: event.image || `https://picsum.photos/400/300?random=${event.id}`,
        average_rating: event.average_rating || Math.floor(Math.random() * 2) + 4, // Random rating 4-5
        review_count: event.review_count || Math.floor(Math.random() * 100) + 10
      }));
      
      setEvents(enhancedEvents);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / 12));
    } catch (err) {
      setError(t('errorLoading'));
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, t]);
  
  // Update URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0) {
        params.set(key, value.toString());
      }
    });
    
    if (currentPage > 1) {
      params.set('page', currentPage.toString());
    }
    
    const url = params.toString() ? `?${params.toString()}` : '';
    router.push(url, { scroll: false });
  }, [filters, currentPage, router]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof EventFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  }, []);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
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
  }, []);
  
  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'min_price' && value === 0) return false;
      if (key === 'max_price' && value === 1000) return false;
      if (key === 'sort_by' && value === 'date_asc') return false;
      return value && value !== '';
    }).length;
  }, [filters]);
  
  // Initialize
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);
  
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);
  
  if (loading && events.length === 0) {
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
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('error')}</h1>
          <p className="text-gray-600 mb-8">{error}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Events & Shows</h1>
            <p className="text-xl opacity-90">Discover amazing events and performances</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Events</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Found {totalCount} events</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="w-full">
          {/* Toolbar Row */}
          <div className="flex w-full items-center justify-between gap-6 flex-wrap">
            {/* Show Filter (always fixed position) */}
            <div className="flex flex-col items-start w-full sm:w-auto">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl text-lg font-semibold transition-colors shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto`}
              >
                <Filter className="w-6 h-6" />
                <span>Show Filter</span>
                <ChevronDown className={`w-6 h-6 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {/* Category Filters (collapsible, modern pill style) */}
              {showFilters && (
                <div className="flex flex-wrap gap-3 mt-4 animate-fade-in w-full">
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold shadow-md border-2 border-blue-400 bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 text-blue-800 dark:text-blue-100 hover:scale-105 transition-transform w-full sm:w-auto ${filters.category === '' ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <Filter className="w-5 h-5" /> All ({totalCount})
                  </button>
                  {filterOptions.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange('category', category.id)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold shadow-md border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-white to-blue-100 dark:from-gray-900 dark:to-blue-900 text-gray-700 dark:text-blue-100 hover:scale-105 transition-transform w-full sm:w-auto ${filters.category === category.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <span className="font-bold">{category.name}</span> <span className="opacity-70"> </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Sort & View controls (always fixed position, no resize) */}
            <div className="flex items-center gap-4 flex-shrink-0 min-h-[56px] w-full sm:w-auto mt-4 sm:mt-0">
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="px-7 py-3 rounded-xl text-lg font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-md w-full sm:w-auto"
                style={{ minWidth: 200 }}
              >
                <option value="date_asc">Date: Earliest First</option>
                <option value="date_desc">Date: Latest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
              <div className="flex bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-7 py-3 text-lg font-semibold transition-colors w-1/2 sm:w-auto ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <Grid className="w-6 h-6 inline-block mr-2" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-7 py-3 text-lg font-semibold transition-colors w-1/2 sm:w-auto ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <List className="w-6 h-6 inline-block mr-2" /> List
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Cards Section with more spacing */}
        <div className={viewMode === 'grid' 
          ? 'mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'mt-16 space-y-6'
        }>
          {events.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No events found</h3>
              <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                viewMode={viewMode}
                formatDate={formatDate}
                formatTime={formatTime}
                formatPrice={formatPrice}
              />
            ))
          )}
        </div>
        {/* Pagination always at the bottom, centered */}
        {events.length > 0 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        )}
      </div>
    </div>
  );
}

// Add Pagination component
function Pagination({ currentPage, totalPages, setCurrentPage }: { currentPage: number; totalPages: number; setCurrentPage: React.Dispatch<React.SetStateAction<number>> }) {
  return (
    <div className="flex flex-col items-center mt-12">
      <div className="flex items-center gap-x-2">
        <button
          onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="rounded-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <span className="sr-only">قبلی</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-5xl font-black text-blue-600 dark:text-blue-400 select-none tracking-wider drop-shadow-sm px-8">{currentPage}</span>
        <button
          onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="rounded-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <span className="sr-only">بعدی</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
} 