/**
 * Product Repository Implementation
 * API-based implementation of ProductRepository interface
 */

import { ProductRepository, ProductCreateData, ProductUpdateData, ProductSearchCriteria } from '../../domain/repositories/ProductRepository';
import { Product, ProductType, ProductStatus } from '../../domain/entities/Product';
import { apiClient } from '../api/ApiClient';

export class ProductRepositoryImpl implements ProductRepository {
  private readonly baseUrl = '/products';

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToProduct(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      return null;
    }
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-slug/${slug}`);
      
      if (response.success && response.data) {
        return this.mapToProduct(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding product by slug:', error);
      return null;
    }
  }

  /**
   * Find products by search criteria
   */
  async findByCriteria(criteria: ProductSearchCriteria): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (criteria.page) params.append('page', criteria.page.toString());
      if (criteria.limit) params.append('limit', criteria.limit.toString());
      if (criteria.search) params.append('search', criteria.search);
      if (criteria.type) params.append('type', criteria.type);
      if (criteria.status) params.append('status', criteria.status);
      if (criteria.category) params.append('category', criteria.category);
      if (criteria.min_price !== undefined) params.append('min_price', criteria.min_price.toString());
      if (criteria.max_price !== undefined) params.append('max_price', criteria.max_price.toString());
      if (criteria.currency) params.append('currency', criteria.currency);
      if (criteria.location) params.append('location', criteria.location);
      if (criteria.available_from) params.append('available_from', criteria.available_from.toISOString());
      if (criteria.available_to) params.append('available_to', criteria.available_to.toISOString());

      const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const products = response.data.results?.map((productData: any) => this.mapToProduct(productData)) || [];
        
        return {
          products,
          total: response.data.count || products.length,
          page: response.data.page || 1,
          limit: response.data.limit || products.length
        };
      }
      
      return { products: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error finding products:', error);
      return { products: [], total: 0, page: 1, limit: 10 };
    }
  }

  /**
   * Find all products
   */
  async findAll(): Promise<Product[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}`);
      
      if (response.success && response.data) {
        return response.data.results?.map((productData: any) => this.mapToProduct(productData)) || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error finding all products:', error);
      return [];
    }
  }

  /**
   * Find products by type
   */
  async findByType(type: ProductType): Promise<Product[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-type/${type}`);
      
      if (response.success && response.data) {
        return response.data.results?.map((productData: any) => this.mapToProduct(productData)) || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error finding products by type:', error);
      return [];
    }
  }

  /**
   * Find products by status
   */
  async findByStatus(status: ProductStatus): Promise<Product[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/by-status/${status}`);
      
      if (response.success && response.data) {
        return response.data.results?.map((productData: any) => this.mapToProduct(productData)) || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error finding products by status:', error);
      return [];
    }
  }

  /**
   * Create a new product
   */
  async create(data: ProductCreateData): Promise<Product> {
    try {
      const requestData = this.mapFromProductCreateData(data);
      
      const response = await apiClient.post(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToProduct(response.data);
      }
      
      throw new Error('Failed to create product');
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async update(id: string, data: ProductUpdateData): Promise<Product> {
    try {
      const requestData = this.mapFromProductUpdateData(data);
      
      const response = await apiClient.patch(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToProduct(response.data);
      }
      
      throw new Error('Failed to update product');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  /**
   * Check if slug exists
   */
  async existsBySlug(slug: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/exists/slug/${slug}`);
      return response.success && response.data?.exists === true;
    } catch (error) {
      console.error('Error checking slug existence:', error);
      return false;
    }
  }

  /**
   * Get product statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byType: {},
        byStatus: {}
      };
    } catch (error) {
      console.error('Error getting product statistics:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byType: {},
        byStatus: {}
      };
    }
  }

  /**
   * Map API response to Product entity
   */
  private mapToProduct(productData: any): Product {
    return {
      id: productData.id,
      title: productData.title,
      slug: productData.slug,
      description: productData.description,
      short_description: productData.short_description,
      type: productData.type,
      status: productData.status,
      price: productData.price,
      currency: productData.currency,
      images: productData.images || [],
      featured_image: productData.featured_image,
      location: productData.location ? {
        address: productData.location.address,
        city: productData.location.city,
        country: productData.location.country,
        latitude: productData.location.latitude,
        longitude: productData.location.longitude
      } : undefined,
      duration: productData.duration,
      max_capacity: productData.max_capacity,
      min_age: productData.min_age,
      max_age: productData.max_age,
      included_services: productData.included_services || [],
      excluded_services: productData.excluded_services || [],
      what_to_bring: productData.what_to_bring || [],
      cancellation_policy: productData.cancellation_policy,
      created_at: productData.created_at,
      updated_at: productData.updated_at,
      metadata: productData.metadata
    };
  }

  /**
   * Map ProductCreateData to API request format
   */
  private mapFromProductCreateData(data: ProductCreateData): any {
    return {
      type: data.type,
      slug: data.slug,
      title: data.title,
      description: data.description,
      short_description: data.short_description,
      price: data.price,
      currency: data.currency,
      location: data.location,
      images: data.images,
      status: data.status
    };
  }

  /**
   * Map ProductUpdateData to API request format
   */
  private mapFromProductUpdateData(data: ProductUpdateData): any {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.short_description !== undefined) updateData.short_description = data.short_description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.status !== undefined) updateData.status = data.status;

    return updateData;
  }
} 