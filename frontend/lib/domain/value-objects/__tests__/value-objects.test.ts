/**
 * Value Objects Tests
 * Test all value objects for proper functionality
 */

import { Currency, USD, EUR, TRY, IRR } from '../Currency';
import { Language, FA, EN, TR } from '../Language';
import { Price } from '../Price';
import { DateRange } from '../DateRange';
import { Location } from '../Location';
import { ContactInfo } from '../ContactInfo';

describe('Currency Value Object', () => {
  test('should create valid currency', () => {
    const currency = Currency.create('USD');
    expect(currency.getCode()).toBe('USD');
    expect(currency.getName()).toBe('US Dollar');
    expect(currency.getSymbol()).toBe('$');
  });

  test('should throw error for invalid currency', () => {
    expect(() => Currency.create('INVALID')).toThrow('Unsupported currency: INVALID');
  });

  test('should format amount correctly', () => {
    expect(USD.formatAmount(1234.56)).toBe('$1,234.56');
    expect(IRR.formatAmount(420000)).toBe('ریال۴۲۰٬۰۰۰');
  });

  test('should check if currency is supported', () => {
    expect(Currency.isSupported('USD')).toBe(true);
    expect(Currency.isSupported('INVALID')).toBe(false);
  });
});

describe('Language Value Object', () => {
  test('should create valid language', () => {
    const language = Language.create('fa');
    expect(language.getCode()).toBe('fa');
    expect(language.getName()).toBe('Persian');
    expect(language.getNativeName()).toBe('فارسی');
    expect(language.isRTL()).toBe(true);
  });

  test('should throw error for invalid language', () => {
    expect(() => Language.create('INVALID')).toThrow('Unsupported language: INVALID');
  });

  test('should check if language is supported', () => {
    expect(Language.isSupported('fa')).toBe(true);
    expect(Language.isSupported('INVALID')).toBe(false);
  });

  test('should get correct direction', () => {
    expect(FA.isRTL()).toBe(true);
    expect(EN.isLTR()).toBe(true);
    expect(TR.isLTR()).toBe(true);
  });
});

describe('Price Value Object', () => {
  test('should create valid price', () => {
    const price = Price.create(100, USD);
    expect(price.getAmount()).toBe(100);
    expect(price.getCurrencyCode()).toBe('USD');
  });

  test('should throw error for negative price', () => {
    expect(() => Price.create(-100, USD)).toThrow('Price cannot be negative');
  });

  test('should add prices correctly', () => {
    const price1 = Price.create(100, USD);
    const price2 = Price.create(200, USD);
    const result = price1.add(price2);
    expect(result.getAmount()).toBe(300);
  });

  test('should throw error when adding different currencies', () => {
    const price1 = Price.create(100, USD);
    const price2 = Price.create(200, EUR);
    expect(() => price1.add(price2)).toThrow('Cannot add prices with different currencies');
  });

  test('should apply discount correctly', () => {
    const price = Price.create(100, USD);
    const discounted = price.applyDiscount(20);
    expect(discounted.getAmount()).toBe(80);
  });

  test('should format price correctly', () => {
    const price = Price.create(1234.56, USD);
    expect(price.format()).toBe('$1,234.56');
  });
});

describe('DateRange Value Object', () => {
  test('should create valid date range', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const range = DateRange.create(start, end);
    expect(range.getStartDate()).toEqual(start);
    expect(range.getEndDate()).toEqual(end);
  });

  test('should throw error for invalid date range', () => {
    const start = new Date('2024-01-31');
    const end = new Date('2024-01-01');
    expect(() => DateRange.create(start, end)).toThrow('Start date cannot be after end date');
  });

  test('should calculate duration correctly', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const range = DateRange.create(start, end);
    expect(range.getDurationInDays()).toBe(30);
  });

  test('should check if date is contained', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const range = DateRange.create(start, end);
    const middleDate = new Date('2024-01-15');
    expect(range.contains(middleDate)).toBe(true);
  });

  test('should create single day range', () => {
    const date = new Date('2024-01-15');
    const range = DateRange.singleDay(date);
    expect(range.getDurationInDays()).toBe(1);
  });
});

