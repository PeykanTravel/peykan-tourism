interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private isExpired(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return true;
    
    return Date.now() - item.timestamp > item.ttl;
  }

  // Cache with automatic cleanup
  setWithCleanup<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.set(key, data, ttl);
    
    // Auto cleanup after TTL
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  // Get cache stats
  getStats() {
    const keys = Array.from(this.cache.keys());
    const expiredKeys = keys.filter(key => this.isExpired(key));
    
    return {
      total: keys.length,
      expired: expiredKeys.length,
      valid: keys.length - expiredKeys.length
    };
  }
}

export const cacheService = new CacheService();

// API wrapper with caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = cacheService.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    cacheService.set(cacheKey, data, ttl);
    
    return data;
  } catch (error) {
    console.error('Cached fetch error:', error);
    throw error;
  }
}

// Cache keys for different API endpoints
export const CACHE_KEYS = {
  TOURS: 'tours',
  TOUR_DETAIL: (slug: string) => `tour-${slug}`,
  EVENTS: 'events',
  EVENT_DETAIL: (slug: string) => `event-${slug}`,
  TRANSFERS: 'transfers',
  USER_PROFILE: 'user-profile',
  CART: 'cart'
} as const; 