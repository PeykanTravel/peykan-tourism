/**
 * ContactInfo Value Object
 * Represents contact information with validation and business rules
 */

export interface ContactInfoData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export class ContactInfo {
  private constructor(
    private readonly name: string,
    private readonly email: string,
    private readonly phone: string | null,
    private readonly address: string | null
  ) {
    this.validate();
  }

  /**
   * Create a new ContactInfo instance
   */
  static create(data: ContactInfoData): ContactInfo {
    return new ContactInfo(
      data.name,
      data.email,
      data.phone || null,
      data.address || null
    );
  }

  /**
   * Create minimal contact info with name and email
   */
  static createMinimal(name: string, email: string): ContactInfo {
    return new ContactInfo(name, email, null, null);
  }

  /**
   * Validate contact info constraints
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Name is required');
    }

    if (this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    // Email is required for regular users, but can be empty for guest users
    if (this.email && this.email.trim().length > 0 && !this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }

    if (this.phone && !this.isValidPhone(this.phone)) {
      throw new Error('Invalid phone number format');
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    // Basic phone validation - allows international format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Get name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get email
   */
  getEmail(): string {
    return this.email;
  }

  /**
   * Get phone
   */
  getPhone(): string | null {
    return this.phone;
  }

  /**
   * Get address
   */
  getAddress(): string | null {
    return this.address;
  }

  /**
   * Check if contact has phone
   */
  hasPhone(): boolean {
    return this.phone !== null;
  }

  /**
   * Check if contact has address
   */
  hasAddress(): boolean {
    return this.address !== null;
  }

  /**
   * Get full name (first and last name)
   */
  getFullName(): string {
    return this.name.trim();
  }

  /**
   * Get first name
   */
  getFirstName(): string {
    const parts = this.name.trim().split(' ');
    return parts[0] || '';
  }

  /**
   * Get last name
   */
  getLastName(): string {
    const parts = this.name.trim().split(' ');
    return parts.slice(1).join(' ') || '';
  }

  /**
   * Get email domain
   */
  getEmailDomain(): string {
    const parts = this.email.split('@');
    return parts.length > 1 ? parts[1] : '';
  }

  /**
   * Format phone number for display
   */
  formatPhone(): string | null {
    if (!this.phone) {
      return null;
    }

    // Remove all non-digit characters
    const digits = this.phone.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 10) {
      return `+${digits}`;
    }
    
    return this.phone;
  }

  /**
   * Check if contact info is complete
   */
  isComplete(): boolean {
    return this.hasPhone() && this.hasAddress();
  }

  /**
   * Check if this contact info equals another
   */
  equals(other: ContactInfo): boolean {
    return this.email.toLowerCase() === other.email.toLowerCase();
  }

  /**
   * Format contact info for display
   */
  format(): string {
    const parts: string[] = [this.name, this.email];
    
    if (this.phone) {
      parts.push(this.formatPhone() || this.phone);
    }
    
    if (this.address) {
      parts.push(this.address);
    }
    
    return parts.join(' | ');
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.format();
  }

  /**
   * Convert to JSON
   */
  toJSON(): ContactInfoData {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone || undefined,
      address: this.address || undefined
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: ContactInfoData): ContactInfo {
    return ContactInfo.create(json);
  }

  /**
   * Create a copy with updated fields
   */
  withUpdates(updates: Partial<ContactInfoData>): ContactInfo {
    return ContactInfo.create({
      name: updates.name ?? this.name,
      email: updates.email ?? this.email,
      phone: updates.phone ?? this.phone ?? undefined,
      address: updates.address ?? this.address ?? undefined
    });
  }
} 