/**
 * Local Storage Implementation
 * Client-side storage using browser's localStorage
 */

export interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export interface StorageOptions {
  prefix?: string;
  defaultTTL?: number; // Time to live in milliseconds
}

export class LocalStorageManager {
  private prefix: string;
  private defaultTTL: number;

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'app_';
    this.defaultTTL = options.defaultTTL || 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Set item in localStorage
   */
  set<T>(key: string, value: T, ttl?: number): void {
    try {
      const storageKey = this.getStorageKey(key);
      const expiresAt = ttl ? Date.now() + ttl : this.defaultTTL ? Date.now() + this.defaultTTL : undefined;
      
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt
      };

      window.localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  /**
   * Get item from localStorage
   */
  get<T>(key: string): T | null {
    try {
      const storageKey = this.getStorageKey(key);
      const itemString = window.localStorage.getItem(storageKey);
      
      if (!itemString) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(itemString);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  remove(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  /**
   * Check if item exists in localStorage
   */
  has(key: string): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      const itemString = window.localStorage.getItem(storageKey);
      
      if (!itemString) {
        return false;
      }

      const item: StorageItem = JSON.parse(itemString);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking localStorage item:', error);
      return false;
    }
  }

  /**
   * Clear all items with prefix
   */
  clear(): void {
    try {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get all keys with prefix
   */
  keys(): string[] {
    try {
      const keys = Object.keys(window.localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.substring(this.prefix.length));
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   */
  size(): number {
    try {
      let size = 0;
      const keys = Object.keys(window.localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          size += window.localStorage.getItem(key)?.length || 0;
        }
      });
      
      return size;
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  }

  /**
   * Get storage usage percentage
   */
  usagePercentage(): number {
    try {
      const used = this.size();
      const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
      return (used / total) * 100;
    } catch (error) {
      console.error('Error calculating localStorage usage:', error);
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
      console.error('Error cleaning expired localStorage items:', error);
    }
  }

  /**
   * Get item with metadata
   */
  getWithMetadata<T>(key: string): { value: T | null; metadata: { timestamp: number; expiresAt?: number } } | null {
    try {
      const storageKey = this.getStorageKey(key);
      const itemString = window.localStorage.getItem(storageKey);
      
      if (!itemString) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(itemString);

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
      console.error('Error getting localStorage item with metadata:', error);
      return null;
    }
  }

  /**
   * Set multiple items
   */
  setMultiple(items: Array<{ key: string; value: any; ttl?: number }>): void {
    items.forEach(item => {
      this.set(item.key, item.value, item.ttl);
    });
  }

  /**
   * Get multiple items
   */
  getMultiple<T>(keys: string[]): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach(key => {
      result[key] = this.get<T>(key);
    });
    return result;
  }

  /**
   * Remove multiple items
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

// Export a default instance
export const localStorage = new LocalStorageManager();

// Also export the class for custom instances
export { LocalStorageManager as LocalStorage }; 