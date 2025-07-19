/**
 * User Repository Interface
 * Simplified interface for user data access operations
 */

import { User } from '../entities/User';

export interface UserSearchCriteria {
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role?: string;
}

export interface UserUpdateData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface UserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find users by search criteria
   */
  findByCriteria(criteria: UserSearchCriteria): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Create a new user
   */
  create(data: UserCreateData): Promise<User>;

  /**
   * Update user
   */
  update(id: string, data: UserUpdateData): Promise<User>;

  /**
   * Delete user
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if username exists
   */
  existsByUsername(username: string): Promise<boolean>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Get user statistics
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }>;
} 