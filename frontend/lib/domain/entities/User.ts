/**
 * User Entity
 * Simplified user model for the domain layer
 */

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  role: UserRole;
  date_joined: string;
  last_login?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  date_of_birth?: string;
  nationality?: string;
  passport_number?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export type UserRole = 'guest' | 'customer' | 'agent' | 'admin';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
  message?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetData {
  token: string;
  new_password: string;
  confirm_password: string;
} 