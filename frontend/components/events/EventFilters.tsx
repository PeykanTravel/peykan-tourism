'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Filter, MapPin, Calendar, Clock, Users, Star, DollarSign, X } from 'lucide-react';

interface EventFiltersProps {
  filters: {
    search: string;
    category: string;
    venue: string;
    style: string;
    min_price: number;
    max_price: number;
    date_from: string;
    date_to: string;
    sort_by: string;
    city: string;
    rating: number;
    capacity: string;
  };
  filterOptions: {
    categories: Array<{ id: string; name: string }>;
    venues: Array<{ id: string; name: string; city: string }>;
    styles: Array<{ value: string; label: string }>;
    cities: Array<{ value: string; label: string }>;
  };
  onFilterChange: (key: string, value: string | number) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export default function EventFilters({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  activeFiltersCount
}: EventFiltersProps) {
  const t = useTranslations('events');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePriceChange = useCallback((type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    onFilterChange(type === 'min' ? 'min_price' : 'max_price', numValue);
  }, [onFilterChange]);

  const handleDateChange = useCallback((type: 'from' | 'to', value: string) => {
    onFilterChange(type === 'from' ? 'date_from' : 'date_to', value);
  }, [onFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('category')}
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">{t('allCategories')}</option>
            {filterOptions.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            {t('city')}
          </label>
          <select
            value={filters.city}
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">{t('allCities')}</option>
            {filterOptions.cities.map((city) => (
              <option key={city.value} value={city.value}>
                {city.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            {t('dateFrom')}
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleDateChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('sortBy')}
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange('sort_by', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="date_asc">{t('dateAscending')}</option>
            <option value="date_desc">{t('dateDescending')}</option>
            <option value="price_asc">{t('priceAscending')}</option>
            <option value="price_desc">{t('priceDescending')}</option>
            <option value="rating_desc">{t('ratingDescending')}</option>
            <option value="popular">{t('popularity')}</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Filter className="h-4 w-4 mr-1" />
          {showAdvanced ? t('hideAdvancedFilters') : t('showAdvancedFilters')}
        </button>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {activeFiltersCount} {t('activeFilters')}
            </span>
            <button
              onClick={onClearFilters}
              className="flex items-center text-sm text-red-600 hover:text-red-800 font-medium"
            >
              <X className="h-4 w-4 mr-1" />
              {t('clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Venue Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('venue')}
              </label>
              <select
                value={filters.venue}
                onChange={(e) => onFilterChange('venue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{t('allVenues')}</option>
                {filterOptions.venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} - {venue.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('eventStyle')}
              </label>
              <select
                value={filters.style}
                onChange={(e) => onFilterChange('style', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{t('allStyles')}</option>
                {filterOptions.styles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                {t('minimumRating')}
              </label>
              <select
                value={filters.rating}
                onChange={(e) => onFilterChange('rating', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={0}>{t('anyRating')}</option>
                <option value={4}>4+ {t('stars')}</option>
                <option value={3}>3+ {t('stars')}</option>
                <option value={2}>2+ {t('stars')}</option>
                <option value={1}>1+ {t('stars')}</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                {t('priceRange')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder={t('minPrice')}
                  value={filters.min_price || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder={t('maxPrice')}
                  value={filters.max_price || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {t('dateTo')}
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                {t('capacity')}
              </label>
              <select
                value={filters.capacity}
                onChange={(e) => onFilterChange('capacity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{t('anyCapacity')}</option>
                <option value="small">{t('small')} (&lt; 500)</option>
                <option value="medium">{t('medium')} (500-2000)</option>
                <option value="large">{t('large')} (2000+)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 