import { UserRepository, LoginCredentials } from '../../repositories/UserRepository';
import { ApiResponse } from '../../entities/Common';
import { User } from '../../entities/User';

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: any }>> {
    // Validate credentials
    if (!credentials.username || !credentials.password) {
      return {
        success: false,
        data: null as any,
        message: 'Username and password are required',
        errors: ['Username and password are required'],
        status: 400,
        status_code: 400
      };
    }

    // Validate username format
    if (credentials.username.length < 3) {
      return {
        success: false,
        data: null as any,
        message: 'Username must be at least 3 characters long',
        errors: ['Username must be at least 3 characters long'],
        status: 400,
        status_code: 400
      };
    }

    // Validate password strength
    if (credentials.password.length < 6) {
      return {
        success: false,
        data: null as any,
        message: 'Password must be at least 6 characters long',
        errors: ['Password must be at least 6 characters long'],
        status: 400,
        status_code: 400
      };
    }

    try {
      // Call repository
      const result = await this.userRepository.login(credentials);
      
      if (result.success) {
        // Additional business logic can be added here
        // e.g., logging, analytics, etc.
        return result;
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        data: null as any,
        message: error.message || 'Login failed',
        errors: [error.message || 'Login failed'],
        status: 500,
        status_code: 500
      };
    }
  }
} 