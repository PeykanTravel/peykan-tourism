'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdvancedCard } from './AdvancedCard';
import { AdvancedInput, AdvancedSelect, AdvancedNumberInput } from './AdvancedForm';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Star, 
  Heart,
  Eye,
  Clock,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Zap,
  Loader2
} from 'lucide-react';

// ===== کامپوننت‌های بهینه‌سازی شده =====

// Virtual Scrolling برای لیست‌های بزرگ
interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualList = React.memo(<T extends any>({
  items,
  height,
  itemHeight,
  renderItem,
  className = ''
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

// Optimized Search Component
interface OptimizedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const OptimizedSearch = React.memo(({
  onSearch,
  placeholder = 'جستجو...',
  className = '',
  debounceMs = 300
}: OptimizedSearchProps) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        onSearch(query);
        // Simulate search delay
        setTimeout(() => setIsSearching(false), 500);
      }
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);
  
  const handleChange = useCallback((value: string) => {
    setQuery(value);
  }, []);
  
  return (
    <div className={`relative ${className}`}>
      <AdvancedInput
        label="جستجو"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        icon={<Search className="w-4 h-4" />}
      />
      {isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-12 top-1/2 transform -translate-y-1/2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        </motion.div>
      )}
    </div>
  );
});

OptimizedSearch.displayName = 'OptimizedSearch';

// Optimized Filter Component
interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface OptimizedFilterProps {
  options: FilterOption[];
  selectedValues: string[];
  onFilterChange: (values: string[]) => void;
  title?: string;
  multiSelect?: boolean;
  className?: string;
}

export const OptimizedFilter = React.memo(({
  options,
  selectedValues,
  onFilterChange,
  title = 'فیلتر',
  multiSelect = true,
  className = ''
}: OptimizedFilterProps) => {
  const handleOptionClick = useCallback((value: string) => {
    if (multiSelect) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onFilterChange(newValues);
    } else {
      onFilterChange([value]);
    }
  }, [selectedValues, onFilterChange, multiSelect]);
  
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [options]);
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {sortedOptions.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedValues.includes(option.value)
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
              {option.count !== undefined && (
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {option.count}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

OptimizedFilter.displayName = 'OptimizedFilter';

// Optimized Sort Component
interface SortOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface OptimizedSortProps {
  options: SortOption[];
  selectedValue: string;
  onSortChange: (value: string) => void;
  className?: string;
}

export const OptimizedSort = React.memo(({
  options,
  selectedValue,
  onSortChange,
  className = ''
}: OptimizedSortProps) => {
  const handleSortChange = useCallback((value: string) => {
    onSortChange(value);
  }, [onSortChange]);
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <SortAsc className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">مرتب‌سازی</h3>
      </div>
      
      <div className="space-y-2">
        {options.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedValue === option.value
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => handleSortChange(option.value)}
            >
              {option.icon && <span className="text-gray-500">{option.icon}</span>}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

OptimizedSort.displayName = 'OptimizedSort';

// Optimized Product Card with Lazy Loading
interface OptimizedProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    rating?: number;
    reviewCount?: number;
    features?: string[];
    type: 'tour' | 'event' | 'transfer';
  };
  onSelect: (id: string) => void;
  isSelected?: boolean;
  className?: string;
}

export const OptimizedProductCard = React.memo(({
  product,
  onSelect,
  isSelected = false,
  className = ''
}: OptimizedProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleClick = useCallback(() => {
    onSelect(product.id);
  }, [onSelect, product.id]);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);
  
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  const getTypeColor = useMemo(() => {
    switch (product.type) {
      case 'tour': return 'blue';
      case 'event': return 'purple';
      case 'transfer': return 'green';
      default: return 'gray';
    }
  }, [product.type]);
  
  const getTypeIcon = useMemo(() => {
    switch (product.type) {
      case 'tour': return '🗺️';
      case 'event': return '🎭';
      case 'transfer': return '🚗';
      default: return '📦';
    }
  }, [product.type]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <AdvancedCard
        variant="3d"
        hoverEffect="lift"
        interactive
        onClick={handleClick}
        className={`relative overflow-hidden ${className} ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        {/* Image Container */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
          
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600">
              <div className="text-4xl">{getTypeIcon}</div>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
          
          {/* Type Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 bg-${getTypeColor}-500 text-white text-xs rounded-full`}>
            {product.type}
          </div>
          
          {/* Price */}
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg">
            <span className="font-bold">{product.price.toLocaleString()}</span>
            <span className="text-sm"> تومان</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">
            {product.title}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                ({product.reviewCount} نظر)
              </span>
            </div>
          )}
          
          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 left-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <div className="w-3 h-3 bg-white rounded-full" />
          </motion.div>
        )}
      </AdvancedCard>
    </motion.div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

// Optimized Loading Skeleton
interface LoadingSkeletonProps {
  type: 'card' | 'list' | 'form';
  count?: number;
  className?: string;
}

export const LoadingSkeleton = React.memo(({
  type,
  count = 1,
  className = ''
}: LoadingSkeletonProps) => {
  const skeletons = useMemo(() => {
    return Array.from({ length: count }, (_, i) => i);
  }, [count]);
  
  const renderSkeleton = useCallback((index: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div key={index} className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        );
      
      default:
        return null;
    }
  }, [type]);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {skeletons.map(renderSkeleton)}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Performance Monitor Component
interface PerformanceMonitorProps {
  componentName: string;
  renderCount: number;
  renderTime: number;
  className?: string;
}

export const PerformanceMonitor = React.memo(({
  componentName,
  renderCount,
  renderTime,
  className = ''
}: PerformanceMonitorProps) => {
  const performanceStatus = useMemo(() => {
    if (renderTime < 16) return { color: 'text-green-500', status: 'عالی' };
    if (renderTime < 33) return { color: 'text-yellow-500', status: 'خوب' };
    return { color: 'text-red-500', status: 'نیاز به بهینه‌سازی' };
  }, [renderTime]);
  
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <span className="font-mono">{componentName}</span>
      <span className="mx-2">•</span>
      <span>رندر: {renderCount}</span>
      <span className="mx-2">•</span>
      <span className={performanceStatus.color}>
        {renderTime}ms ({performanceStatus.status})
      </span>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor'; 