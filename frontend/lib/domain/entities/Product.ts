/**
 * Product Entity
 * Represents a base product in the system with domain logic and business rules
 */

import { Price } from '../value-objects/Price';
import { Location } from '../value-objects/Location';
import { Currency } from '../value-objects/Currency';

export enum ProductType {
  TOUR = 'tour',
  EVENT = 'event',
  TRANSFER = 'transfer'
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  description?: string;
  price: Price;
  isAvailable: boolean;
  metadata?: Record<string, any>;
}

export interface ProductOption {
  id: string;
  name: string;
  description?: string;
  price: Price;
  isRequired: boolean;
  maxQuantity?: number;
  metadata?: Record<string, any>;
}

export class Product {
  private constructor(
    private readonly id: string,
    private readonly type: ProductType,
    private readonly slug: string,
    private readonly title: string,
    private readonly description: string,
    private readonly shortDescription: string,
    private readonly price: Price,
    private readonly location: Location,
    private readonly images: ProductImage[],
    private readonly variants: ProductVariant[],
    private readonly options: ProductOption[],
    private readonly status: ProductStatus,
    private readonly isFeatured: boolean,
    private readonly isPopular: boolean,
    private readonly metadata: Record<string, any>,
    private readonly createdAt: Date,
    private readonly updatedAt: Date
  ) {
    this.validate();
  }

  /**
   * Create a new Product instance
   */
  static create(
    id: string,
    type: ProductType,
    slug: string,
    title: string,
    description: string,
    shortDescription: string,
    price: Price,
    location: Location,
    images: ProductImage[] = [],
    variants: ProductVariant[] = [],
    options: ProductOption[] = [],
    status: ProductStatus = ProductStatus.DRAFT
  ): Product {
    return new Product(
      id,
      type,
      slug,
      title,
      description,
      shortDescription,
      price,
      location,
      images,
      variants,
      options,
      status,
      false,
      false,
      {},
      new Date(),
      new Date()
    );
  }

