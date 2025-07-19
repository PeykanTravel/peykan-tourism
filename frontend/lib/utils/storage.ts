// Safe localStorage utility that handles SSR
export class SafeStorage {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  static getItem(key: string): string | null {
    if (!this.isClient()) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem error:', error);
      return null;
    }
  }

  static setItem(key: string, value: string): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem error:', error);
    }
  }

  static removeItem(key: string): void {
    if (!this.isClient()) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem error:', error);
    }
  }

  static clear(): void {
    if (!this.isClient()) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage.clear error:', error);
    }
  }
} 