import { UserRepository } from '../../../domain/repositories/UserRepository';

export interface LogoutUseCaseRequest {
  token: string;
}

export interface LogoutUseCaseResponse {
  success: boolean;
  message: string;
}

export class LogoutUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    try {
      // Validate token
      if (!request.token) {
        throw new Error('Token is required for logout');
      }

      // Perform logout
      const result = await this.userRepository.logout(request.token);
      
      if (!result.success) {
        throw new Error(result.error || 'Logout failed');
      }

      return {
        success: true,
        message: 'Successfully logged out'
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Logout failed: ${error.message}`);
      }
      throw new Error('Logout failed: Unknown error');
    }
  }
} 