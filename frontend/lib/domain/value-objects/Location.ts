/**
 * Location Value Object
 * Represents a geographical location with validation and business rules
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export class Location {
  private constructor(
    private readonly coordinates: Coordinates | null,
    private readonly address: Address,
    private readonly name: string
  ) {
    this.validate();
  }

  /**
   * Create a new Location instance with coordinates
   */
  static create(
    name: string,
    street: string,
    city: string,
    country: string,
    latitude: number,
    longitude: number
  ): Location {
    const coordinates: Coordinates = { latitude, longitude };
    const address: Address = {
      street,
      city,
      country
    };
    return new Location(coordinates, address, name);
  }

  /**
   * Create a new Location instance with coordinates
   */
  static createWithCoordinates(
    coordinates: Coordinates,
    address: Address,
    name: string
  ): Location {
    return new Location(coordinates, address, name);
  }

  /**
   * Create a new Location instance without coordinates
   */
  static createWithoutCoordinates(
    address: Address,
    name: string
  ): Location {
    return new Location(null, address, name);
  }

  /**
   * Create a location from address string
   */
  static fromAddressString(
    addressString: string,
    name: string
  ): Location {
    const address = this.parseAddressString(addressString);
    return new Location(null, address, name);
  }

  /**
   * Parse address string into Address object
   */
  private static parseAddressString(addressString: string): Address {
    const parts = addressString.split(',').map(part => part.trim());
    
    if (parts.length < 2) {
      throw new Error('Address must contain at least city and country');
    }

    const country = parts[parts.length - 1];
    const city = parts[parts.length - 2];
    const state = parts.length > 2 ? parts[parts.length - 3] : undefined;
    const street = parts.length > 3 ? parts.slice(0, -3).join(', ') : undefined;

    return {
      street,
      city,
      state,
      country,
      postalCode: undefined
    };
  }

  /**
   * Validate location constraints
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Location name is required');
    }

    if (!this.address.city || this.address.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (!this.address.country || this.address.country.trim().length === 0) {
      throw new Error('Country is required');
    }

    if (this.coordinates) {
      if (this.coordinates.latitude < -90 || this.coordinates.latitude > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }

      if (this.coordinates.longitude < -180 || this.coordinates.longitude > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
    }
  }

  /**
   * Get coordinates
   */
  getCoordinates(): Coordinates | null {
    return this.coordinates ? { ...this.coordinates } : null;
  }

  /**
   * Get address
   */
  getAddress(): Address {
    return { ...this.address };
  }

  /**
   * Get name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get city
   */
  getCity(): string {
    return this.address.city;
  }

  /**
   * Get country
   */
  getCountry(): string {
    return this.address.country;
  }

  /**
   * Check if location has coordinates
   */
  hasCoordinates(): boolean {
    return this.coordinates !== null;
  }

  /**
   * Calculate distance to another location (Haversine formula)
   */
  distanceTo(other: Location): number | null {
    if (!this.coordinates || !other.coordinates) {
      return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(other.coordinates.latitude - this.coordinates.latitude);
    const dLon = this.deg2rad(other.coordinates.longitude - this.coordinates.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(this.coordinates.latitude)) * 
      Math.cos(this.deg2rad(other.coordinates.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Check if location is in the same city
   */
  isSameCity(other: Location): boolean {
    return this.address.city.toLowerCase() === other.address.city.toLowerCase() &&
           this.address.country.toLowerCase() === other.address.country.toLowerCase();
  }

  /**
   * Check if location is in the same country
   */
  isSameCountry(other: Location): boolean {
    return this.address.country.toLowerCase() === other.address.country.toLowerCase();
  }

  /**
   * Format address for display
   */
  formatAddress(): string {
    const parts: string[] = [];

    if (this.address.street) {
      parts.push(this.address.street);
    }

    parts.push(this.address.city);

    if (this.address.state) {
      parts.push(this.address.state);
    }

    parts.push(this.address.country);

    if (this.address.postalCode) {
      parts.push(this.address.postalCode);
    }

    return parts.join(', ');
  }

  /**
   * Format location for display
   */
  format(): string {
    return `${this.name} - ${this.formatAddress()}`;
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
  toJSON(): {
    coordinates: Coordinates | null;
    address: Address;
    name: string;
  } {
    return {
      coordinates: this.coordinates,
      address: this.address,
      name: this.name
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: {
    coordinates: Coordinates | null;
    address: Address;
    name: string;
  }): Location {
    if (json.coordinates) {
      return Location.createWithCoordinates(json.coordinates, json.address, json.name);
    } else {
      return Location.createWithoutCoordinates(json.address, json.name);
    }
  }
} 