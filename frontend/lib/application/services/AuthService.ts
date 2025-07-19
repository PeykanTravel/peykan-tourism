import { LoginUseCase } from '../use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../use-cases/auth/RegisterUseCase';
import { LogoutUseCase } from '../use-cases/auth/LogoutUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export class AuthService {
  private loginUseCase: LoginUseCase;
  private registerUseCase: RegisterUseCase;
  private logoutUseCase: LogoutUseCase;

  constructor(userRepository: UserRepository) {
    this.loginUseCase = new LoginUseCase(userRepository);
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.logoutUseCase = new LogoutUseCase(userRepository);
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const result = await this.loginUseCase.execute({
        email: request.email,
        password: request.password
      });

      return {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Authentication failed: ${error.message}`);
      }
      throw new Error('Authentication failed: Unknown error');
    }
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const result = await this.registerUseCase.execute({
        email: request.email,
        password: request.password,
        firstName: request.firstName,
        lastName: request.lastName,
        phone: request.phone,
        role: request.role
      });

      return {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: Unknown error');
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      const result = await this.logoutUseCase.execute({ token });
      return result.success;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
      throw new Error('Logout failed: Unknown error');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // This would be implemented with a RefreshTokenUseCase
    throw new Error('Refresh token functionality not implemented yet');
  }

  async getCurrentUser(token: string): Promise<User | null> {
    // This would be implemented with a GetCurrentUserUseCase
    throw new Error('Get current user functionality not implemented yet');
  }
} 