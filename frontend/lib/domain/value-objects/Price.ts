/**
 * Price Value Object
 * Represents a monetary amount with currency
 */

import { Currency, CurrencyCode } from './Currency';

export class Price {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {
    this.validate();
  }

  /**
   * Create a new Price instance
   */
  static create(amount: number, currency: Currency | string): Price {
    const currencyObj = typeof currency === 'string' ? Currency.create(currency) : currency;
    return new Price(amount, currencyObj);
  }

  /**
   * Create a zero price in the specified currency
   */
  static zero(currency: Currency | string): Price {
    return this.create(0, currency);
  }

  /**
   * Validate price constraints
   */
  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Price cannot be negative');
    }

    if (!Number.isFinite(this.amount)) {
      throw new Error('Price must be a finite number');
    }

    const decimalPlaces = this.currency.getDecimalPlaces();
    const roundedAmount = Math.round(this.amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    
    if (Math.abs(this.amount - roundedAmount) > 0.000001) {
      throw new Error(`Price cannot have more than ${decimalPlaces} decimal places for ${this.currency.getCode()}`);
    }
  }

  /**
   * Get amount
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Get currency
   */
  getCurrency(): Currency {
    return this.currency;
  }

  /**
   * Get currency code
   */
  getCurrencyCode(): CurrencyCode {
    return this.currency.getCode();
  }

  /**
   * Add another price to this price
   */
  add(other: Price): Price {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot add prices with different currencies');
    }

    return Price.create(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another price from this price
   */
  subtract(other: Price): Price {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot subtract prices with different currencies');
    }

    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }

    return Price.create(result, this.currency);
  }

  /**
   * Multiply price by a factor
   */
  multiply(factor: number): Price {
    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative');
    }

    return Price.create(this.amount * factor, this.currency);
  }

  /**
   * Apply percentage discount
   */
  applyDiscount(percentage: number): Price {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    const discountAmount = this.amount * (percentage / 100);
    return Price.create(this.amount - discountAmount, this.currency);
  }

  /**
   * Apply percentage markup
   */
  applyMarkup(percentage: number): Price {
    if (percentage < 0) {
      throw new Error('Markup percentage cannot be negative');
    }

    const markupAmount = this.amount * (percentage / 100);
    return Price.create(this.amount + markupAmount, this.currency);
  }

  /**
   * Check if price is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Check if price is greater than another
   */
  isGreaterThan(other: Price): boolean {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot compare prices with different currencies');
    }

    return this.amount > other.amount;
  }

  /**
   * Check if price is less than another
   */
  isLessThan(other: Price): boolean {
    if (!this.currency.equals(other.currency)) {
      throw new Error('Cannot compare prices with different currencies');
    }

    return this.amount < other.amount;
  }

  /**
   * Convert price to another currency
   * Note: This is a simplified conversion - in real app, use exchange rate service
   */
  convertTo(targetCurrency: Currency): Price {
    if (this.currency.equals(targetCurrency)) {
      return this;
    }

    // Simplified conversion rates (in real app, fetch from API)
    const rates: Record<string, number> = {
      'USD': 1,
      'EUR': 0.85,
      'TRY': 8.5,
      'IRR': 420000
    };

    const fromRate = rates[this.currency.getCode()] || 1;
    const toRate = rates[targetCurrency.getCode()] || 1;
    const convertedAmount = (this.amount / fromRate) * toRate;

    return Price.create(convertedAmount, targetCurrency);
  }

  /**
   * Check if price equals another
   */
  equals(other: Price): boolean {
    if (!this.currency.equals(other.currency)) {
      return false;
    }

    return Math.abs(this.amount - other.amount) < 0.000001;
  }

  /**
   * Format price for display
   */
  format(): string {
    return this.currency.formatAmount(this.amount);
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
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency.getCode()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: { amount: number; currency: string }): Price {
    return Price.create(json.amount, json.currency);
  }
} 