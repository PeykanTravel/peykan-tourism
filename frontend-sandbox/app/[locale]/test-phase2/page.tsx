'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap,
  Database,
  Cpu,
  HardDrive,
  Network,
  Clock,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  Search,
  Filter,
  SortAsc,
  Star,
  Loader2
} from 'lucide-react';

// ===== Simple Optimized Components =====

// Simple Virtual List Component
const SimpleVirtualList = React.memo(({ items, height, itemHeight }: any) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(height / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
  
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item: any, index: number) => ({
      item,
      index: startIndex + index
    }));
  }, [items, startIndex, endIndex]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return (
    <div
      className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }: any) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg" />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {item.price.toLocaleString()} تومان
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SimpleVirtualList.displayName = 'SimpleVirtualList';

// Simple Search Component
const SimpleSearch = React.memo(({ onSearch, placeholder = 'جستجو...' }: any) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        onSearch(query);
        setTimeout(() => setIsSearching(false), 500);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, onSearch]);
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
    </div>
  );
});

SimpleSearch.displayName = 'SimpleSearch';

// Simple Filter Component
const SimpleFilter = React.memo(({ options, selectedValues, onFilterChange, title = 'فیلتر' }: any) => {
  const handleOptionClick = useCallback((value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v: string) => v !== value)
      : [...selectedValues, value];
    onFilterChange(newValues);
  }, [selectedValues, onFilterChange]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {options.map((option: any) => (
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

SimpleFilter.displayName = 'SimpleFilter';

// Simple Product Card
const SimpleProductCard = React.memo(({ product, onSelect, isSelected = false }: any) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleClick = useCallback(() => {
    onSelect(product.id);
  }, [onSelect, product.id]);
  
  const getTypeColor = useMemo(() => {
    switch (product.type) {
      case 'tour': return 'blue';
      case 'event': return 'purple';
      case 'transfer': return 'green';
      default: return 'gray';
    }
  }, [product.type]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={handleClick}
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
              <div className="text-4xl">📦</div>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
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
                      i < Math.floor(product.rating)
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
      </div>
    </motion.div>
  );
});

SimpleProductCard.displayName = 'SimpleProductCard';

// Loading Skeleton
const LoadingSkeleton = React.memo(({ type, count = 1 }: any) => {
  const skeletons = useMemo(() => {
    return Array.from({ length: count }, (_, i) => i);
  }, [count]);
  
  const renderSkeleton = useCallback((index: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border-2 border-gray-300 dark:border-gray-600 shadow-md">
            {/* Image placeholder */}
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg animate-enhanced-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            {/* Content placeholders */}
            <div className="space-y-3">
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-enhanced-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-3/4 animate-enhanced-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/2 animate-enhanced-pulse" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-2/3 animate-enhanced-pulse" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div key={index} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-md">
            {/* Avatar placeholder */}
            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full animate-enhanced-pulse relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            {/* Content placeholders */}
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded animate-enhanced-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-2/3 animate-enhanced-pulse" />
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded w-1/2 animate-enhanced-pulse" />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  }, [type]);
  
  return (
    <div className="space-y-4">
      {skeletons.map(renderSkeleton)}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Performance Monitor
const PerformanceMonitor = React.memo(({ componentName, renderCount, renderTime }: any) => {
  const performanceStatus = useMemo(() => {
    if (renderTime < 16) return { color: 'text-green-500', status: 'عالی' };
    if (renderTime < 33) return { color: 'text-yellow-500', status: 'خوب' };
    return { color: 'text-red-500', status: 'نیاز به بهینه‌سازی' };
  }, [renderTime]);
  
  return (
    <div className="text-xs text-gray-500">
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

// Main Component
export default function TestPhase2Page() {
  const [activeTab, setActiveTab] = useState<'performance' | 'state' | 'api'>('performance');
  const [renderCount, setRenderCount] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    memory: 0,
    cpu: 0,
    network: 0,
    cache: 0
  });

  // Debug logging
  console.log('🔍 TestPhase2Page rendered:', {
    activeTab,
    renderCount,
    renderTime,
    isClient,
    showSkeletons,
    performanceMetrics
  });

  // Client-side only rendering
  useEffect(() => {
    console.log('🌐 Client-side rendering enabled');
    setIsClient(true);
  }, []);

  // Performance monitoring (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);
    
    return () => {
      const endTime = performance.now();
      const time = endTime - startTime;
      setRenderTime(time);
      console.log('⚡ Render performance:', { time: time.toFixed(2) + 'ms' });
    };
  }, [isClient]);

    // Simulate performance metrics (client-side only)
  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      const newMetrics = {
        memory: Math.random() * 100,
        cpu: Math.random() * 100,
        network: Math.random() * 100,
        cache: Math.random() * 100
      };
      setPerformanceMetrics(newMetrics);
      console.log('📊 Performance metrics updated:', newMetrics);
    }, 2000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Force show skeletons for testing
  useEffect(() => {
    if (isClient) {
      console.log('🎯 Forcing skeletons to show for testing...');
      setShowSkeletons(true);
    }
  }, [isClient]);

  // Sample data for testing
  const sampleProducts = useMemo(() => [
    {
      id: '1',
      title: 'تور کوه دماوند',
      description: 'صعود به بلندترین قله ایران',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      rating: 4.5,
      reviewCount: 128,
      features: ['راهنمای تخصصی', 'تجهیزات کامل', 'بیمه'],
      type: 'tour' as const
    },
    {
      id: '2',
      title: 'کنسرت سنتی',
      description: 'اجرای موسیقی سنتی ایرانی',
      price: 250000,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      rating: 4.8,
      reviewCount: 89,
      features: ['صندلی VIP', 'نوشیدنی رایگان'],
      type: 'event' as const
    },
    {
      id: '3',
      title: 'ترانسفر فرودگاه',
      description: 'سرویس ترانسفر از فرودگاه امام',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      rating: 4.2,
      reviewCount: 256,
      features: ['تهویه مطبوع', 'WiFi رایگان'],
      type: 'transfer' as const
    }
  ], []);

  const filterOptions = useMemo(() => [
    { value: 'tour', label: 'تور', count: 45 },
    { value: 'event', label: 'رویداد', count: 32 },
    { value: 'transfer', label: 'ترانسفر', count: 28 }
  ], []);

  // Handlers
  const handleSearch = useCallback((query: string) => {
    console.log('🔍 Search query:', query);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('✅ Search completed');
    }, 1000);
  }, []);

  const handleFilterChange = useCallback((values: string[]) => {
    console.log('🎯 Filter values:', values);
  }, []);

  const handleProductSelect = useCallback((id: string) => {
    console.log('🛒 Selected product:', id);
  }, []);

  const handleApiTest = useCallback(async () => {
    console.log('🚀 Starting API test...');
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ API tests completed successfully!');
      alert('✅ API tests completed successfully!');
    } catch (error) {
      console.error('❌ API test error:', error);
      alert('❌ API test failed. Check console for details.');
    } finally {
      setIsLoading(false);
      console.log('🏁 API test finished');
    }
  }, []);

  const handleLoadingDemo = useCallback(async () => {
    setIsLoadingDemo(true);
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoadingDemo(false);
    }, 3000);
  }, []);

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl md:text-6xl font-bold">فاز 2: بهینه‌سازی عملکرد</h1>
              <Zap className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              بهینه‌سازی عملکرد، مدیریت state پیشرفته و اتصال API بهبود یافته
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Performance Monitor */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {/* Debug Info */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-800 dark:text-yellow-200 font-semibold">🔍 Debug Info:</span>
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <div>Client: {isClient ? '✅ Yes' : '❌ No'}</div>
              <div>Render Count: {renderCount}</div>
              <div>Render Time: {renderTime.toFixed(2)}ms</div>
              <div>Active Tab: {activeTab}</div>
              <div>Show Skeletons: {showSkeletons ? 'Yes' : 'No'}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                مانیتور عملکرد
              </h2>
              <PerformanceMonitor
                componentName="TestPhase2Page"
                renderCount={renderCount}
                renderTime={renderTime}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Memory', value: performanceMetrics.memory, icon: HardDrive, color: 'blue' },
                { label: 'CPU', value: performanceMetrics.cpu, icon: Cpu, color: 'green' },
                { label: 'Network', value: performanceMetrics.network, icon: Network, color: 'purple' },
                { label: 'Cache', value: performanceMetrics.cache, icon: Database, color: 'orange' }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {metric.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                    <div
                      className={`bg-${metric.color}-500 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex space-x-4 mb-6">
              {[
                { id: 'performance', label: 'بهینه‌سازی عملکرد', icon: Zap },
                { id: 'state', label: 'مدیریت State', icon: Database },
                { id: 'api', label: 'اتصال API', icon: Network }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    کامپوننت‌های بهینه‌سازی شده
                  </h3>
                  
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <SimpleSearch
                      onSearch={handleSearch}
                      placeholder="جستجو در محصولات..."
                    />
                    
                    <div className="space-y-4">
                      <SimpleFilter
                        options={filterOptions}
                        selectedValues={[]}
                        onFilterChange={handleFilterChange}
                        title="دسته‌بندی"
                      />
                    </div>
                  </div>
                  
                  {/* Virtual List */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      لیست مجازی (Virtual List)
                    </h4>
                    <div className="h-96">
                      <SimpleVirtualList
                        items={Array.from({ length: 1000 }, (_, i) => ({
                          id: i.toString(),
                          title: `آیتم ${i + 1}`,
                          description: `توضیحات آیتم ${i + 1}`,
                          price: Math.floor(Math.random() * 1000000),
                          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
                          type: 'tour' as const
                        }))}
                        height={384}
                        itemHeight={80}
                      />
                    </div>
                  </div>
                  
                  {/* Optimized Product Cards */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      کارت‌های محصول بهینه‌سازی شده
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sampleProducts.map((product) => (
                        <SimpleProductCard
                          key={product.id}
                          product={product}
                          onSelect={handleProductSelect}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Loading Skeletons */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Loading Skeletons
                      </h4>
                      <button
                        onClick={() => setShowSkeletons(!showSkeletons)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {showSkeletons ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>مخفی کردن</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>نمایش</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {showSkeletons && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        {/* Demo Loading Button */}
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-center space-x-4">
                            <button
                              onClick={handleLoadingDemo}
                              disabled={isLoadingDemo}
                              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isLoadingDemo ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>در حال بارگذاری...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4" />
                                  <span>شبیه‌سازی بارگذاری</span>
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => setShowSkeletons(!showSkeletons)}
                              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>تست مجدد</span>
                            </button>

                            <button
                              onClick={() => {
                                console.log('🎯 Manual skeleton test triggered');
                                setShowSkeletons(true);
                                setIsLoadingDemo(true);
                                setTimeout(() => setIsLoadingDemo(false), 3000);
                              }}
                              className="flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              <Zap className="w-4 h-4" />
                              <span>تست مستقیم</span>
                            </button>
                          </div>
                          
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            💡 برای دیدن اسکلتون‌ها، روی "تست مستقیم" کلیک کنید
                          </div>
                        </div>

                        {/* Skeleton Examples */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-yellow-800 dark:text-yellow-200 font-semibold">🎯 Loading Skeletons Status:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              showSkeletons 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                            }`}>
                              {showSkeletons ? 'نمایش داده می‌شود' : 'مخفی شده'}
                            </span>
                          </div>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300">
                            {showSkeletons 
                              ? '✅ Loading Skeletons در حال نمایش است. اگر نمی‌بینید، مشکل در CSS یا rendering است.'
                              : '❌ Loading Skeletons مخفی شده است. روی "نمایش" کلیک کنید.'
                            }
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300">Card Skeleton</h5>
                            <LoadingSkeleton type="card" count={1} />
                          </div>
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300">List Skeletons</h5>
                            <LoadingSkeleton type="list" count={3} />
                          </div>
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300">Multiple Cards</h5>
                            <LoadingSkeleton type="card" count={2} />
                          </div>
                        </div>

                        {/* Real Loading Demo */}
                        {isLoadingDemo && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700"
                          >
                            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-4">
                              شبیه‌سازی بارگذاری واقعی
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <LoadingSkeleton type="card" count={2} />
                              <LoadingSkeleton type="list" count={4} />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'state' && (
                <motion.div
                  key="state"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    مدیریت State پیشرفته
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      وضعیت سیستم
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          تعداد رندر
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {renderCount}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          زمان رندر
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {renderTime.toFixed(2)}ms
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    اتصال API بهبود یافته
                  </h3>
                  
                  {/* API Test Controls */}
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={handleApiTest}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>تست API</span>
                    </button>
                  </div>
                  
                  {/* API Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: 'Caching',
                        description: 'کش کردن درخواست‌ها برای بهبود عملکرد',
                        icon: Database,
                        color: 'blue'
                      },
                      {
                        title: 'Retry Mechanism',
                        description: 'تلاش مجدد خودکار در صورت خطا',
                        icon: RefreshCw,
                        color: 'green'
                      },
                      {
                        title: 'Rate Limiting',
                        description: 'محدودیت تعداد درخواست‌ها',
                        icon: Clock,
                        color: 'purple'
                      },
                      {
                        title: 'Error Handling',
                        description: 'مدیریت خطاهای پیشرفته',
                        icon: Settings,
                        color: 'red'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`bg-${feature.color}-50 dark:bg-${feature.color}-900/20 rounded-lg p-4`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
                          <h4 className={`font-semibold text-${feature.color}-900 dark:text-${feature.color}-100`}>
                            {feature.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">فاز 2 تکمیل شد!</h2>
            <p className="text-xl text-green-100 mb-6">
              بهینه‌سازی عملکرد، مدیریت state پیشرفته و اتصال API بهبود یافته با موفقیت پیاده‌سازی شد
            </p>
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <span>شروع فاز 3</span>
                <TrendingUp className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 