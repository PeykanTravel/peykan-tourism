/**
 * User Entity
 * Represents a user in the system with domain logic and business rules
 */

import { ContactInfo } from '../value-objects/ContactInfo';
import { Language } from '../value-objects/Language';
import { Currency } from '../value-objects/Currency';

export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  nationality?: string;
  avatar?: string;
}

export interface UserPreferences {
  language: Language;
  currency: Currency;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export class User {
  private constructor(
    private readonly id: string,
    private readonly username: string,
    private readonly email: string,
    private readonly role: UserRole,
    private readonly profile: UserProfile,
    private readonly preferences: UserPreferences,
    private readonly contactInfo: ContactInfo,
    private readonly isActive: boolean,
    private readonly isEmailVerified: boolean,
    private readonly isPhoneVerified: boolean,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly lastLoginAt?: Date
  ) {
    this.validate();
  }

  /**
   * Create a new User instance
   */
  static create(
    id: string,
    username: string,
    email: string,
    role: UserRole = UserRole.CUSTOMER,
    profile: UserProfile,
    preferences?: UserPreferences
  ): User {
    const contactInfo = ContactInfo.createMinimal(
      `${profile.firstName} ${profile.lastName}`,
      email
    );

    const defaultPreferences: UserPreferences = {
      language: Language.getDefault(),
      currency: Currency.getDefault(),
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };

    return new User(
      id,
      username,
      email,
      role,
      profile,
      preferences || defaultPreferences,
      contactInfo,
      true,
      false,
      false,
      new Date(),
      new Date()
    );
  }

  /**
   * Create a guest user
   */
  static createGuest(): User {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a minimal user without email for guest
    const user = new User(
      guestId,
      guestId,
      '',
      UserRole.GUEST,
      {
        firstName: 'Guest',
        lastName: 'User'
      },
      {
        language: Language.getDefault(),
        currency: Currency.getDefault(),
        notifications: {
          email: false,
          sms: false,
          push: false
        }
      },
      ContactInfo.createMinimal('Guest User', ''),
      true,
      false,
      false,
      new Date(),
      new Date()
    );

    return user;
  }

  /**
   * Validate user constraints
   */
  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    if (!this.username || this.username.trim().length === 0) {
      throw new Error('Username is required');
    }

    // Email is required for regular users, but can be empty for guest users
    if (!this.isGuest() && (!this.email || this.email.trim().length === 0)) {
      throw new Error('Email is required');
    }

    if (!this.profile.firstName || this.profile.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    if (!this.profile.lastName || this.profile.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }

    if (this.profile.dateOfBirth && this.profile.dateOfBirth > new Date()) {
      throw new Error('Date of birth cannot be in the future');
    }
  }

  /**
   * Get user ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get username
   */
  getUsername(): string {
    return this.username;
  }

  /**
   * Get email
   */
  getEmail(): string {
    return this.email;
  }

  /**
   * Get role
   */
  getRole(): UserRole {
    return this.role;
  }

  /**
   * Get profile
   */
  getProfile(): UserProfile {
    return { ...this.profile };
  }

  /**
   * Get preferences
   */
  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Get contact info
   */
  getContactInfo(): ContactInfo {
    return this.contactInfo;
  }

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }

  /**
   * Get first name
   */
  getFirstName(): string {
    return this.profile.firstName;
  }

  /**
   * Get last name
   */
  getLastName(): string {
    return this.profile.lastName;
  }

  /**
   * Check if user is active
   */
  isUserActive(): boolean {
    return this.isActive;
  }

  /**
   * Check if email is verified
   */
  isEmailVerifiedUser(): boolean {
    return this.isEmailVerified;
  }

  /**
   * Check if phone is verified
   */
  isPhoneVerifiedUser(): boolean {
    return this.isPhoneVerified;
  }

  /**
   * Check if user is guest
   */
  isGuest(): boolean {
    return this.role === UserRole.GUEST;
  }

  /**
   * Check if user is customer
   */
  isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER;
  }

  /**
   * Check if user is agent
   */
  isAgent(): boolean {
    return this.role === UserRole.AGENT;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user can access admin panel
   */
  canAccessAdminPanel(): boolean {
    return this.isAdmin() || this.isAgent();
  }

  /**
   * Check if user can book products
   */
  canBookProducts(): boolean {
    return this.isCustomer() || this.isAgent();
  }

  /**
   * Check if user can manage other users
   */
  canManageUsers(): boolean {
    return this.isAdmin();
  }

  /**
   * Check if user can manage products
   */
  canManageProducts(): boolean {
    return this.isAdmin() || this.isAgent();
  }

  /**
   * Update profile
   */
  updateProfile(profile: Partial<UserProfile>): User {
    const updatedProfile = { ...this.profile, ...profile };
    
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      updatedProfile,
      this.preferences,
      this.contactInfo,
      this.isActive,
      this.isEmailVerified,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): User {
    const updatedPreferences = { ...this.preferences, ...preferences };
    
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      updatedPreferences,
      this.contactInfo,
      this.isActive,
      this.isEmailVerified,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Update contact info
   */
  updateContactInfo(contactInfo: ContactInfo): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      this.preferences,
      contactInfo,
      this.isActive,
      this.isEmailVerified,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Mark email as verified
   */
  markEmailAsVerified(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      this.preferences,
      this.contactInfo,
      this.isActive,
      true,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Mark phone as verified
   */
  markPhoneAsVerified(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      this.preferences,
      this.contactInfo,
      this.isActive,
      this.isEmailVerified,
      true,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Activate user
   */
  activate(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      this.preferences,
      this.contactInfo,
      true,
      this.isEmailVerified,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Deactivate user
   */
  deactivate(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      this.preferences,
      this.contactInfo,
      false,
      this.isEmailVerified,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      this.lastLoginAt
    );
  }

  /**
   * Update last login
   */
  updateLastLogin(): User {
    return new User(
      this.id,
      this.username,
      this.email,
      this.role,
      this.profile,
      this.preferences,
      this.contactInfo,
      this.isActive,
      this.isEmailVerified,
      this.isPhoneVerified,
      this.createdAt,
      new Date(),
      new Date()
    );
  }

  /**
   * Get age
   */
  getAge(): number | null {
    if (!this.profile.dateOfBirth) {
      return null;
    }

    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    return this.isEmailVerified && this.isPhoneVerified;
  }

  /**
   * Check if user equals another
   */
  equals(other: User): boolean {
    return this.id === other.id;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `User(${this.id}, ${this.getFullName()}, ${this.role})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      profile: this.profile,
      preferences: this.preferences,
      contactInfo: this.contactInfo.toJSON(),
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      isPhoneVerified: this.isPhoneVerified,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): User {
    const user = new User(
      json.id,
      json.username,
      json.email,
      json.role,
      json.profile,
      json.preferences,
      ContactInfo.fromJSON(json.contactInfo),
      json.isActive,
      json.isEmailVerified,
      json.isPhoneVerified,
      new Date(json.createdAt),
      new Date(json.updatedAt),
      json.lastLoginAt ? new Date(json.lastLoginAt) : undefined
    );

    return user;
  }
} 