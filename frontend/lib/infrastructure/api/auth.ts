import { apiClient } from './client';
import { 
  User, 
  AuthCredentials, 
  RegisterData, 
  AuthResponse, 
  AuthTokens 
} from '../../domain/entities/User';
import { PaginatedResponse } from '../../domain/entities/Common';
import { SafeStorage } from '../../utils/storage';

export class AuthApi {
  private readonly basePath = '/auth';

  // Authentication endpoints
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.basePath}/login/`, 
      credentials
    );
    
    // Store tokens automatically
    if (response.tokens) {
      apiClient.setTokens(
        response.tokens.access_token,
        response.tokens.refresh_token,
        response.tokens.expires_in
      );
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      `${this.basePath}/register/`, 
      data
    );
    
    // Store tokens automatically
    if (response.tokens) {
      apiClient.setTokens(
        response.tokens.access_token,
        response.tokens.refresh_token,
        response.tokens.expires_in
      );
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/logout/`);
    } finally {
      // Clear tokens regardless of API response
      apiClient.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(
      `${this.basePath}/refresh-token/`
    );
    
    // Store new tokens
    apiClient.setTokens(
      response.access_token,
      response.refresh_token,
      response.expires_in
    );
    
    return response;
  }

  // User profile endpoints
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(`${this.basePath}/profile/`);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.patch<User>(`${this.basePath}/profile/`, data);
  }

  // Password management
  async changePassword(data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    return apiClient.post(`${this.basePath}/change-password/`, data);
  }

  async forgotPassword(email: string): Promise<void> {
    return apiClient.post(`${this.basePath}/forgot-password/`, { email });
  }

  async resetPassword(data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    return apiClient.post(`${this.basePath}/reset-password/`, data);
  }

  // Email verification
  async requestEmailVerification(): Promise<void> {
    return apiClient.post(`${this.basePath}/request-email-verification/`);
  }

  async verifyEmail(token: string): Promise<void> {
    return apiClient.post(`${this.basePath}/verify-email/`, { token });
  }

  // Phone verification
  async requestPhoneVerification(): Promise<void> {
    return apiClient.post(`${this.basePath}/request-phone-verification/`);
  }

  async verifyPhone(data: { phone_number: string; code: string }): Promise<void> {
    return apiClient.post(`${this.basePath}/verify-phone/`, data);
  }

  // OTP management
  async requestOTP(data: { email?: string; phone_number?: string }): Promise<void> {
    return apiClient.post(`${this.basePath}/request-otp/`, data);
  }

  async verifyOTP(data: { 
    email?: string; 
    phone_number?: string; 
    code: string; 
  }): Promise<void> {
    return apiClient.post(`${this.basePath}/verify-otp/`, data);
  }

  // User activity
  async getUserActivity(): Promise<any[]> {
    return apiClient.get(`${this.basePath}/activity/`);
  }

  // Check authentication status
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  // Get stored tokens
  getTokens(): { access: string | null; refresh: string | null } {
    return {
      access: SafeStorage.getItem('access_token'),
      refresh: SafeStorage.getItem('refresh_token')
    };
  }
}

// Export singleton instance
export const authApi = new AuthApi();
export default authApi; 