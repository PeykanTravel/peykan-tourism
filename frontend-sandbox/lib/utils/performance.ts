import React from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  startTimer(name: string): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now()
    });
  }

  endTimer(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Timer "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${metric.duration.toFixed(2)}ms`);
    }

    return metric.duration;
  }

  getMetric(name: string): PerformanceMetric | null {
    return this.metrics.get(name) || null;
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }

  // Measure function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }

  // Measure synchronous function execution time
  measureSync<T>(name: string, fn: () => T): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name);
      return result;
    } catch (error) {
      this.endTimer(name);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render time
export function usePerformanceMeasure(name: string) {
  React.useEffect(() => {
    performanceMonitor.startTimer(name);
    
    return () => {
      performanceMonitor.endTimer(name);
    };
  }, [name]);
}

// Web Vitals monitoring
export function reportWebVitals() {
  if (typeof window !== 'undefined') {
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // LCP (Largest Contentful Paint)
          const lcp = navEntry.loadEventEnd - navEntry.fetchStart;
          
          // FID (First Input Delay) - would need user interaction
          // CLS (Cumulative Layout Shift) - would need layout shift monitoring
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Web Vitals:', {
              LCP: `${lcp.toFixed(2)}ms`,
              TTFB: `${navEntry.responseStart - navEntry.requestStart}ms`,
              DOMContentLoaded: `${navEntry.domContentLoadedEventEnd - navEntry.fetchStart}ms`,
              LoadComplete: `${navEntry.loadEventEnd - navEntry.fetchStart}ms`
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }
}

// Bundle size monitoring
export function getBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      totalSize: navigation.transferSize,
      decodedSize: navigation.decodedBodySize,
      encodedSize: navigation.encodedBodySize
    };
  }
  
  return null;
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }
  
  return null;
} 