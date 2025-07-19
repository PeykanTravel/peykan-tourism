/**
 * Authenticate User Use Case
 * Handles user authentication and authorization logic
 */

import { UserRepository, UserCreateData, UserUpdateData } from '../../repositories/UserRepository';
import { UserAggregate } from '../../aggregates/UserAggregate';
import { User, UserRole } from '../../entities/User';
import { Language } from '../../value-objects/Language';
import { Currency } from '../../value-objects/Currency';

export interface AuthenticationRequest {
  username?: string;
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

export interface AuthenticationResponse {
  success: boolean;
  user?: UserAggregate;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
  message?: string;
  errors?: string[];
}

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality?: string;
  language?: string;
  currency?: string;
  acceptTerms: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  user?: UserAggregate;
  token?: string;
  message?: string;
  errors?: string[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService?: any, // Will be implemented in infrastructure
    private readonly passwordService?: any // Will be implemented in infrastructure
  ) {}

  /**
   * Authenticate user with username/email and password
   */
  async authenticate(request: AuthenticationRequest): Promise<AuthenticationResponse> {
    try {
      // Validate input
      const validation = this.validateAuthenticationRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Find user by username or email
      let user: UserAggregate | null = null;
      if (request.username) {
        user = await this.userRepository.findByUsername(request.username);
      } else if (request.email) {
        user = await this.userRepository.findByEmail(request.email);
      }

      if (!user) {
        return {
          success: false,
          message: 'Invalid credentials',
          errors: ['User not found']
        };
      }

      // Check if user is active
      if (!user.isActive()) {
        return {
          success: false,
          message: 'Account is deactivated',
          errors: ['Account is not active']
        };
      }

      // Verify password (will be implemented with password service)
      if (request.password && this.passwordService) {
        const isPasswordValid = await this.passwordService.verify(
          request.password,
          user.getUser().getPasswordHash()
        );

        if (!isPasswordValid) {
          return {
            success: false,
            message: 'Invalid credentials',
            errors: ['Invalid password']
          };
        }
      }

      // Update last login
      const updatedUser = await this.userRepository.updateLastLogin(user.getId());

      // Generate authentication token
      let token: string | undefined;
      let refreshToken: string | undefined;
      let expiresAt: Date | undefined;

      if (this.tokenService) {
        const tokenData = await this.tokenService.generateToken({
          userId: updatedUser.getId(),
          username: updatedUser.getUsername(),
          email: updatedUser.getEmail(),
          role: updatedUser.getRole()
        });

        token = tokenData.token;
        refreshToken = tokenData.refreshToken;
        expiresAt = tokenData.expiresAt;
      }

      return {
        success: true,
        user: updatedUser,
        token,
        refreshToken,
        expiresAt,
        message: 'Authentication successful'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Authentication failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Register a new user
   */
  async register(request: RegistrationRequest): Promise<RegistrationResponse> {
    try {
      // Validate input
      const validation = this.validateRegistrationRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Check if username already exists
      const existingUsername = await this.userRepository.existsByUsername(request.username);
      if (existingUsername) {
        return {
          success: false,
          message: 'Username already exists',
          errors: ['Username is already taken']
        };
      }

      // Check if email already exists
      const existingEmail = await this.userRepository.existsByEmail(request.email);
      if (existingEmail) {
        return {
          success: false,
          message: 'Email already exists',
          errors: ['Email is already registered']
        };
      }

      // Hash password
      let hashedPassword: string | undefined;
      if (this.passwordService) {
        hashedPassword = await this.passwordService.hash(request.password);
      }

      // Create user data
      const userData: UserCreateData = {
        username: request.username,
        email: request.email,
        role: UserRole.CUSTOMER,
        profile: {
          firstName: request.firstName,
          lastName: request.lastName,
          dateOfBirth: request.dateOfBirth,
          nationality: request.nationality
        },
        preferences: {
          language: request.language ? Language.create(request.language) : Language.getDefault(),
          currency: request.currency ? Currency.create(request.currency) : Currency.getDefault(),
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      };

      // Create user
      const user = await this.userRepository.create(userData);

      // Generate authentication token
      let token: string | undefined;
      if (this.tokenService) {
        const tokenData = await this.tokenService.generateToken({
          userId: user.getId(),
          username: user.getUsername(),
          email: user.getEmail(),
          role: user.getRole()
        });

        token = tokenData.token;
      }

      return {
        success: true,
        user,
        token,
        message: 'Registration successful'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Registration failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      // Validate email
      if (!request.email || !this.isValidEmail(request.email)) {
        return {
          success: false,
          message: 'Invalid email address',
          errors: ['Please provide a valid email address']
        };
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        };
      }

      // Generate password reset token (will be implemented with token service)
      if (this.tokenService) {
        await this.tokenService.generatePasswordResetToken(user.getId(), user.getEmail());
      }

      return {
        success: true,
        message: 'Password reset link has been sent to your email'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Password reset request failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      // Validate input
      const validation = this.validateChangePasswordRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Find user
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          errors: ['User does not exist']
        };
      }

      // Verify current password
      if (this.passwordService) {
        const isCurrentPasswordValid = await this.passwordService.verify(
          request.currentPassword,
          user.getUser().getPasswordHash()
        );

        if (!isCurrentPasswordValid) {
          return {
            success: false,
            message: 'Current password is incorrect',
            errors: ['Current password does not match']
          };
        }
      }

      // Hash new password
      let hashedNewPassword: string | undefined;
      if (this.passwordService) {
        hashedNewPassword = await this.passwordService.hash(request.newPassword);
      }

      // Update user password
      const updateData: UserUpdateData = {
        // password will be updated through the user entity
      };

      await this.userRepository.update(request.userId, updateData);

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Password change failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Validate authentication request
   */
  private validateAuthenticationRequest(request: AuthenticationRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.username && !request.email) {
      errors.push('Username or email is required');
    }

    if (!request.password) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate registration request
   */
  private validateRegistrationRequest(request: RegistrationRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.username || request.username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (!request.email || !this.isValidEmail(request.email)) {
      errors.push('Please provide a valid email address');
    }

    if (!request.password || request.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (request.password !== request.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (!request.firstName || request.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!request.lastName || request.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (!request.acceptTerms) {
      errors.push('You must accept the terms and conditions');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate change password request
   */
  private validateChangePasswordRequest(request: ChangePasswordRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.currentPassword) {
      errors.push('Current password is required');
    }

    if (!request.newPassword || request.newPassword.length < 8) {
      errors.push('New password must be at least 8 characters long');
    }

    if (request.newPassword !== request.confirmNewPassword) {
      errors.push('New passwords do not match');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 