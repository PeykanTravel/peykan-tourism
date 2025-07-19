// Simple performance monitoring utilities

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  errors: string[];
}

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Simple performance monitor
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor page load
    window.addEventListener('load', () => {
      this.measurePageLoad();
    });

    // Monitor API calls
    this.setupApiMonitoring();
  }

  private measurePageLoad(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      this.recordMetric({
        pageLoadTime: loadTime,
        apiResponseTime: 0,
        errors: []
      });

      if (loadTime > 1000) {
        console.warn(`Slow page load: ${loadTime}ms`);
      }
    }
  }

  private setupApiMonitoring(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.recordMetric({
          pageLoadTime: 0,
          apiResponseTime: responseTime,
          errors: []
        });

        if (responseTime > 1000) {
          console.warn(`Slow API response: ${responseTime}ms`, args[0]);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        this.recordMetric({
          pageLoadTime: 0,
          apiResponseTime: responseTime,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });

        throw error;
      }
    };
  }

  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public clearMetrics(): void {
    this.metrics = [];
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 