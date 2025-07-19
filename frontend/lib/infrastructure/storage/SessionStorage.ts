/**
 * Session Storage Implementation
 * Client-side storage using browser's sessionStorage
 */

export interface SessionStorageItem<T = any> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export interface SessionStorageOptions {
  prefix?: string;
  defaultTTL?: number; // Time to live in milliseconds
}

export class SessionStorage {
  private prefix: string;
  private defaultTTL: number;

  constructor(options: SessionStorageOptions = {}) {
    this.prefix = options.prefix || 'session_';
    this.defaultTTL = options.defaultTTL || 60 * 60 * 1000; // 1 hour
  }

  /**
   * Set item in sessionStorage
   */
  set<T>(key: string, value: T, ttl?: number): void {
    try {
      const storageKey = this.getStorageKey(key);
      const expiresAt = ttl ? Date.now() + ttl : this.defaultTTL ? Date.now() + this.defaultTTL : undefined;
      
      const item: SessionStorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt
      };

      sessionStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
    }
  }

  /**
   * Get item from sessionStorage
   */
  get<T>(key: string): T | null {
    try {
      const storageKey = this.getStorageKey(key);
      const itemString = sessionStorage.getItem(storageKey);
      
      if (!itemString) {
        return null;
      }

      const item: SessionStorageItem<T> = JSON.parse(itemString);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  remove(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
    }
  }

  /**
   * Check if item exists in sessionStorage
   */
  has(key: string): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      const itemString = sessionStorage.getItem(storageKey);
      
      if (!itemString) {
        return false;
      }

      const item: SessionStorageItem = JSON.parse(itemString);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking sessionStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    try {
      const keys = Object.keys(sessionStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting sessionStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  size(): number {
    try {
      let size = 0;
      const keys = Object.keys(sessionStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          size += sessionStorage.getItem(key)?.length || 0;
        }
      });
      
      return size;
    } catch (error) {
      console.error('Error calculating sessionStorage size:', error);
      return 0;
    }
  }

  /**
   * Get storage usage percentage
   */
  usagePercentage(): number {
    try {
      const used = this.size();
      const total = 5 * 1024 * 1024; // 5MB typical sessionStorage limit
      return (used / total) * 100;
    } catch (error) {
      console.error('Error calculating sessionStorage usage:', error);
      return 0;
    }
  }

  /**
   * Clean expired items
   */
  cleanExpired(): void {
    try {
      const keys = this.keys();
      keys.forEach(key => {
        if (this.has(key)) {
          // has() method already checks for expiration
          // If item is expired, it will be removed automatically
        }
      });
    } catch (error) {
      console.error('Error cleaning expired sessionStorage items:', error);
    }
  }

  /**
   * Get item with metadata
   */
  getWithMetadata<T>(key: string): { value: T | null; metadata: { timestamp: number; expiresAt?: number } } | null {
    try {
      const storageKey = this.getStorageKey(key);
      const itemString = sessionStorage.getItem(storageKey);
      
      if (!itemString) {
        return null;
      }

      const item: SessionStorageItem<T> = JSON.parse(itemString);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return {
        value: item.value,
        metadata: {
          timestamp: item.timestamp,
          expiresAt: item.expiresAt
        }
      };
    } catch (error) {
      console.error('Error getting sessionStorage item with metadata:', error);
      return null;
    }
  }

  /**
   * Set multiple items at once
   */
  setMultiple(items: Array<{ key: string; value: any; ttl?: number }>): void {
    items.forEach(item => {
      this.set(item.key, item.value, item.ttl);
    });
  }

  /**
   * Get multiple items at once
   */
  getMultiple<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  /**
   * Remove multiple items at once
   */
  removeMultiple(keys: string[]): void {
    keys.forEach(key => {
      this.remove(key);
    });
  }

  /**
   * Get storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

// Create default instance
export const sessionStorage = new SessionStorage({
  prefix: 'peykan_session_',
  defaultTTL: 60 * 60 * 1000 // 1 hour
}); 