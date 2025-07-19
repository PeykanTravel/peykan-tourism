/**
 * User Aggregate
 * Groups User entity with related value objects and enforces business rules
 */

import { User, UserRole } from '../entities/User';
import { ContactInfo } from '../value-objects/ContactInfo';
import { Language } from '../value-objects/Language';
import { Currency } from '../value-objects/Currency';

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

export class UserAggregate {
  private constructor(
    private readonly user: User,
    private readonly profile: UserProfile,
    private readonly preferences: UserPreferences,
    private readonly contactInfo: ContactInfo
  ) {
    this.validate();
  }

  /**
   * Create a new UserAggregate instance
   */
  static create(
    id: string,
    username: string,
    email: string,
    role: UserRole = UserRole.CUSTOMER,
    profile: UserProfile,
    preferences?: UserPreferences
  ): UserAggregate {
    const contactInfo = ContactInfo.create({
      name: `${profile.firstName} ${profile.lastName}`,
      email
    });

    const defaultPreferences: UserPreferences = {
      language: Language.getDefault(),
      currency: Currency.getDefault(),
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };

    const user = User.create(
      id,
      username,
      email,
      role,
      profile,
      preferences || defaultPreferences
    );

    return new UserAggregate(
      user,
      profile,
      preferences || defaultPreferences,
      contactInfo
    );
  }

  /**
   * Create a guest user aggregate
   */
  static createGuest(): UserAggregate {
    const user = User.createGuest();
    const profile: UserProfile = {
      firstName: 'Guest',
      lastName: 'User'
    };
    const preferences: UserPreferences = {
      language: Language.getDefault(),
      currency: Currency.getDefault(),
      notifications: {
        email: false,
        sms: false,
        push: false
      }
    };
    const contactInfo = ContactInfo.createMinimal('Guest User', '');

    return new UserAggregate(user, profile, preferences, contactInfo);
  }

  /**
   * Validate aggregate constraints
   */
  private validate(): void {
    // Ensure user and contact info are consistent
    if (this.user.getFullName() !== this.contactInfo.getName()) {
      throw new Error('User name and contact info name must be consistent');
    }

    // Ensure user email and contact info email are consistent
    if (this.user.getEmail() !== this.contactInfo.getEmail()) {
      throw new Error('User email and contact info email must be consistent');
    }

    // Ensure profile and user profile are consistent
    if (this.user.getFirstName() !== this.profile.firstName) {
      throw new Error('User first name and profile first name must be consistent');
    }

    if (this.user.getLastName() !== this.profile.lastName) {
      throw new Error('User last name and profile last name must be consistent');
    }

    // Ensure preferences and user preferences are consistent
    if (!this.user.getPreferences().language.equals(this.preferences.language)) {
      throw new Error('User language and preferences language must be consistent');
    }

    if (!this.user.getPreferences().currency.equals(this.preferences.currency)) {
      throw new Error('User currency and preferences currency must be consistent');
    }
  }

  /**
   * Get user entity
   */
  getUser(): User {
    return this.user;
  }

  /**
   * Get user ID
   */
  getId(): string {
    return this.user.getId();
  }

  /**
   * Get username
   */
  getUsername(): string {
    return this.user.getUsername();
  }

  /**
   * Get email
   */
  getEmail(): string {
    return this.user.getEmail();
  }

  /**
   * Get role
   */
  getRole(): UserRole {
    return this.user.getRole();
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
    return this.user.getFullName();
  }

  /**
   * Check if user is active
   */
  isActive(): boolean {
    return this.user.isUserActive();
  }

  /**
   * Check if user is verified
   */
  isVerified(): boolean {
    return this.user.isVerified();
  }

  /**
   * Check if user is guest
   */
  isGuest(): boolean {
    return this.user.isGuest();
  }

  /**
   * Check if user is customer
   */
  isCustomer(): boolean {
    return this.user.isCustomer();
  }

  /**
   * Check if user is agent
   */
  isAgent(): boolean {
    return this.user.isAgent();
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.user.isAdmin();
  }

