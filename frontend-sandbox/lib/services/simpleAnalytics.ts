export interface SimpleAnalyticsEvent {
  category: string;
  action: string;
  timestamp: number;
}

export interface SimpleUserBehavior {
  pageViews: number;
  interactions: number;
  conversions: number;
}

class SimpleAnalyticsService {
  private events: SimpleAnalyticsEvent[] = [];
  private sessionId: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    if (this.isInitialized) return;
    
    // Track initial page view
    this.trackPageView();
    
    this.isInitialized = true;
    console.log('📊 Simple Analytics service initialized');
  }

  trackEvent(category: string, action: string): void {
    const event: SimpleAnalyticsEvent = {
      category,
      action,
      timestamp: Date.now()
    };

    this.events.push(event);
    console.log('📊 Event tracked:', event);
  }

  trackPageView(): void {
    this.trackEvent('page_view', 'view');
  }

  trackUserInteraction(element: string, action: string): void {
    this.trackEvent('user_interaction', `${action}_${element}`);
  }

  trackConversion(type: string): void {
    this.trackEvent('conversion', type);
  }

  getUserBehavior(): SimpleUserBehavior {
    const pageViews = this.events.filter(e => e.category === 'page_view').length;
    const interactions = this.events.filter(e => e.category === 'user_interaction').length;
    const conversions = this.events.filter(e => e.category === 'conversion').length;

    return {
      pageViews,
      interactions,
      conversions
    };
  }

  getEvents(): SimpleAnalyticsEvent[] {
    return [...this.events];
  }
}

// Singleton instance
let simpleAnalyticsService: SimpleAnalyticsService | null = null;

export const getSimpleAnalyticsService = (): SimpleAnalyticsService => {
  if (!simpleAnalyticsService) {
    simpleAnalyticsService = new SimpleAnalyticsService();
  }
  return simpleAnalyticsService;
};

// Convenience functions
export const trackEvent = (category: string, action: string): void => {
  getSimpleAnalyticsService().trackEvent(category, action);
};

export const trackPageView = (): void => {
  getSimpleAnalyticsService().trackPageView();
};

export const trackUserInteraction = (element: string, action: string): void => {
  getSimpleAnalyticsService().trackUserInteraction(element, action);
};

export const trackConversion = (type: string): void => {
  getSimpleAnalyticsService().trackConversion(type);
}; 