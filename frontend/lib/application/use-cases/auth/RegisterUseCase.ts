import { UserRepository } from '../../../domain/repositories/UserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { ContactInfo } from '../../../domain/value-objects/ContactInfo';
import { UserRole } from '../../../domain/value-objects/UserRole';

export interface RegisterUseCaseRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export interface RegisterUseCaseResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export class RegisterUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    try {
      // Validate input
      const email = Email.create(request.email);
      const password = Password.create(request.password);
      const contactInfo = ContactInfo.create({
        firstName: request.firstName,
        lastName: request.lastName,
        phone: request.phone
      });
      const role = request.role ? UserRole.create(request.role) : UserRole.create('customer');

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = User.create({
        email,
        password,
        contactInfo,
        role
      });

      // Register user
      const result = await this.userRepository.register(user);
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

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
} 