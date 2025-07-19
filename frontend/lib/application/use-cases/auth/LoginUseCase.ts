import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { LoginCredentials } from '../../../domain/value-objects/LoginCredentials';

export interface LoginUseCaseRequest {
  email: string;
  password: string;
}

export interface LoginUseCaseResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: LoginUseCaseRequest): Promise<LoginUseCaseResponse> {
    try {
      // Validate input
      const email = Email.create(request.email);
      const password = Password.create(request.password);
      
      const credentials = LoginCredentials.create({
        email,
        password
      });

      // Attempt login
      const result = await this.userRepository.login(credentials);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      return {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error');
    }
  }
} 