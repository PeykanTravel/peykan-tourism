// Domain Entity - User
export interface User {
  id: string;
  email: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  is_active: boolean;
  is_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  profile_picture?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: 'en' | 'fa' | 'tr';
  currency: 'USD' | 'EUR' | 'TRY';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Value Objects
export class Email {
  constructor(public readonly value: string) {
    if (!this.isValid()) {
      throw new Error('Invalid email format');
    }
  }

  private isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.value);
  }
}

export class PhoneNumber {
  constructor(public readonly value: string) {
    if (!this.isValid()) {
      throw new Error('Invalid phone number format');
    }
  }

  private isValid(): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(this.value);
  }
} 