  /**
   * Validate product constraints
   */
  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Product ID is required');
    }

    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error('Product slug is required');
    }

    if (!this.title || this.title.trim().length === 0) {
      throw new Error('Product title is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Product description is required');
    }

    if (!this.shortDescription || this.shortDescription.trim().length === 0) {
      throw new Error('Product short description is required');
    }

    if (this.shortDescription.length > 500) {
      throw new Error('Short description cannot exceed 500 characters');
    }

    if (this.price.isZero()) {
      throw new Error('Product price cannot be zero');
    }

    if (this.images.length > 0 && !this.images.some(img => img.isPrimary)) {
      throw new Error('Product must have exactly one primary image');
    }

    if (this.images.filter(img => img.isPrimary).length > 1) {
      throw new Error('Product cannot have more than one primary image');
    }
  }

  /**
   * Get product ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get product type
   */
  getType(): ProductType {
    return this.type;
  }

  /**
   * Get product slug
   */
  getSlug(): string {
    return this.slug;
  }

  /**
   * Get product title
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * Get product description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Get product short description
   */
  getShortDescription(): string {
    return this.shortDescription;
  }

  /**
   * Get product price
   */
  getPrice(): Price {
    return this.price;
  }

  /**
   * Get product location
   */
  getLocation(): Location {
    return this.location;
  }

  /**
   * Get product images
   */
  getImages(): ProductImage[] {
    return [...this.images];
  }

  /**
   * Get primary image
   */
  getPrimaryImage(): ProductImage | null {
    return this.images.find(img => img.isPrimary) || null;
  }

  /**
   * Get main image (alias for getPrimaryImage for compatibility)
   */
  getMainImage(): ProductImage | null {
    return this.getPrimaryImage();
  }

  /**
   * Get product variants
   */
  getVariants(): ProductVariant[] {
    return [...this.variants];
  }

  /**
   * Get available variants
   */
  getAvailableVariants(): ProductVariant[] {
    return this.variants.filter(variant => variant.isAvailable);
  }

  /**
   * Get product options
   */
  getOptions(): ProductOption[] {
    return [...this.options];
  }

  /**
   * Get required options
   */
  getRequiredOptions(): ProductOption[] {
    return this.options.filter(option => option.isRequired);
  }

  /**
   * Get product metadata
   */
  getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  /**
   * Get product status
   */
  getStatus(): ProductStatus {
    return this.status;
  }

  /**
   * Check if product is active
   */
  isActive(): boolean {
    return this.status === ProductStatus.ACTIVE;
  }

  /**
   * Check if product is featured
   */
  isProductFeatured(): boolean {
    return this.isFeatured;
  }

  /**
   * Check if product is popular
   */
  isProductPopular(): boolean {
    return this.isPopular;
  }

  /**
   * Check if product is available for booking
   */
  isAvailableForBooking(): boolean {
    if (!this.isActive()) {
      return false;
    }

    // If product has variants, at least one must be available
    if (this.hasVariants()) {
      return this.getAvailableVariants().length > 0;
    }

    // If product has no variants, it's available if active
    return true;
  }

  /**
   * Get minimum price (including variants)
   */
  getMinimumPrice(): Price {
    if (this.variants.length === 0) {
      return this.price;
    }

    const availableVariants = this.getAvailableVariants();
    if (availableVariants.length === 0) {
      return this.price;
    }

    return availableVariants.reduce((min, variant) => {
      return variant.price.getAmount() < min.getAmount() ? variant.price : min;
    }, availableVariants[0].price);
  }

  /**
   * Get maximum price (including variants)
   */
  getMaximumPrice(): Price {
    if (this.variants.length === 0) {
      return this.price;
    }

    const availableVariants = this.getAvailableVariants();
    if (availableVariants.length === 0) {
      return this.price;
    }

    return availableVariants.reduce((max, variant) => {
      return variant.price.getAmount() > max.getAmount() ? variant.price : max;
    }, availableVariants[0].price);
  }

  /**
   * Check if product has variants
   */
  hasVariants(): boolean {
    return this.variants.length > 0;
  }

  /**
   * Check if product has options
   */
  hasOptions(): boolean {
    return this.options.length > 0;
  }

  /**
   * Get variant by ID
   */
  getVariantById(variantId: string): ProductVariant | null {
    return this.variants.find(variant => variant.id === variantId) || null;
  }

  /**
   * Get option by ID
   */
  getOptionById(optionId: string): ProductOption | null {
    return this.options.find(option => option.id === optionId) || null;
  }

  /**
   * Update product status
   */
  updateStatus(status: ProductStatus): Product {
    return new Product(
      this.id,
      this.type,
      this.slug,
      this.title,
      this.description,
      this.shortDescription,
      this.price,
      this.location,
      this.images,
      this.variants,
      this.options,
      status,
      this.isFeatured,
      this.isPopular,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as featured
   */
  markAsFeatured(): Product {
    return new Product(
      this.id,
      this.type,
      this.slug,
      this.title,
      this.description,
      this.shortDescription,
      this.price,
      this.location,
      this.images,
      this.variants,
      this.options,
      this.status,
      true,
      this.isPopular,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Mark as popular
   */
  markAsPopular(): Product {
    return new Product(
      this.id,
      this.type,
      this.slug,
      this.title,
      this.description,
      this.shortDescription,
      this.price,
      this.location,
      this.images,
      this.variants,
      this.options,
      this.status,
      this.isFeatured,
      true,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Update price
   */
  updatePrice(price: Price): Product {
    return new Product(
      this.id,
      this.type,
      this.slug,
      this.title,
      this.description,
      this.shortDescription,
      price,
      this.location,
      this.images,
      this.variants,
      this.options,
      this.status,
      this.isFeatured,
      this.isPopular,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Add variant
   */
  addVariant(variant: ProductVariant): Product {
    const updatedVariants = [...this.variants, variant];
    
    return new Product(
      this.id,
      this.type,
      this.slug,
      this.title,
      this.description,
      this.shortDescription,
      this.price,
      this.location,
      this.images,
      updatedVariants,
      this.options,
      this.status,
      this.isFeatured,
      this.isPopular,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Add option
   */
  addOption(option: ProductOption): Product {
    const updatedOptions = [...this.options, option];
    
    return new Product(
      this.id,
      this.type,
      this.slug,
      this.title,
      this.description,
      this.shortDescription,
      this.price,
      this.location,
      this.images,
      this.variants,
      updatedOptions,
      this.status,
      this.isFeatured,
      this.isPopular,
      this.metadata,
      this.createdAt,
      new Date()
    );
  }

  /**
   * Check if product equals another
   */
  equals(other: Product): boolean {
    return this.id === other.id;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `Product(${this.id}, ${this.title}, ${this.type})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      slug: this.slug,
      title: this.title,
      description: this.description,
      shortDescription: this.shortDescription,
      price: this.price.toJSON(),
      location: this.location.toJSON(),
      images: this.images,
      variants: this.variants,
      options: this.options,
      status: this.status,
      isFeatured: this.isFeatured,
      isPopular: this.isPopular,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): Product {
    return new Product(
      json.id,
      json.type,
      json.slug,
      json.title,
      json.description,
      json.shortDescription,
      Price.fromJSON(json.price),
      Location.fromJSON(json.location),
      json.images,
      json.variants,
      json.options,
      json.status,
      json.isFeatured,
      json.isPopular,
      json.metadata,
      new Date(json.createdAt),
      new Date(json.updatedAt)
    );
  }
} 