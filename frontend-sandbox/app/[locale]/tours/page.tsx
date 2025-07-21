'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Clock, 
  Star, 
  Heart,
  ChevronDown,
  X
} from 'lucide-react';
import TourCard from '../../../components/tours/TourCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { PriceDisplay } from '../../../components/ui/Price';
import { useCurrency } from '../../../lib/stores/currencyStore';

// Mock categories for demonstration
const categories = [
  { id: 'adventure', name: 'Adventure', count: 12 },
  { id: 'cultural', name: 'Cultural', count: 8 },
  { id: 'nature', name: 'Nature', count: 15 },
  { id: 'city', name: 'City Tours', count: 10 },
  { id: 'seasonal', name: 'Seasonal', count: 6 }
];

interface Tour {
  id: string;
  slug: string;
  title?: string;
  description?: string;
  price: string;
  currency: string;
  duration_hours: number;
  is_active: boolean;
  created_at: string;
  image_url?: string;
  location?: string;
  rating?: number;
  category?: string;
}

export default function ToursListPage() {
  const t = useTranslations('tours');
  const { initialize: initializeCurrency } = useCurrency();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState('name');
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);

  // Initialize currency
  useEffect(() => {
    initializeCurrency();
  }, [initializeCurrency]);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/api/v1/tours/tours/');
        if (response.ok) {
          const data = await response.json();
          // Enhance tour data with mock information for better display
          const enhancedTours = (Array.isArray(data) ? data : []).map((tour: Tour) => ({
            ...tour,
            title: tour.title || `Tour: ${tour.slug}`,
            description: tour.description || 'Experience the beauty and culture of this amazing destination with our carefully crafted tour package.',
            image_url: tour.image_url || `https://picsum.photos/400/300?random=${tour.id}`,
            location: tour.location || 'Tehran, Iran',
            rating: tour.rating || Math.floor(Math.random() * 2) + 4, // Random rating 4-5
            category: tour.category || categories[Math.floor(Math.random() * categories.length)].id
          }));
          setTours(enhancedTours);
        } else {
          setError('Failed to load tours');
        }
      } catch (error) {
        setError('Failed to load tours');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Filter and sort tours
  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tour.category === selectedCategory;
    const matchesPrice = parseFloat(tour.price) >= priceRange.min && parseFloat(tour.price) <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedTours = [...filteredTours].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price_high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'duration':
        return a.duration_hours - b.duration_hours;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return (a.title || '').localeCompare(b.title || '');
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalPages = Math.ceil(sortedTours.length / itemsPerPage);
  const paginatedTours = sortedTours.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Pagination component
  const Pagination = () => (
    <div className="flex justify-center mt-12">
      <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-l-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          قبلی
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 border-t border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ${currentPage === i + 1 ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          بعدی
        </button>
      </nav>
    </div>
  );

    if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 text-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Tour Packages</h1>
              <p className="text-lg md:text-xl opacity-90">Discover amazing destinations with our curated tours</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonLoader variant="card" count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tour Packages</h1>
            <p className="text-xl opacity-90">Discover amazing destinations with our curated tours</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Tour Packages</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Found {sortedTours.length} tours</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => setShowCategoryFilters((prev) => !prev)}
                className={`flex items-center gap-2 px-7 py-3 rounded-xl text-lg font-semibold transition-colors shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto`}
              >
                <Filter className="w-6 h-6" />
                <span>Show Filter</span>
                <ChevronDown className={`w-6 h-6 transition-transform ${showCategoryFilters ? 'rotate-180' : ''}`} />
              </button>
              {/* Category Filters (collapsible, modern pill style) */}
              {showCategoryFilters && (
                <div className="flex flex-wrap gap-3 mt-4 animate-fade-in w-full">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold shadow-md border-2 border-blue-400 bg-gradient-to-r from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 text-blue-800 dark:text-blue-100 hover:scale-105 transition-transform w-full sm:w-auto`}
                  >
                    <Filter className="w-5 h-5" /> All ({tours.length})
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full text-base font-semibold shadow-md border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-white to-blue-100 dark:from-gray-900 dark:to-blue-900 text-gray-700 dark:text-blue-100 hover:scale-105 transition-transform w-full sm:w-auto ${selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <span className="font-bold">{category.name}</span> <span className="opacity-70">({category.count})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Sort & View controls (always fixed position, no resize) */}
            <div className="flex items-center gap-4 flex-shrink-0 min-h-[56px] w-full sm:w-auto mt-4 sm:mt-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-7 py-3 rounded-xl text-lg font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-md w-full sm:w-auto"
                style={{ minWidth: 200 }}
              >
                <option value="name">Sort by Name</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="duration">Duration</option>
                <option value="rating">Rating</option>
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
        <div className="mt-16">
          {sortedTours.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tours found</h3>
              <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
            }>
              {paginatedTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={{
                    ...tour,
                    title: tour.title || 'بدون عنوان',
                    image_url: tour.image_url || '/images/tour-placeholder.jpg',
                  }}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
          {sortedTours.length > 0 && (
            <div className="flex flex-col items-center mt-12">
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`rounded-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Previous page"
                >
                  <span className="sr-only">قبلی</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-5xl font-black text-blue-600 dark:text-blue-400 select-none tracking-wider drop-shadow-sm px-8">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`rounded-full p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Next page"
                >
                  <span className="sr-only">بعدی</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 