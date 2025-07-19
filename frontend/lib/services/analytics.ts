// Analytics service for tracking user behavior and performance

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
  duration?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserAction {
  action: string;
  element: string;
  path: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private userActions: UserAction[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
    this.initialize();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private initialize(): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    // Track page views
    this.trackPageView(window.location.pathname, document.title);

    // Track user interactions
    this.setupEventTracking();

    // Track performance
    this.setupPerformanceTracking();

    // Send data periodically
    setInterval(() => {
      this.sendData();
    }, 30000); // Send every 30 seconds
  }

  private setupEventTracking(): void {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const action = target.getAttribute('data-analytics-action');
      const category = target.getAttribute('data-analytics-category');
      const label = target.getAttribute('data-analytics-label');

      if (action) {
        this.trackEvent(category || 'user_interaction', action, label || undefined);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.id || 'unknown_form';
      this.trackEvent('form', 'submit', formName);
    });
  }

  private setupPerformanceTracking(): void {
    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Track Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.trackEvent('performance', 'lcp', undefined, lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any; // Type assertion for FID entry
          this.trackEvent('performance', 'fid', entry.name, fidEntry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Track Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.trackEvent('performance', 'cls', undefined, clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public trackEvent(category: string, action: string, label?: string, value?: number, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      event: 'custom_event',
      category,
      action,
      label,
      value,
      properties,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.events.push(event);
    console.log('Analytics Event:', event);
  }

  public trackPageView(path: string, title: string, referrer?: string): void {
    const pageView: PageView = {
      path,
      title,
      referrer: referrer || document.referrer,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.pageViews.push(pageView);
    console.log('Page View:', pageView);
  }

  public trackUserAction(action: string, element: string, path?: string): void {
    const userAction: UserAction = {
      action,
      element,
      path: path || window.location.pathname,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    this.userActions.push(userAction);
    console.log('User Action:', userAction);
  }

  public trackTourBooking(tourId: string, tourName: string, price: number, participants: number): void {
    this.trackEvent('booking', 'tour_selected', tourName, price, {
      tourId,
      participants,
      currency: 'USD'
    });
  }

  public trackCartAction(action: 'add' | 'remove' | 'update', productType: string, productId: string, quantity: number): void {
    this.trackEvent('cart', action, productType, quantity, {
      productId,
      productType
    });
  }

  public trackCheckoutStep(step: string, stepNumber: number): void {
    this.trackEvent('checkout', 'step_completed', step, stepNumber);
  }

  public trackPayment(method: string, amount: number, success: boolean): void {
    this.trackEvent('payment', success ? 'success' : 'failed', method, amount, {
      paymentMethod: method,
      success
    });
  }

  public trackError(error: string, context: string, stack?: string): void {
    this.trackEvent('error', 'occurred', context, undefined, {
      error,
      stack,
      url: window.location.href
    });
  }

  private async sendData(): Promise<void> {
    if (!this.isEnabled || this.events.length === 0) return;

    try {
      const data = {
        events: this.events,
        pageViews: this.pageViews,
        userActions: this.userActions,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now()
      };

      // Send to analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      // Clear sent data
      this.events = [];
      this.pageViews = [];
      this.userActions = [];
    } catch (error) {
      console.error('Failed to send analytics data:', error);
    }
  }

  public getMetrics(): {
    events: AnalyticsEvent[];
    pageViews: PageView[];
    userActions: UserAction[];
  } {
    return {
      events: [...this.events],
      pageViews: [...this.pageViews],
      userActions: [...this.userActions]
    };
  }

  public clearData(): void {
    this.events = [];
    this.pageViews = [];
    this.userActions = [];
  }
}

// Create global analytics instance
export const analytics = new AnalyticsService();

// React hook for analytics
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackTourBooking: analytics.trackTourBooking.bind(analytics),
    trackCartAction: analytics.trackCartAction.bind(analytics),
    trackCheckoutStep: analytics.trackCheckoutStep.bind(analytics),
    trackPayment: analytics.trackPayment.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics)
  };
};

export default analytics; 