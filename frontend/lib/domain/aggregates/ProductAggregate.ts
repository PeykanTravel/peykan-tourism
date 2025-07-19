/**
 * Product Aggregate
 * Groups Product entity with variants, options, and enforces business rules
 */

import { Product, ProductType, ProductStatus, ProductVariant, ProductOption, ProductImage } from '../entities/Product';
import { Price } from '../value-objects/Price';
import { Location } from '../value-objects/Location';

export interface ProductMetadata {
  category?: string;
  tags?: string[];
  features?: string[];
  requirements?: string[];
  includedServices?: string[];
  excludedServices?: string[];
  cancellationPolicy?: string;
  customFields?: Record<string, any>;
}

export class ProductAggregate {
  private constructor(
    private readonly product: Product,
    private readonly metadata: ProductMetadata
  ) {
    this.validate();
  }

  /**
   * Create a new ProductAggregate instance
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
    status: ProductStatus = ProductStatus.DRAFT,
    metadata: ProductMetadata = {}
  ): ProductAggregate {
    const product = Product.create(
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
      status
    );

    return new ProductAggregate(product, metadata);
  }

  /**
   * Create a tour product aggregate
   */
  static createTour(
    id: string,
    slug: string,
    title: string,
    description: string,
    shortDescription: string,
    price: Price,
    location: Location,
    duration: number,
    difficultyLevel: 'easy' | 'medium' | 'hard',
    groupSize: { min: number; max: number },
    includedServices: string[],
    excludedServices: string[],
    images: ProductImage[] = [],
    variants: ProductVariant[] = [],
    options: ProductOption[] = []
  ): ProductAggregate {
    const metadata: ProductMetadata = {
      category: 'tour',
      features: [`${duration} days`, `Difficulty: ${difficultyLevel}`, `Group size: ${groupSize.min}-${groupSize.max}`],
      includedServices,
      excludedServices,
      customFields: {
        duration,
        difficultyLevel,
        groupSize
      }
    };

    return ProductAggregate.create(
      id,
      ProductType.TOUR,
      slug,
      title,
      description,
      shortDescription,
      price,
      location,
      images,
      variants,
      options,
      ProductStatus.DRAFT,
      metadata
    );
  }

  /**
   * Create an event product aggregate
   */
  static createEvent(
    id: string,
    slug: string,
    title: string,
    description: string,
    shortDescription: string,
    price: Price,
    location: Location,
    startDate: Date,
    endDate: Date,
    capacity: number,
    organizer: string,
    category: string,
    images: ProductImage[] = [],
    variants: ProductVariant[] = [],
    options: ProductOption[] = []
  ): ProductAggregate {
    const metadata: ProductMetadata = {
      category: 'event',
      features: [`Capacity: ${capacity}`, `Organizer: ${organizer}`],
      customFields: {
        startDate,
        endDate,
        capacity,
        organizer,
        eventCategory: category
      }
    };

    return ProductAggregate.create(
      id,
      ProductType.EVENT,
      slug,
      title,
      description,
      shortDescription,
      price,
      location,
      images,
      variants,
      options,
      ProductStatus.DRAFT,
      metadata
    );
  }

  /**
   * Create a transfer product aggregate
   */
  static createTransfer(
    id: string,
    slug: string,
    title: string,
    description: string,
    shortDescription: string,
    price: Price,
    location: Location,
    vehicleType: string,
    capacity: number,
    duration: number,
    amenities: string[],
    images: ProductImage[] = [],
    variants: ProductVariant[] = [],
    options: ProductOption[] = []
  ): ProductAggregate {
    const metadata: ProductMetadata = {
      category: 'transfer',
      features: [`Vehicle: ${vehicleType}`, `Capacity: ${capacity}`, `Duration: ${duration} minutes`],
      includedServices: amenities,
      customFields: {
        vehicleType,
        capacity,
        duration,
        amenities
      }
    };

    return ProductAggregate.create(
      id,
      ProductType.TRANSFER,
      slug,
      title,
      description,
      shortDescription,
      price,
      location,
      images,
      variants,
      options,
      ProductStatus.DRAFT,
      metadata
    );
  }

  /**
   * Validate aggregate constraints
   */
  private validate(): void {
    // Validate metadata consistency with product type
    if (this.metadata.category && this.metadata.category !== this.product.getType()) {
      throw new Error('Product metadata category must match product type');
    }

    // Validate custom fields based on product type
    if (this.product.getType() === ProductType.TOUR) {
      if (!this.metadata.customFields?.duration) {
        throw new Error('Tour products must have duration in custom fields');
      }
    }

    if (this.product.getType() === ProductType.EVENT) {
      if (!this.metadata.customFields?.startDate || !this.metadata.customFields?.endDate) {
        throw new Error('Event products must have start and end dates in custom fields');
      }
    }

    if (this.product.getType() === ProductType.TRANSFER) {
      if (!this.metadata.customFields?.vehicleType || !this.metadata.customFields?.capacity) {
        throw new Error('Transfer products must have vehicle type and capacity in custom fields');
      }
    }
  }

  /**
   * Get product entity
   */
  getProduct(): Product {
    return this.product;
  }

  /**
   * Get product ID
   */
  getId(): string {
    return this.product.getId();
  }

  /**
   * Get product type
   */
  getType(): ProductType {
    return this.product.getType();
  }

  /**
   * Get product slug
   */
  getSlug(): string {
    return this.product.getSlug();
  }

