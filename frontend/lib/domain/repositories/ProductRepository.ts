/**
 * Product Repository Interface
 * Defines the contract for product data access operations
 */

import { ProductAggregate, ProductMetadata } from '../aggregates/ProductAggregate';
import { Product, ProductType, ProductStatus } from '../entities/Product';
import { Price } from '../value-objects/Price';
import { Location } from '../value-objects/Location';

export interface ProductSearchCriteria {
  type?: ProductType;
  status?: ProductStatus;
  category?: string;
  tags?: string[];
  minPrice?: Price;
  maxPrice?: Price;
  location?: Location;
  isFeatured?: boolean;
  isPopular?: boolean;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'title' | 'createdAt' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductCreateData {
  type: ProductType;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  price: Price;
  location: Location;
  images?: any[];
  variants?: any[];
  options?: any[];
  status?: ProductStatus;
  metadata?: ProductMetadata;
}

export interface ProductUpdateData {
  title?: string;
  description?: string;
  shortDescription?: string;
  price?: Price;
  location?: Location;
  images?: any[];
  variants?: any[];
  options?: any[];
  status?: ProductStatus;
  metadata?: Partial<ProductMetadata>;
}

export interface ProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<ProductAggregate | null>;

  /**
   * Find product by slug
   */
  findBySlug(slug: string): Promise<ProductAggregate | null>;

  /**
   * Find products by search criteria
   */
  findByCriteria(criteria: ProductSearchCriteria): Promise<ProductAggregate[]>;

  /**
   * Find all products
   */
  findAll(): Promise<ProductAggregate[]>;

  /**
   * Find products by type
   */
  findByType(type: ProductType): Promise<ProductAggregate[]>;

  /**
   * Find products by status
   */
  findByStatus(status: ProductStatus): Promise<ProductAggregate[]>;

  /**
   * Find active products
   */
  findActiveProducts(): Promise<ProductAggregate[]>;

  /**
   * Find featured products
   */
  findFeaturedProducts(): Promise<ProductAggregate[]>;

  /**
   * Find popular products
   */
  findPopularProducts(): Promise<ProductAggregate[]>;

  /**
   * Find products by category
   */
  findByCategory(category: string): Promise<ProductAggregate[]>;

  /**
   * Find products by tags
   */
  findByTags(tags: string[]): Promise<ProductAggregate[]>;

  /**
   * Find products by price range
   */
  findByPriceRange(minPrice: Price, maxPrice: Price): Promise<ProductAggregate[]>;

  /**
   * Find products by location
   */
  findByLocation(location: Location, radius?: number): Promise<ProductAggregate[]>;

  /**
   * Search products by term
   */
  search(searchTerm: string): Promise<ProductAggregate[]>;

  /**
   * Create a new product
   */
  create(data: ProductCreateData): Promise<ProductAggregate>;

  /**
   * Update product
   */
  update(id: string, data: ProductUpdateData): Promise<ProductAggregate>;

  /**
   * Delete product
   */
  delete(id: string): Promise<boolean>;

  /**
   * Activate product
   */
  activate(id: string): Promise<ProductAggregate>;

  /**
   * Deactivate product
   */
  deactivate(id: string): Promise<ProductAggregate>;

  /**
   * Mark as featured
   */
  markAsFeatured(id: string): Promise<ProductAggregate>;

  /**
   * Mark as popular
   */
  markAsPopular(id: string): Promise<ProductAggregate>;

  /**
   * Update price
   */
  updatePrice(id: string, price: Price): Promise<ProductAggregate>;

  /**
   * Add variant
   */
  addVariant(id: string, variant: any): Promise<ProductAggregate>;

  /**
   * Add option
   */
  addOption(id: string, option: any): Promise<ProductAggregate>;

  /**
   * Add tag
   */
  addTag(id: string, tag: string): Promise<ProductAggregate>;

  /**
   * Remove tag
   */
  removeTag(id: string, tag: string): Promise<ProductAggregate>;

  /**
   * Add feature
   */
  addFeature(id: string, feature: string): Promise<ProductAggregate>;

  /**
   * Check if slug exists
   */
  existsBySlug(slug: string): Promise<boolean>;

  /**
   * Count total products
   */
  count(): Promise<number>;

  /**
   * Count products by type
   */
  countByType(type: ProductType): Promise<number>;

  /**
   * Count products by status
   */
  countByStatus(status: ProductStatus): Promise<number>;

  /**
   * Count active products
   */
  countActiveProducts(): Promise<number>;

  /**
   * Count featured products
   */
  countFeaturedProducts(): Promise<number>;

  /**
   * Count products by category
   */
  countByCategory(category: string): Promise<number>;

  /**
   * Get product statistics
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    featured: number;
    popular: number;
    byType: Record<ProductType, number>;
    byStatus: Record<ProductStatus, number>;
    byCategory: Record<string, number>;
    averagePrice: Price;
    priceRange: { min: Price; max: Price };
  }>;

  /**
   * Get categories
   */
  getCategories(): Promise<string[]>;

  /**
   * Get tags
   */
  getTags(): Promise<string[]>;

  /**
   * Get price range
   */
  getPriceRange(): Promise<{ min: Price; max: Price }>;
} 