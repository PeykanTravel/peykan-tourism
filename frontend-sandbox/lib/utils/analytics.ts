/**
 * Analytics and Performance Monitoring for Peykan Tourism Platform
 */

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  properties?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'navigation' | 'api' | 'render' | 'interaction';
}

class Analytics {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    // Track page views
    if (typeof window !== 'undefined') {
      this.trackPageView();
      
      // Track performance metrics
      this.trackPerformanceMetrics();
      
      // Track user interactions
      this.trackUserInteractions();
    }
  }

  private trackPageView(): void {
    const path = window.location.pathname;
    this.track('page_view', 'navigation', 'view', path);
  }

  private trackPerformanceMetrics(): void {
    if ('performance' in window) {
      // Track Core Web Vitals
      this.trackLCP();
      this.trackFID();
      this.trackCLS();
      
      // Track navigation timing
      this.trackNavigationTiming();
    }
  }

  private trackLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.addMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'navigation'
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private trackFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const firstInputEntry = entry as PerformanceEventTiming;
          this.addMetric({
            name: 'FID',
            value: firstInputEntry.processingStart - firstInputEntry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'interaction'
          });
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private trackCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.addMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'score',
          timestamp: Date.now(),
          category: 'navigation'
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private trackNavigationTiming(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.addMetric({
          name: 'DOMContentLoaded',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'navigation'
        });
        
        this.addMetric({
          name: 'LoadComplete',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'navigation'
        });
      }
    }
  }

  private trackUserInteractions(): void {
    if (typeof window !== 'undefined') {
      // Track clicks
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const className = target.className;
        const id = target.id;
        
        this.track('click', 'interaction', 'click', `${tagName}.${className}#${id}`);
      });

      // Track form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target as HTMLFormElement;
        this.track('form_submit', 'interaction', 'submit', form.action);
      });

      // Track scroll depth
      let maxScrollDepth = 0;
      window.addEventListener('scroll', () => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth;
          if (maxScrollDepth % 25 === 0) { // Track every 25%
            this.track('scroll_depth', 'engagement', 'scroll', `${maxScrollDepth}%`);
          }
        }
      });
    }
  }

  track(
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.getUserId(),
      properties
    };

    this.events.push(analyticsEvent);
    
    // Send to analytics service (if configured)
    this.sendToAnalytics(analyticsEvent);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }
  }

  addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Performance Metric:', metric);
    }
  }

  trackAPIRequest(endpoint: string, method: string, duration: number, status: number): void {
    this.track('api_request', 'api', method, endpoint, duration, {
      status,
      endpoint,
      method
    });
    
    this.addMetric({
      name: 'API_Response_Time',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'api'
    });
  }

  trackUserJourney(step: string, action: string, details?: Record<string, any>): void {
    this.track('user_journey', 'journey', action, step, undefined, details);
  }

  trackError(error: Error, context?: string): void {
    this.track('error', 'error', 'occurred', error.message, undefined, {
      stack: error.stack,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    });
  }

  private getUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id') || undefined;
    }
    return undefined;
  }

  private sendToAnalytics(event: AnalyticsEvent): void {
    // Send to your analytics service (Google Analytics, Mixpanel, etc.)
    // This is a placeholder - implement based on your analytics provider
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties
      });
    }
  }

  // Get analytics data
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getSessionId(): string {
    return this.sessionId;
  }

  // Export data for debugging
  exportData(): {
    sessionId: string;
    events: AnalyticsEvent[];
    metrics: PerformanceMetric[];
    timestamp: string;
  } {
    return {
      sessionId: this.sessionId,
      events: this.events,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  // Clear data
  clear(): void {
    this.events = [];
    this.metrics = [];
  }

  // Enable/disable tracking
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (event: string, category: string, action: string, label?: string, value?: number) => {
  analytics.track(event, category, action, label, value);
};

export const trackAPI = (endpoint: string, method: string, duration: number, status: number) => {
  analytics.trackAPIRequest(endpoint, method, duration, status);
};

export const trackJourney = (step: string, action: string, details?: Record<string, any>) => {
  analytics.trackUserJourney(step, action, details);
};

export const trackError = (error: Error, context?: string) => {
  analytics.trackError(error, context);
}; 