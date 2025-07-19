/**
 * User Repository Implementation
 * API-based implementation of UserRepository interface
 */

import { UserRepository, UserCreateData, UserUpdateData, UserSearchCriteria } from '../../domain/repositories/UserRepository';
import { UserAggregate } from '../../domain/aggregates/UserAggregate';
import { User, UserRole } from '../../domain/entities/User';
import { Language } from '../../domain/value-objects/Language';
import { Currency } from '../../domain/value-objects/Currency';
import { apiClient, ApiResponse } from '../api/ApiClient';

export class UserRepositoryImpl implements UserRepository {
  private readonly baseUrl = '/users';

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToUserAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<UserAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/by-username/${username}`);
      
      if (response.success && response.data) {
        return this.mapToUserAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/by-email/${email}`);
      
      if (response.success && response.data) {
        return this.mapToUserAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find users with search criteria
   */
  async find(criteria: UserSearchCriteria): Promise<{
    users: UserAggregate[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (criteria.page) params.append('page', criteria.page.toString());
      if (criteria.limit) params.append('limit', criteria.limit.toString());
      if (criteria.search) params.append('search', criteria.search);
      if (criteria.role) params.append('role', criteria.role);
      if (criteria.isActive !== undefined) params.append('is_active', criteria.isActive.toString());
      if (criteria.sortBy) params.append('sort_by', criteria.sortBy);
      if (criteria.sortOrder) params.append('sort_order', criteria.sortOrder);

      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const users = response.data.results.map((userData: any) => this.mapToUserAggregate(userData));
        
        return {
          users,
          total: response.data.count || users.length,
          page: response.data.page || 1,
          limit: response.data.limit || users.length
        };
      }
      
      return { users: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error finding users:', error);
      return { users: [], total: 0, page: 1, limit: 10 };
    }
  }

  /**
   * Create new user
   */
  async create(data: UserCreateData): Promise<UserAggregate> {
    try {
      const requestData = this.mapFromUserCreateData(data);
      
      const response = await apiClient.post<ApiResponse<any>>(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToUserAggregate(response.data);
      }
      
      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UserUpdateData): Promise<UserAggregate> {
    try {
      const requestData = this.mapFromUserUpdateData(data);
      
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToUserAggregate(response.data);
      }
      
      throw new Error('Failed to update user');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Check if username exists
   */
  async existsByUsername(username: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/exists/username/${username}`);
      return response.success && response.data?.exists === true;
    } catch (error) {
      console.error('Error checking username existence:', error);
      return false;
    }
  }

  /**
   * Check if email exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/exists/email/${email}`);
      return response.success && response.data?.exists === true;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string): Promise<UserAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/last-login`);
      
      if (response.success && response.data) {
        return this.mapToUserAggregate(response.data);
      }
      
      throw new Error('Failed to update last login');
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return { total: 0, active: 0, inactive: 0, byRole: {} };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return { total: 0, active: 0, inactive: 0, byRole: {} };
    }
  }

  /**
   * Map API response to UserAggregate
   */
  private mapToUserAggregate(userData: any): UserAggregate {
    // Create User entity
    const user = User.create(
      userData.id,
      userData.username,
      userData.email,
      userData.role as UserRole,
      userData.profile?.firstName || '',
      userData.profile?.lastName || '',
      userData.profile?.dateOfBirth ? new Date(userData.profile.dateOfBirth) : undefined,
      userData.profile?.nationality,
      userData.isActive,
      userData.emailVerified,
      userData.createdAt ? new Date(userData.createdAt) : new Date(),
      userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
      userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined
    );

    // Create UserAggregate
    const userAggregate = UserAggregate.create(
      user,
      userData.preferences?.language ? Language.create(userData.preferences.language) : Language.getDefault(),
      userData.preferences?.currency ? Currency.create(userData.preferences.currency) : Currency.getDefault(),
      userData.preferences?.notifications || {
        email: true,
        sms: false,
        push: true
      }
    );

    return userAggregate;
  }

  /**
   * Map UserCreateData to API request format
   */
  private mapFromUserCreateData(data: UserCreateData): any {
    return {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role,
      profile: {
        firstName: data.profile?.firstName,
        lastName: data.profile?.lastName,
        dateOfBirth: data.profile?.dateOfBirth?.toISOString(),
        nationality: data.profile?.nationality
      },
      preferences: {
        language: data.preferences?.language?.getCode(),
        currency: data.preferences?.currency?.getCode(),
        notifications: data.preferences?.notifications
      }
    };
  }

  /**
   * Map UserUpdateData to API request format
   */
  private mapFromUserUpdateData(data: UserUpdateData): any {
    const updateData: any = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.emailVerified !== undefined) updateData.email_verified = data.emailVerified;

    if (data.profile) {
      updateData.profile = {};
      if (data.profile.firstName !== undefined) updateData.profile.firstName = data.profile.firstName;
      if (data.profile.lastName !== undefined) updateData.profile.lastName = data.profile.lastName;
      if (data.profile.dateOfBirth !== undefined) updateData.profile.dateOfBirth = data.profile.dateOfBirth?.toISOString();
      if (data.profile.nationality !== undefined) updateData.profile.nationality = data.profile.nationality;
    }

    if (data.preferences) {
      updateData.preferences = {};
      if (data.preferences.language !== undefined) updateData.preferences.language = data.preferences.language.getCode();
      if (data.preferences.currency !== undefined) updateData.preferences.currency = data.preferences.currency.getCode();
      if (data.preferences.notifications !== undefined) updateData.preferences.notifications = data.preferences.notifications;
    }

    return updateData;
  }
} 