/**
 * Currency Value Object
 * Represents a currency with validation and business rules
 */

export enum CurrencyCode {
  USD = 'USD',
  EUR = 'EUR',
  TRY = 'TRY',
  IRR = 'IRR'
}

export interface CurrencyInfo {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  decimalPlaces: number;
}

export class Currency {
  private static readonly SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
    [CurrencyCode.USD]: {
      code: CurrencyCode.USD,
      name: 'US Dollar',
      symbol: '$',
      locale: 'en-US',
      decimalPlaces: 2
    },
    [CurrencyCode.EUR]: {
      code: CurrencyCode.EUR,
      name: 'Euro',
      symbol: '€',
      locale: 'de-DE',
      decimalPlaces: 2
    },
    [CurrencyCode.TRY]: {
      code: CurrencyCode.TRY,
      name: 'Turkish Lira',
      symbol: '₺',
      locale: 'tr-TR',
      decimalPlaces: 2
    },
    [CurrencyCode.IRR]: {
      code: CurrencyCode.IRR,
      name: 'Iranian Rial',
      symbol: 'ریال',
      locale: 'fa-IR',
      decimalPlaces: 0
    }
  };

  private constructor(private readonly code: CurrencyCode) {}

  /**
   * Create a new Currency instance
   */
  static create(code: string): Currency {
    const currencyCode = code.toUpperCase() as CurrencyCode;
    
    if (!this.isSupported(currencyCode)) {
      throw new Error(`Unsupported currency: ${code}`);
    }

    return new Currency(currencyCode);
  }

  /**
   * Check if currency is supported
   */
  static isSupported(code: string): boolean {
    return Object.values(CurrencyCode).includes(code.toUpperCase() as CurrencyCode);
  }

  /**
   * Get all supported currencies
   */
  static getAllSupported(): CurrencyInfo[] {
    return Object.values(this.SUPPORTED_CURRENCIES);
  }

  /**
   * Get default currency
   */
  static getDefault(): Currency {
    return new Currency(CurrencyCode.USD);
  }

  /**
   * Get currency code
   */
  getCode(): CurrencyCode {
    return this.code;
  }

  /**
   * Get currency info
   */
  getInfo(): CurrencyInfo {
    return Currency.SUPPORTED_CURRENCIES[this.code];
  }

  /**
   * Get currency name
   */
  getName(): string {
    return this.getInfo().name;
  }

  /**
   * Get currency symbol
   */
  getSymbol(): string {
    return this.getInfo().symbol;
  }

  /**
   * Get locale for formatting
   */
  getLocale(): string {
    return this.getInfo().locale;
  }

  /**
   * Get decimal places for this currency
   */
  getDecimalPlaces(): number {
    return this.getInfo().decimalPlaces;
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number): string {
    const { symbol, locale, decimalPlaces } = this.getInfo();
    
    if (this.code === CurrencyCode.IRR) {
      // Special formatting for Iranian Rial
      return `${symbol}${amount.toLocaleString('fa-IR')}`;
    }

    const formattedAmount = amount.toLocaleString(locale, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });

    return `${symbol}${formattedAmount}`;
  }

  /**
   * Check if this currency equals another
   */
  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.code;
  }

  /**
   * Convert to JSON
   */
  toJSON(): CurrencyCode {
    return this.code;
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: CurrencyCode | string): Currency {
    return Currency.create(json);
  }
}

// Export commonly used currencies as constants
export const USD = Currency.create(CurrencyCode.USD);
export const EUR = Currency.create(CurrencyCode.EUR);
export const TRY = Currency.create(CurrencyCode.TRY);
export const IRR = Currency.create(CurrencyCode.IRR); 