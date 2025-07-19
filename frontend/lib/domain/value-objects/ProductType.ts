export type ProductTypeValue = 'tour' | 'event' | 'transfer';

export interface ProductTypeInfo {
  name: string;
  description: string;
  features: string[];
  category: string;
}

export class ProductType {
  private readonly _value: ProductTypeValue;
  private static readonly TYPES: Record<ProductTypeValue, ProductTypeInfo> = {
    tour: {
      name: 'Tour',
      description: 'Guided tours and travel experiences',
      features: ['guided', 'itinerary', 'accommodation', 'transportation'],
      category: 'travel'
    },
    event: {
      name: 'Event',
      description: 'Special events and activities',
      features: ['tickets', 'venue', 'schedule', 'entertainment'],
      category: 'entertainment'
    },
    transfer: {
      name: 'Transfer',
      description: 'Transportation services',
      features: ['pickup', 'dropoff', 'vehicle', 'driver'],
      category: 'transportation'
    }
  };

  private constructor(value: ProductTypeValue) {
    this._value = value;
  }

  static create(value: string): ProductType {
    if (!value || typeof value !== 'string') {
      throw new Error('Product type must be a non-empty string');
    }

    const type = value.toLowerCase() as ProductTypeValue;
    
    if (!Object.keys(ProductType.TYPES).includes(type)) {
      throw new Error(`Invalid product type: ${value}. Valid types are: ${Object.keys(ProductType.TYPES).join(', ')}`);
    }

    return new ProductType(type);
  }

  static TOUR = new ProductType('tour');
  static EVENT = new ProductType('event');
  static TRANSFER = new ProductType('transfer');

  get value(): ProductTypeValue {
    return this._value;
  }

  get name(): string {
    return ProductType.TYPES[this._value].name;
  }

  get description(): string {
    return ProductType.TYPES[this._value].description;
  }

  get features(): string[] {
    return ProductType.TYPES[this._value].features;
  }

  get category(): string {
    return ProductType.TYPES[this._value].category;
  }

  hasFeature(feature: string): boolean {
    return this.features.includes(feature);
  }

  isTour(): boolean {
    return this._value === 'tour';
  }

  isEvent(): boolean {
    return this._value === 'event';
  }

  isTransfer(): boolean {
    return this._value === 'transfer';
  }

  equals(other: ProductType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
} 