  /**
   * Check if user can access admin panel
   */
  canAccessAdminPanel(): boolean {
    return this.user.canAccessAdminPanel();
  }

  /**
   * Check if user can book products
   */
  canBookProducts(): boolean {
    return this.user.canBookProducts();
  }

  /**
   * Check if user can manage users
   */
  canManageUsers(): boolean {
    return this.user.canManageUsers();
  }

  /**
   * Check if user can manage products
   */
  canManageProducts(): boolean {
    return this.user.canManageProducts();
  }

  /**
   * Update profile
   */
  updateProfile(profile: Partial<UserProfile>): UserAggregate {
    const updatedProfile = { ...this.profile, ...profile };
    const updatedUser = this.user.updateProfile(updatedProfile);
    
    const updatedContactInfo = ContactInfo.create({
      name: `${updatedProfile.firstName} ${updatedProfile.lastName}`,
      email: this.user.getEmail(),
      phone: this.contactInfo.getPhone(),
      address: this.contactInfo.getAddress()
    });

    return new UserAggregate(
      updatedUser,
      updatedProfile,
      this.preferences,
      updatedContactInfo
    );
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): UserAggregate {
    const updatedPreferences = { ...this.preferences, ...preferences };
    const updatedUser = this.user.updatePreferences(updatedPreferences);

    return new UserAggregate(
      updatedUser,
      this.profile,
      updatedPreferences,
      this.contactInfo
    );
  }

  /**
   * Update contact info
   */
  updateContactInfo(contactInfo: ContactInfo): UserAggregate {
    const updatedUser = this.user.updateContactInfo(contactInfo);

    return new UserAggregate(
      updatedUser,
      this.profile,
      this.preferences,
      contactInfo
    );
  }

  /**
   * Mark email as verified
   */
  markEmailAsVerified(): UserAggregate {
    const updatedUser = this.user.markEmailAsVerified();

    return new UserAggregate(
      updatedUser,
      this.profile,
      this.preferences,
      this.contactInfo
    );
  }

  /**
   * Mark phone as verified
   */
  markPhoneAsVerified(): UserAggregate {
    const updatedUser = this.user.markPhoneAsVerified();

    return new UserAggregate(
      updatedUser,
      this.profile,
      this.preferences,
      this.contactInfo
    );
  }

  /**
   * Activate user
   */
  activate(): UserAggregate {
    const updatedUser = this.user.activate();

    return new UserAggregate(
      updatedUser,
      this.profile,
      this.preferences,
      this.contactInfo
    );
  }

  /**
   * Deactivate user
   */
  deactivate(): UserAggregate {
    const updatedUser = this.user.deactivate();

    return new UserAggregate(
      updatedUser,
      this.profile,
      this.preferences,
      this.contactInfo
    );
  }

  /**
   * Update last login
   */
  updateLastLogin(): UserAggregate {
    const updatedUser = this.user.updateLastLogin();

    return new UserAggregate(
      updatedUser,
      this.profile,
      this.preferences,
      this.contactInfo
    );
  }

  /**
   * Get age
   */
  getAge(): number | null {
    return this.user.getAge();
  }

  /**
   * Check if aggregate equals another
   */
  equals(other: UserAggregate): boolean {
    return this.user.equals(other.user);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `UserAggregate(${this.user.toString()})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      user: this.user.toJSON(),
      profile: this.profile,
      preferences: {
        language: this.preferences.language.toJSON(),
        currency: this.preferences.currency.toJSON(),
        notifications: this.preferences.notifications
      },
      contactInfo: this.contactInfo.toJSON()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): UserAggregate {
    const user = User.fromJSON(json.user);
    const profile = json.profile;
    const preferences: UserPreferences = {
      language: Language.fromJSON(json.preferences.language),
      currency: Currency.fromJSON(json.preferences.currency),
      notifications: json.preferences.notifications
    };
    const contactInfo = ContactInfo.fromJSON(json.contactInfo);

    return new UserAggregate(user, profile, preferences, contactInfo);
  }
} 