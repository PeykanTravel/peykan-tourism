export class Quantity {
  private readonly _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  static create(value: number): Quantity {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Quantity must be a valid number');
    }

    if (value < 1) {
      throw new Error('Quantity must be at least 1');
    }

    if (value > 1000) {
      throw new Error('Quantity cannot exceed 1000');
    }

    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be a whole number');
    }

    return new Quantity(value);
  }

  get value(): number {
    return this._value;
  }

  add(other: Quantity): Quantity {
    return Quantity.create(this._value + other._value);
  }

  subtract(other: Quantity): Quantity {
    const result = this._value - other._value;
    if (result < 1) {
      throw new Error('Quantity cannot be less than 1');
    }
    return Quantity.create(result);
  }

  multiply(factor: number): Quantity {
    if (factor <= 0) {
      throw new Error('Multiplication factor must be positive');
    }
    return Quantity.create(Math.floor(this._value * factor));
  }

  divide(divisor: number): Quantity {
    if (divisor <= 0) {
      throw new Error('Division divisor must be positive');
    }
    return Quantity.create(Math.floor(this._value / divisor));
  }

  isZero(): boolean {
    return this._value === 0;
  }

  isPositive(): boolean {
    return this._value > 0;
  }

  equals(other: Quantity): boolean {
    return this._value === other._value;
  }

  greaterThan(other: Quantity): boolean {
    return this._value > other._value;
  }

  lessThan(other: Quantity): boolean {
    return this._value < other._value;
  }

  greaterThanOrEqual(other: Quantity): boolean {
    return this._value >= other._value;
  }

  lessThanOrEqual(other: Quantity): boolean {
    return this._value <= other._value;
  }

  toString(): string {
    return this._value.toString();
  }

  toJSON(): number {
    return this._value;
  }
} 