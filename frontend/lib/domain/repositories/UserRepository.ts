/**
 * User Repository Interface
 * Defines the contract for user data access operations
 */

import { UserAggregate, UserProfile, UserPreferences } from '../aggregates/UserAggregate';
import { User, UserRole } from '../entities/User';
import { Language } from '../value-objects/Language';
import { Currency } from '../value-objects/Currency';

export interface UserSearchCriteria {
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  language?: Language;
  currency?: Currency;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface UserCreateData {
  username: string;
  email: string;
  role?: UserRole;
  profile: UserProfile;
  preferences?: UserPreferences;
}

export interface UserUpdateData {
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<UserAggregate | null>;

  /**
   * Find user by username
   */
  findByUsername(username: string): Promise<UserAggregate | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<UserAggregate | null>;

  /**
   * Find users by search criteria
   */
  findByCriteria(criteria: UserSearchCriteria): Promise<UserAggregate[]>;

  /**
   * Find all users
   */
  findAll(): Promise<UserAggregate[]>;

  /**
   * Find users by role
   */
  findByRole(role: UserRole): Promise<UserAggregate[]>;

  /**
   * Find active users
   */
  findActiveUsers(): Promise<UserAggregate[]>;

  /**
   * Find verified users
   */
  findVerifiedUsers(): Promise<UserAggregate[]>;

  /**
   * Find users by language preference
   */
  findByLanguage(language: Language): Promise<UserAggregate[]>;

  /**
   * Find users by currency preference
   */
  findByCurrency(currency: Currency): Promise<UserAggregate[]>;

  /**
   * Create a new user
   */
  create(data: UserCreateData): Promise<UserAggregate>;

  /**
   * Update user
   */
  update(id: string, data: UserUpdateData): Promise<UserAggregate>;

  /**
   * Delete user
   */
  delete(id: string): Promise<boolean>;

  /**
   * Activate user
   */
  activate(id: string): Promise<UserAggregate>;

  /**
   * Deactivate user
   */
  deactivate(id: string): Promise<UserAggregate>;

  /**
   * Mark email as verified
   */
  markEmailAsVerified(id: string): Promise<UserAggregate>;

  /**
   * Mark phone as verified
   */
  markPhoneAsVerified(id: string): Promise<UserAggregate>;

  /**
   * Update last login
   */
  updateLastLogin(id: string): Promise<UserAggregate>;

  /**
   * Check if username exists
   */
  existsByUsername(username: string): Promise<boolean>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Count total users
   */
  count(): Promise<number>;

  /**
   * Count users by role
   */
  countByRole(role: UserRole): Promise<number>;

  /**
   * Count active users
   */
  countActiveUsers(): Promise<number>;

  /**
   * Count verified users
   */
  countVerifiedUsers(): Promise<number>;

  /**
   * Get user statistics
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    verified: number;
    byRole: Record<UserRole, number>;
    byLanguage: Record<string, number>;
    byCurrency: Record<string, number>;
  }>;
} 