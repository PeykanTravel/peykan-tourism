import { useAuth as useAppAuth } from '../../contexts/AppContext';
import { User } from '../../domain/entities/User';
import { AuthService } from '../services/AuthService';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const authContext = useAppAuth();
  // Note: AuthService requires UserRepository in constructor
  // For now, we'll use a simplified approach

  const login = async (email: string, password: string) => {
    try {
      authContext.setLoading(true);
      authContext.clearError();
      
      // TODO: Implement proper AuthService with repository
      // const authService = new AuthService(userRepository);
      // const response = await authService.login({ email, password });
      // authContext.login(response.user);
      
      // Temporary implementation
      throw new Error('AuthService not properly configured');
    } catch (error: any) {
      authContext.setError(error.message || 'Login failed');
    } finally {
      authContext.setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      authContext.setLoading(true);
      authContext.clearError();
      
      // TODO: Implement proper AuthService with repository
      // const authService = new AuthService(userRepository);
      // const response = await authService.register(userData);
      // authContext.login(response.user);
      
      // Temporary implementation
      throw new Error('AuthService not properly configured');
    } catch (error: any) {
      authContext.setError(error.message || 'Registration failed');
    } finally {
      authContext.setLoading(false);
    }
  };

  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: authContext.error,
    login,
    register,
    logout: authContext.logout,
    setLoading: authContext.setLoading,
    setError: authContext.setError,
    clearError: authContext.clearError,
  };
} 