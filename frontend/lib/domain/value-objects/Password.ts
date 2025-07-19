export class Password {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Password {
    if (!value || typeof value !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (value.length > 128) {
      throw new Error('Password cannot be longer than 128 characters');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(value)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(value)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check for at least one digit
    if (!/\d/.test(value)) {
      throw new Error('Password must contain at least one digit');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      throw new Error('Password must contain at least one special character');
    }

    return new Password(value);
  }

  static createFromHash(hash: string): Password {
    if (!hash || typeof hash !== 'string') {
      throw new Error('Password hash must be a non-empty string');
    }

    return new Password(hash);
  }

  get value(): string {
    return this._value;
  }

  get length(): number {
    return this._value.length;
  }

  get strength(): 'weak' | 'medium' | 'strong' {
    let score = 0;

    // Length score
    if (this._value.length >= 12) score += 2;
    else if (this._value.length >= 8) score += 1;

    // Character variety score
    if (/[A-Z]/.test(this._value)) score += 1;
    if (/[a-z]/.test(this._value)) score += 1;
    if (/\d/.test(this._value)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this._value)) score += 1;

    // Repetition penalty
    const uniqueChars = new Set(this._value).size;
    if (uniqueChars < this._value.length * 0.6) score -= 1;

    if (score >= 5) return 'strong';
    if (score >= 3) return 'medium';
    return 'weak';
  }

  equals(other: Password): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return '[PASSWORD]'; // Don't expose password in logs
  }

  toJSON(): string {
    return '[PASSWORD]'; // Don't expose password in JSON
  }
} 