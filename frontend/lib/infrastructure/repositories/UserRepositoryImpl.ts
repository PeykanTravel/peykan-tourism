/**
 * User Repository Implementation
 * API-based implementation of UserRepository interface
 */

import { UserRepository, UserCreateData, UserUpdateData, UserSearchCriteria } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { apiClient } from '../api/ApiClient';

export class UserRepositoryImpl implements UserRepository {
  private readonly baseUrl = '/users';

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToUser(response.data);
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
  async findByUsername(username: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-username/${username}`);
      
      if (response.success && response.data) {
        return this.mapToUser(response.data);
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
  async findByEmail(email: string): Promise<User | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-email/${email}`);
      
      if (response.success && response.data) {
        return this.mapToUser(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find users by search criteria
   */
  async findByCriteria(criteria: UserSearchCriteria): Promise<{
    users: User[];
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
      if (criteria.is_active !== undefined) params.append('is_active', criteria.is_active.toString());
      if (criteria.is_verified !== undefined) params.append('is_verified', criteria.is_verified.toString());
      if (criteria.sort_by) params.append('sort_by', criteria.sort_by);
      if (criteria.sort_order) params.append('sort_order', criteria.sort_order);

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const users = response.data.results?.map((userData: any) => this.mapToUser(userData)) || [];
        
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
   * Create a new user
   */
  async create(data: UserCreateData): Promise<User> {
    try {
      const requestData = this.mapFromUserCreateData(data);
      
      const response = await apiClient.post(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToUser(response.data);
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
  async update(id: string, data: UserUpdateData): Promise<User> {
    try {
      const requestData = this.mapFromUserUpdateData(data);
      
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToUser(response.data);
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
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
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
      const response = await apiClient.get(`${this.baseUrl}/exists/username/${username}`);
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
      const response = await apiClient.get(`${this.baseUrl}/exists/email/${email}`);
      return response.success && response.data?.exists === true;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
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
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {}
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {}
      };
    }
  }

  /**
   * Map API response to User entity
   */
  private mapToUser(userData: any): User {
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone_number: userData.phone_number,
      is_active: userData.is_active,
      is_verified: userData.is_verified,
      role: userData.role,
      date_joined: userData.date_joined,
      last_login: userData.last_login,
      profile: userData.profile ? {
        date_of_birth: userData.profile.date_of_birth,
        nationality: userData.profile.nationality,
        passport_number: userData.profile.passport_number,
        address: userData.profile.address,
        city: userData.profile.city,
        country: userData.profile.country,
        postal_code: userData.profile.postal_code,
        emergency_contact: userData.profile.emergency_contact
      } : undefined
    };
  }

  /**
   * Map UserCreateData to API request format
   */
  private mapFromUserCreateData(data: UserCreateData): any {
    return {
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      role: data.role
    };
  }

  /**
   * Map UserUpdateData to API request format
   */
  private mapFromUserUpdateData(data: UserUpdateData): any {
    const updateData: any = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.is_verified !== undefined) updateData.is_verified = data.is_verified;

    return updateData;
  }
} 