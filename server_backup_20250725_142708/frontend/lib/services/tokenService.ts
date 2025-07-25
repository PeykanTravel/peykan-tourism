/**
 * Centralized token management service
 * Handles token storage, retrieval, validation, and cleanup
 */

export interface TokenData {
  access: string;
  refresh: string;
  user: any;
}

class TokenService {
  private static instance: TokenService;
  private tokenCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Start token validation check
    this.startTokenValidation();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Store tokens and user data
   */
  public storeTokens(tokens: TokenData): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(tokens.user));
      
      console.log('Tokens stored successfully');
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Get access token
   */
  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Get user data
   */
  public getUser(): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Clear all tokens and user data
   */
  public clearTokens(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      console.log('Tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Validate token with backend
   */
  public async validateToken(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const response = await fetch('http://167.235.140.125:8000/api/v1/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return true;
      } else if (response.status === 401) {
        console.warn('Token validation failed - 401 Unauthorized');
        this.clearTokens();
        return false;
      } else {
        console.warn('Token validation failed - unexpected status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Refresh token
   */
  public async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch('http://167.235.140.125:8000/api/v1/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh: refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        const user = this.getUser();
        
        // Store new tokens
        this.storeTokens({
          access: data.access,
          refresh: data.refresh || refreshToken, // Keep old refresh token if not provided
          user: user
        });
        
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.error('Token refresh failed:', response.status);
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Start periodic token validation
   */
  private startTokenValidation(): void {
    if (typeof window === 'undefined') return;

    // Check token every 5 minutes
    this.tokenCheckInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        const isValid = await this.validateToken();
        if (!isValid) {
          console.warn('Token validation failed during periodic check');
          // Could emit an event here to notify the app
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop periodic token validation
   */
  public stopTokenValidation(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }

  /**
   * Get authorization header for API requests
   */
  public getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Check if token is expired (basic JWT check)
   */
  public isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      return now >= exp;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}

// Export singleton instance
export const tokenService = TokenService.getInstance();

// Export types
export type { TokenService }; 