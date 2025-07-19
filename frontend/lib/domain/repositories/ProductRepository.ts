/**
 * Product Repository Interface
 * Simplified interface for product data access operations
 */

import { Product, ProductType, ProductStatus } from '../entities/Product';

export interface ProductSearchCriteria {
  type?: ProductType;
  status?: ProductStatus;
  category?: string;
  min_price?: number;
  max_price?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  currency?: string;
  available_from?: Date;
  available_to?: Date;
}

export interface ProductCreateData {
  type: ProductType;
  slug: string;
  title: string;
  description: string;
  short_description?: string;
  price: number;
  currency: string;
  location?: {
    address: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  images?: string[];
  status?: ProductStatus;
}

export interface ProductUpdateData {
  title?: string;
  description?: string;
  short_description?: string;
  price?: number;
  currency?: string;
  location?: {
    address: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  images?: string[];
  status?: ProductStatus;
}

export interface ProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Find product by slug
   */
  findBySlug(slug: string): Promise<Product | null>;

  /**
   * Find products by search criteria
   */
  findByCriteria(criteria: ProductSearchCriteria): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * Find all products
   */
  findAll(): Promise<Product[]>;

  /**
   * Find products by type
   */
  findByType(type: ProductType): Promise<Product[]>;

  /**
   * Find products by status
   */
  findByStatus(status: ProductStatus): Promise<Product[]>;

  /**
   * Create a new product
   */
  create(data: ProductCreateData): Promise<Product>;

  /**
   * Update product
   */
  update(id: string, data: ProductUpdateData): Promise<Product>;

  /**
   * Delete product
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if slug exists
   */
  existsBySlug(slug: string): Promise<boolean>;

  /**
   * Get product statistics
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }>;
} 