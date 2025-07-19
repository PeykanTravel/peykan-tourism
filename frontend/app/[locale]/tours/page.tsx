'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useProducts } from '../../../lib/application/hooks/useProducts';
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
  X,
  Loader2
} from 'lucide-react';
import TourCard from '../../../components/feature/products/TourCard';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

export default function ToursListPage() {
  const t = useTranslations('tours');
  
  // New application layer hook
  const { 
    products: tours, 
    isLoading, 
    error, 
    getTours,
    total,
    page,
    hasMore
  } = useProducts();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [sortBy, setSortBy] = useState('name');
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock categories for demonstration
  const categories = [
    { id: 'adventure', name: 'Adventure', count: 12 },
    { id: 'cultural', name: 'Cultural', count: 8 },
    { id: 'nature', name: 'Nature', count: 15 },
    { id: 'city', name: 'City Tours', count: 10 },
    { id: 'seasonal', name: 'Seasonal', count: 6 }
  ];

  // Load tours on component mount
  useEffect(() => {
    getTours({
      page: currentPage,
      limit: 9,
      search: searchQuery,
      category: selectedCategory,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  }, [currentPage, searchQuery, selectedCategory, priceRange.min, priceRange.max]);

  // Filter and sort tours
  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.getTitle()?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.getDescription()?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.getLocation()?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tour.getType() === selectedCategory;
    const matchesPrice = tour.getPrice().getAmount() >= priceRange.min && tour.getPrice().getAmount() <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedTours = [...filteredTours].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.getPrice().getAmount() - b.getPrice().getAmount();
      case 'price_high':
        return b.getPrice().getAmount() - a.getPrice().getAmount();
      case 'duration':
        return (a.getMetadata()?.duration || 0) - (b.getMetadata()?.duration || 0);
      case 'rating':
        return (b.getMetadata()?.rating || 0) - (a.getMetadata()?.rating || 0);
      default:
        return (a.getTitle() || '').localeCompare(b.getTitle() || '');
    }
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  const handleAddToCart = (tour: any) => {
    // TODO: Implement add to cart functionality
    console.log('Adding tour to cart:', tour);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

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
        {[...Array(Math.ceil(total / 9))].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 border-t border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors ${currentPage === i + 1 ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900' : ''}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={!hasMore}
          className={`px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors ${!hasMore ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Tour Packages</h1>
            <p className="text-lg md:text-xl opacity-90">Discover amazing destinations with our curated tours</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="name">Name</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="duration">Duration</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tours Grid */}
        {sortedTours.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tours found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {sortedTours.map((tour) => (
              <TourCard
                key={tour.getId()}
                tour={tour}
                viewMode={viewMode}
                onAddToCart={handleAddToCart}
                className="w-full"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 9 && <Pagination />}
      </div>
    </div>
  );
} 