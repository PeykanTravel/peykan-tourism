/**
 * Product Repository Implementation
 * API-based implementation of ProductRepository interface
 */

import { ProductRepository, ProductCreateData, ProductUpdateData, ProductSearchCriteria } from '../../domain/repositories/ProductRepository';
import { ProductAggregate } from '../../domain/aggregates/ProductAggregate';
import { Product, ProductType, ProductStatus } from '../../domain/entities/Product';
import { Price } from '../../domain/value-objects/Price';
import { Location } from '../../domain/value-objects/Location';
import { apiClient, ApiResponse } from '../api/ApiClient';

export class ProductRepositoryImpl implements ProductRepository {
  private readonly baseUrl = '/products';

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<ProductAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      
      if (response.success && response.data) {
        return this.mapToProductAggregate(response.data);
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
  async findBySlug(slug: string): Promise<ProductAggregate | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/by-slug/${slug}`);
      
      if (response.success && response.data) {
        return this.mapToProductAggregate(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error finding product by slug:', error);
      return null;
    }
  }

  /**
   * Find products with search criteria
   */
  async find(criteria: ProductSearchCriteria): Promise<{
    products: ProductAggregate[];
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
      if (criteria.minPrice !== undefined) params.append('min_price', criteria.minPrice.toString());
      if (criteria.maxPrice !== undefined) params.append('max_price', criteria.maxPrice.toString());
      if (criteria.currency) params.append('currency', criteria.currency);
      if (criteria.location) params.append('location', criteria.location);
      if (criteria.availableFrom) params.append('available_from', criteria.availableFrom.toISOString());
      if (criteria.availableTo) params.append('available_to', criteria.availableTo.toISOString());
      if (criteria.sortBy) params.append('sort_by', criteria.sortBy);
      if (criteria.sortOrder) params.append('sort_order', criteria.sortOrder);

      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}?${params.toString()}`);
      
      if (response.success && response.data) {
        const products = response.data.results.map((productData: any) => this.mapToProductAggregate(productData));
        
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
   * Find products by type
   */
  async findByType(type: ProductType): Promise<ProductAggregate[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/by-type/${type}`);
      
      if (response.success && response.data) {
        return response.data.map((productData: any) => this.mapToProductAggregate(productData));
      }
      
      return [];
    } catch (error) {
      console.error('Error finding products by type:', error);
      return [];
    }
  }

  /**
   * Find featured products
   */
  async findFeatured(limit: number = 10): Promise<ProductAggregate[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/featured?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data.map((productData: any) => this.mapToProductAggregate(productData));
      }
      
      return [];
    } catch (error) {
      console.error('Error finding featured products:', error);
      return [];
    }
  }

  /**
   * Find popular products
   */
  async findPopular(limit: number = 10): Promise<ProductAggregate[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/popular?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data.map((productData: any) => this.mapToProductAggregate(productData));
      }
      
      return [];
    } catch (error) {
      console.error('Error finding popular products:', error);
      return [];
    }
  }

  /**
   * Create new product
   */
  async create(data: ProductCreateData): Promise<ProductAggregate> {
    try {
      const requestData = this.mapFromProductCreateData(data);
      
      const response = await apiClient.post<ApiResponse<any>>(this.baseUrl, requestData);
      
      if (response.success && response.data) {
        return this.mapToProductAggregate(response.data);
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
  async update(id: string, data: ProductUpdateData): Promise<ProductAggregate> {
    try {
      const requestData = this.mapFromProductUpdateData(data);
      
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}`, requestData);
      
      if (response.success && response.data) {
        return this.mapToProductAggregate(response.data);
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
      const response = await apiClient.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  /**
   * Activate product
   */
  async activate(id: string): Promise<ProductAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/activate`);
      
      if (response.success && response.data) {
        return this.mapToProductAggregate(response.data);
      }
      
      throw new Error('Failed to activate product');
    } catch (error) {
      console.error('Error activating product:', error);
      throw error;
    }
  }

  /**
   * Deactivate product
   */
  async deactivate(id: string): Promise<ProductAggregate> {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(`${this.baseUrl}/${id}/deactivate`);
      
      if (response.success && response.data) {
        return this.mapToProductAggregate(response.data);
      }
      
      throw new Error('Failed to deactivate product');
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
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
      const response = await apiClient.get<ApiResponse<any>>(`${this.baseUrl}/statistics`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return { total: 0, active: 0, inactive: 0, byType: {}, byStatus: {} };
    } catch (error) {
      console.error('Error getting product statistics:', error);
      return { total: 0, active: 0, inactive: 0, byType: {}, byStatus: {} };
    }
  }

  /**
   * Map API response to ProductAggregate
   */
  private mapToProductAggregate(productData: any): ProductAggregate {
    // Create Price value object
    const price = Price.create(
      productData.price.amount,
      productData.price.currency
    );

    // Create Location value object
    const location = Location.create(
      productData.location.name,
      productData.location.street,
      productData.location.city,
      productData.location.country,
      productData.location.latitude || 0,
      productData.location.longitude || 0
    );

    // Create Product entity
    const product = Product.create(
      productData.id,
      productData.type as ProductType,
      productData.slug,
      productData.title,
      productData.description,
      productData.shortDescription,
      price,
      location,
      productData.images || [],
      productData.variants || [],
      productData.options || [],
      productData.status as ProductStatus,
      productData.metadata || {},
      productData.createdAt ? new Date(productData.createdAt) : new Date(),
      productData.updatedAt ? new Date(productData.updatedAt) : new Date()
    );

    // Create ProductAggregate
    const productAggregate = ProductAggregate.create(
      product,
      productData.availability || {
        isAvailable: true,
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        maxParticipants: 100,
        currentParticipants: 0
      },
      productData.ratings || {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    );

    return productAggregate;
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
      shortDescription: data.shortDescription,
      price: {
        amount: data.price.getAmount(),
        currency: data.price.getCurrency().getCode()
      },
      location: {
        name: data.location.getName(),
        street: data.location.getStreet(),
        city: data.location.getCity(),
        country: data.location.getCountry(),
        latitude: data.location.getLatitude(),
        longitude: data.location.getLongitude()
      },
      images: data.images,
      variants: data.variants,
      options: data.options,
      status: data.status,
      metadata: data.metadata
    };
  }

  /**
   * Map ProductUpdateData to API request format
   */
  private mapFromProductUpdateData(data: ProductUpdateData): any {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.variants !== undefined) updateData.variants = data.variants;
    if (data.options !== undefined) updateData.options = data.options;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    if (data.price !== undefined) {
      updateData.price = {
        amount: data.price.getAmount(),
        currency: data.price.getCurrency().getCode()
      };
    }

    if (data.location !== undefined) {
      updateData.location = {
        name: data.location.getName(),
        street: data.location.getStreet(),
        city: data.location.getCity(),
        country: data.location.getCountry(),
        latitude: data.location.getLatitude(),
        longitude: data.location.getLongitude()
      };
    }

    return updateData;
  }
} 