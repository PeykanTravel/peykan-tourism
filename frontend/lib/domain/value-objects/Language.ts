/**
 * Language Value Object
 * Represents a language with validation and business rules
 */

export enum LanguageCode {
  FA = 'fa',
  EN = 'en',
  TR = 'tr'
}

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  locale: string;
}

export class Language {
  private static readonly SUPPORTED_LANGUAGES: Record<LanguageCode, LanguageInfo> = {
    [LanguageCode.FA]: {
      code: LanguageCode.FA,
      name: 'Persian',
      nativeName: 'فارسی',
      direction: 'rtl',
      locale: 'fa-IR'
    },
    [LanguageCode.EN]: {
      code: LanguageCode.EN,
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      locale: 'en-US'
    },
    [LanguageCode.TR]: {
      code: LanguageCode.TR,
      name: 'Turkish',
      nativeName: 'Türkçe',
      direction: 'ltr',
      locale: 'tr-TR'
    }
  };

  private constructor(private readonly code: LanguageCode) {}

  /**
   * Create a new Language instance
   */
  static create(code: string): Language {
    const languageCode = code.toLowerCase() as LanguageCode;
    
    if (!this.isSupported(languageCode)) {
      throw new Error(`Unsupported language: ${code}`);
    }

    return new Language(languageCode);
  }

  /**
   * Check if language is supported
   */
  static isSupported(code: string): boolean {
    return Object.values(LanguageCode).includes(code.toLowerCase() as LanguageCode);
  }

  /**
   * Get all supported languages
   */
  static getAllSupported(): LanguageInfo[] {
    return Object.values(this.SUPPORTED_LANGUAGES);
  }

  /**
   * Get default language
   */
  static getDefault(): Language {
    return new Language(LanguageCode.FA);
  }

  /**
   * Get language code
   */
  getCode(): LanguageCode {
    return this.code;
  }

  /**
   * Get language info
   */
  getInfo(): LanguageInfo {
    return Language.SUPPORTED_LANGUAGES[this.code];
  }

  /**
   * Get language name
   */
  getName(): string {
    return this.getInfo().name;
  }

  /**
   * Get native name
   */
  getNativeName(): string {
    return this.getInfo().nativeName;
  }

  /**
   * Get text direction
   */
  getDirection(): 'ltr' | 'rtl' {
    return this.getInfo().direction;
  }

  /**
   * Get locale
   */
  getLocale(): string {
    return this.getInfo().locale;
  }

  /**
   * Check if language is RTL
   */
  isRTL(): boolean {
    return this.getDirection() === 'rtl';
  }

  /**
   * Check if language is LTR
   */
  isLTR(): boolean {
    return this.getDirection() === 'ltr';
  }

  /**
   * Check if this language equals another
   */
  equals(other: Language): boolean {
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
  toJSON(): LanguageCode {
    return this.code;
  }
}

// Export commonly used languages as constants
export const FA = Language.create(LanguageCode.FA);
export const EN = Language.create(LanguageCode.EN);
export const TR = Language.create(LanguageCode.TR); 