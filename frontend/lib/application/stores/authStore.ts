import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AuthCredentials, 
  RegisterData, 
  AuthResponse 
} from '../../domain/entities/User';
import { authApi } from '../../infrastructure/api/auth';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: {
    token: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>;
  
  // Email/Phone verification
  requestEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPhoneVerification: () => Promise<void>;
  verifyPhone: (data: { phone_number: string; code: string }) => Promise<void>;
  
  // OTP
  requestOTP: (data: { email?: string; phone_number?: string }) => Promise<void>;
  verifyOTP: (data: { email?: string; phone_number?: string; code: string }) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  checkAuthStatus: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: AuthCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: null 
          });
        } catch (error: any) {
          // Still clear local state even if API call fails
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: error.message || 'Logout failed' 
          });
        }
      },

      refreshToken: async () => {
        try {
          await authApi.refreshToken();
          // Token is automatically stored by the API client
        } catch (error: any) {
          // If refresh fails, logout user
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: 'Session expired' 
          });
          throw error;
        }
      },

      getCurrentUser: async () => {
        if (!authApi.isAuthenticated()) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authApi.getCurrentUser();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false, 
            error: error.message || 'Failed to get user profile' 
          });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.updateProfile(data);
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Profile update failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      changePassword: async (data: {
        current_password: string;
        new_password: string;
        confirm_password: string;
      }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Password change failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Password reset request failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      resetPassword: async (data: {
        token: string;
        new_password: string;
        confirm_password: string;
      }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resetPassword(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Password reset failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      requestEmailVerification: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.requestEmailVerification();
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Email verification request failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.verifyEmail(token);
          // Refresh user to get updated verification status
          await get().getCurrentUser();
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Email verification failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      requestPhoneVerification: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.requestPhoneVerification();
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Phone verification request failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyPhone: async (data: { phone_number: string; code: string }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.verifyPhone(data);
          // Refresh user to get updated verification status
          await get().getCurrentUser();
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Phone verification failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      requestOTP: async (data: { email?: string; phone_number?: string }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.requestOTP(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'OTP request failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyOTP: async (data: { email?: string; phone_number?: string; code: string }) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.verifyOTP(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'OTP verification failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Utilities
      clearError: () => set({ error: null }),
      
      checkAuthStatus: () => {
        const isAuthenticated = authApi.isAuthenticated();
        set({ isAuthenticated });
        if (isAuthenticated && !get().user) {
          get().getCurrentUser();
        }
      },

      setUser: (user: User | null) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth status on store creation
useAuthStore.getState().checkAuthStatus(); 