describe('Location Value Object', () => {
  test('should create location with coordinates', () => {
    const coordinates = { latitude: 41.0082, longitude: 28.9784 };
    const address = { city: 'Istanbul', country: 'Turkey' };
    const location = Location.createWithCoordinates(coordinates, address, 'Istanbul Airport');
    
    expect(location.getName()).toBe('Istanbul Airport');
    expect(location.getCity()).toBe('Istanbul');
    expect(location.getCountry()).toBe('Turkey');
    expect(location.hasCoordinates()).toBe(true);
  });

  test('should create location without coordinates', () => {
    const address = { city: 'Tehran', country: 'Iran' };
    const location = Location.createWithoutCoordinates(address, 'Tehran City');
    
    expect(location.getName()).toBe('Tehran City');
    expect(location.hasCoordinates()).toBe(false);
  });

  test('should throw error for invalid coordinates', () => {
    const coordinates = { latitude: 91, longitude: 0 }; // Invalid latitude
    const address = { city: 'Test', country: 'Test' };
    expect(() => Location.createWithCoordinates(coordinates, address, 'Test')).toThrow('Latitude must be between -90 and 90');
  });

  test('should calculate distance between locations', () => {
    const location1 = Location.createWithCoordinates(
      { latitude: 41.0082, longitude: 28.9784 },
      { city: 'Istanbul', country: 'Turkey' },
      'Istanbul'
    );
    
    const location2 = Location.createWithCoordinates(
      { latitude: 35.6892, longitude: 51.3890 },
      { city: 'Tehran', country: 'Iran' },
      'Tehran'
    );
    
    const distance = location1.distanceTo(location2);
    expect(distance).toBeGreaterThan(0);
  });

  test('should check if locations are in same city', () => {
    const location1 = Location.createWithoutCoordinates(
      { city: 'Istanbul', country: 'Turkey' },
      'Location 1'
    );
    
    const location2 = Location.createWithoutCoordinates(
      { city: 'Istanbul', country: 'Turkey' },
      'Location 2'
    );
    
    expect(location1.isSameCity(location2)).toBe(true);
  });
});

describe('ContactInfo Value Object', () => {
  test('should create valid contact info', () => {
    const contact = ContactInfo.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, Country'
    });
    
    expect(contact.getName()).toBe('John Doe');
    expect(contact.getEmail()).toBe('john@example.com');
    expect(contact.getPhone()).toBe('+1234567890');
    expect(contact.getAddress()).toBe('123 Main St, City, Country');
  });

  test('should create minimal contact info', () => {
    const contact = ContactInfo.createMinimal('John Doe', 'john@example.com');
    expect(contact.getName()).toBe('John Doe');
    expect(contact.getEmail()).toBe('john@example.com');
    expect(contact.hasPhone()).toBe(false);
    expect(contact.hasAddress()).toBe(false);
  });

  test('should throw error for invalid email', () => {
    expect(() => ContactInfo.createMinimal('John Doe', 'invalid-email')).toThrow('Invalid email format');
  });

  test('should throw error for invalid phone', () => {
    expect(() => ContactInfo.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: 'invalid-phone'
    })).toThrow('Invalid phone number format');
  });

  test('should get first and last name', () => {
    const contact = ContactInfo.createMinimal('John Doe', 'john@example.com');
    expect(contact.getFirstName()).toBe('John');
    expect(contact.getLastName()).toBe('Doe');
  });

  test('should format phone number', () => {
    const contact = ContactInfo.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890'
    });
    
    expect(contact.formatPhone()).toBe('(123) 456-7890');
  });

  test('should check if contact info is complete', () => {
    const incomplete = ContactInfo.createMinimal('John Doe', 'john@example.com');
    expect(incomplete.isComplete()).toBe(false);
    
    const complete = ContactInfo.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St'
    });
    expect(complete.isComplete()).toBe(true);
  });
}); 