  /**
   * Get product title
   */
  getTitle(): string {
    return this.product.getTitle();
  }

  /**
   * Get product description
   */
  getDescription(): string {
    return this.product.getDescription();
  }

  /**
   * Get product short description
   */
  getShortDescription(): string {
    return this.product.getShortDescription();
  }

  /**
   * Get product price
   */
  getPrice(): Price {
    return this.product.getPrice();
  }

  /**
   * Get product location
   */
  getLocation(): Location {
    return this.product.getLocation();
  }

  /**
   * Get product images
   */
  getImages(): ProductImage[] {
    return this.product.getImages();
  }

  /**
   * Get product variants
   */
  getVariants(): ProductVariant[] {
    return this.product.getVariants();
  }

  /**
   * Get product options
   */
  getOptions(): ProductOption[] {
    return this.product.getOptions();
  }

  /**
   * Get product status
   */
  getStatus(): ProductStatus {
    return this.product.getStatus();
  }

  /**
   * Get metadata
   */
  getMetadata(): ProductMetadata {
    return { ...this.metadata };
  }

  /**
   * Get category
   */
  getCategory(): string | undefined {
    return this.metadata.category;
  }

  /**
   * Get tags
   */
  getTags(): string[] {
    return this.metadata.tags || [];
  }

  /**
   * Get features
   */
  getFeatures(): string[] {
    return this.metadata.features || [];
  }

  /**
   * Get included services
   */
  getIncludedServices(): string[] {
    return this.metadata.includedServices || [];
  }

  /**
   * Get excluded services
   */
  getExcludedServices(): string[] {
    return this.metadata.excludedServices || [];
  }

  /**
   * Get custom fields
   */
  getCustomFields(): Record<string, any> {
    return { ...this.metadata.customFields };
  }

  /**
   * Check if product is active
   */
  isActive(): boolean {
    return this.product.isActive();
  }

  /**
   * Check if product is available for booking
   */
  isAvailableForBooking(): boolean {
    return this.product.isAvailableForBooking();
  }

  /**
   * Check if product is featured
   */
  isFeatured(): boolean {
    return this.product.isProductFeatured();
  }

  /**
   * Check if product is popular
   */
  isPopular(): boolean {
    return this.product.isProductPopular();
  }

  /**
   * Get minimum price
   */
  getMinimumPrice(): Price {
    return this.product.getMinimumPrice();
  }

  /**
   * Get maximum price
   */
  getMaximumPrice(): Price {
    return this.product.getMaximumPrice();
  }

  /**
   * Update product status
   */
  updateStatus(status: ProductStatus): ProductAggregate {
    const updatedProduct = this.product.updateStatus(status);

    return new ProductAggregate(updatedProduct, this.metadata);
  }

  /**
   * Mark as featured
   */
  markAsFeatured(): ProductAggregate {
    const updatedProduct = this.product.markAsFeatured();

    return new ProductAggregate(updatedProduct, this.metadata);
  }

  /**
   * Mark as popular
   */
  markAsPopular(): ProductAggregate {
    const updatedProduct = this.product.markAsPopular();

    return new ProductAggregate(updatedProduct, this.metadata);
  }

  /**
   * Update price
   */
  updatePrice(price: Price): ProductAggregate {
    const updatedProduct = this.product.updatePrice(price);

    return new ProductAggregate(updatedProduct, this.metadata);
  }

  /**
   * Add variant
   */
  addVariant(variant: ProductVariant): ProductAggregate {
    const updatedProduct = this.product.addVariant(variant);

    return new ProductAggregate(updatedProduct, this.metadata);
  }

  /**
   * Add option
   */
  addOption(option: ProductOption): ProductAggregate {
    const updatedProduct = this.product.addOption(option);

    return new ProductAggregate(updatedProduct, this.metadata);
  }

  /**
   * Update metadata
   */
  updateMetadata(metadata: Partial<ProductMetadata>): ProductAggregate {
    const updatedMetadata = { ...this.metadata, ...metadata };

    return new ProductAggregate(this.product, updatedMetadata);
  }

  /**
   * Add tag
   */
  addTag(tag: string): ProductAggregate {
    const updatedTags = [...(this.metadata.tags || []), tag];
    const updatedMetadata = { ...this.metadata, tags: updatedTags };

    return new ProductAggregate(this.product, updatedMetadata);
  }

  /**
   * Remove tag
   */
  removeTag(tag: string): ProductAggregate {
    const updatedTags = (this.metadata.tags || []).filter(t => t !== tag);
    const updatedMetadata = { ...this.metadata, tags: updatedTags };

    return new ProductAggregate(this.product, updatedMetadata);
  }

  /**
   * Add feature
   */
  addFeature(feature: string): ProductAggregate {
    const updatedFeatures = [...(this.metadata.features || []), feature];
    const updatedMetadata = { ...this.metadata, features: updatedFeatures };

    return new ProductAggregate(this.product, updatedMetadata);
  }

  /**
   * Check if aggregate equals another
   */
  equals(other: ProductAggregate): boolean {
    return this.product.equals(other.product);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return `ProductAggregate(${this.product.toString()})`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): any {
    return {
      product: this.product.toJSON(),
      metadata: this.metadata
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: any): ProductAggregate {
    const product = Product.fromJSON(json.product);
    const metadata = json.metadata;

    return new ProductAggregate(product, metadata);
  }
} 