export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new Error('Email must be a non-empty string');
    }

    const trimmedValue = value.trim().toLowerCase();
    
    if (trimmedValue.length === 0) {
      throw new Error('Email cannot be empty');
    }

    if (trimmedValue.length > 254) {
      throw new Error('Email cannot be longer than 254 characters');
    }

    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedValue)) {
      throw new Error('Invalid email format');
    }

    return new Email(trimmedValue);
  }

  get value(): string {
    return this._value;
  }

  get domain(): string {
    return this._value.split('@')[1];
  }

  get localPart(): string {
    return this._value.split('@')[0];
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
} 