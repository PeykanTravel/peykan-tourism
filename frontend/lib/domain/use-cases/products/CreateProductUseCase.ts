/**
 * Create Product Use Case
 * Handles product creation and management logic
 */

import { ProductRepository, ProductCreateData, ProductUpdateData } from '../../repositories/ProductRepository';
import { ProductAggregate, ProductMetadata } from '../../aggregates/ProductAggregate';
import { Product, ProductType, ProductStatus } from '../../entities/Product';
import { Price } from '../../value-objects/Price';
import { Location } from '../../value-objects/Location';

export interface CreateProductRequest {
  type: ProductType;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  price: {
    amount: number;
    currency: string;
  };
  location: {
    name: string;
    street: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  images?: string[];
  variants?: any[];
  options?: any[];
  metadata?: {
    category?: string;
    tags?: string[];
    features?: string[];
    includedServices?: string[];
    excludedServices?: string[];
    customFields?: Record<string, any>;
  };
}

export interface CreateProductResponse {
  success: boolean;
  product?: ProductAggregate;
  message?: string;
  errors?: string[];
}

export interface UpdateProductRequest {
  id: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  price?: {
    amount: number;
    currency: string;
  };
  location?: {
    name: string;
    street: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  images?: string[];
  variants?: any[];
  options?: any[];
  metadata?: Partial<ProductMetadata>;
}

export interface UpdateProductResponse {
  success: boolean;
  product?: ProductAggregate;
  message?: string;
  errors?: string[];
}

export interface DeleteProductRequest {
  id: string;
}

export interface DeleteProductResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface ActivateProductRequest {
  id: string;
}

export interface ActivateProductResponse {
  success: boolean;
  product?: ProductAggregate;
  message?: string;
  errors?: string[];
}

export interface DeactivateProductRequest {
  id: string;
}

export interface DeactivateProductResponse {
  success: boolean;
  product?: ProductAggregate;
  message?: string;
  errors?: string[];
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository
  ) {}

  /**
   * Create a new product
   */
  async create(request: CreateProductRequest): Promise<CreateProductResponse> {
    try {
      // Validate input
      const validation = this.validateCreateProductRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Check if slug already exists
      const existingProduct = await this.productRepository.findBySlug(request.slug);
      if (existingProduct) {
        return {
          success: false,
          message: 'Product slug already exists',
          errors: ['A product with this slug already exists']
        };
      }

      // Create price value object
      const price = Price.create(request.price.amount, request.price.currency);

      // Create location value object
      const location = Location.create(
        request.location.name,
        request.location.street,
        request.location.city,
        request.location.country,
        request.location.latitude || 0,
        request.location.longitude || 0
      );

      // Create product data
      const productData: ProductCreateData = {
        type: request.type,
        slug: request.slug,
        title: request.title,
        description: request.description,
        shortDescription: request.shortDescription,
        price: price,
        location: location,
        images: request.images || [],
        variants: request.variants || [],
        options: request.options || [],
        status: ProductStatus.DRAFT,
        metadata: request.metadata || {}
      };

      // Create product
      const product = await this.productRepository.create(productData);

      return {
        success: true,
        product,
        message: 'Product created successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Product creation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update an existing product
   */
  async update(request: UpdateProductRequest): Promise<UpdateProductResponse> {
    try {
      // Validate input
      const validation = this.validateUpdateProductRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Check if product exists
      const existingProduct = await this.productRepository.findById(request.id);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          errors: ['Product does not exist']
        };
      }

      // Prepare update data
      const updateData: ProductUpdateData = {};

      if (request.title) updateData.title = request.title;
      if (request.description) updateData.description = request.description;
      if (request.shortDescription) updateData.shortDescription = request.shortDescription;
      if (request.images) updateData.images = request.images;
      if (request.variants) updateData.variants = request.variants;
      if (request.options) updateData.options = request.options;
      if (request.metadata) updateData.metadata = request.metadata;

      // Update price if provided
      if (request.price) {
        updateData.price = Price.create(request.price.amount, request.price.currency);
      }

      // Update location if provided
      if (request.location) {
        updateData.location = Location.create(
          request.location.name,
          request.location.street,
          request.location.city,
          request.location.country,
          request.location.latitude || 0,
          request.location.longitude || 0
        );
      }

      // Update product
      const updatedProduct = await this.productRepository.update(request.id, updateData);

      return {
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Product update failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Delete a product
   */
  async delete(request: DeleteProductRequest): Promise<DeleteProductResponse> {
    try {
      // Validate input
      if (!request.id) {
        return {
          success: false,
          message: 'Product ID is required',
          errors: ['Product ID must be provided']
        };
      }

      // Check if product exists
      const existingProduct = await this.productRepository.findById(request.id);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          errors: ['Product does not exist']
        };
      }

      // Check if product can be deleted (not active or has no orders)
      if (existingProduct.isActive()) {
        return {
          success: false,
          message: 'Cannot delete active product',
          errors: ['Active products cannot be deleted']
        };
      }

      // Delete product
      const deleted = await this.productRepository.delete(request.id);

      if (!deleted) {
        return {
          success: false,
          message: 'Failed to delete product',
          errors: ['Product deletion failed']
        };
      }

      return {
        success: true,
        message: 'Product deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Product deletion failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Activate a product
   */
  async activate(request: ActivateProductRequest): Promise<ActivateProductResponse> {
    try {
      // Validate input
      if (!request.id) {
        return {
          success: false,
          message: 'Product ID is required',
          errors: ['Product ID must be provided']
        };
      }

      // Check if product exists
      const existingProduct = await this.productRepository.findById(request.id);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          errors: ['Product does not exist']
        };
      }

      // Activate product
      const activatedProduct = await this.productRepository.activate(request.id);

      return {
        success: true,
        product: activatedProduct,
        message: 'Product activated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Product activation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Deactivate a product
   */
  async deactivate(request: DeactivateProductRequest): Promise<DeactivateProductResponse> {
    try {
      // Validate input
      if (!request.id) {
        return {
          success: false,
          message: 'Product ID is required',
          errors: ['Product ID must be provided']
        };
      }

      // Check if product exists
      const existingProduct = await this.productRepository.findById(request.id);
      if (!existingProduct) {
        return {
          success: false,
          message: 'Product not found',
          errors: ['Product does not exist']
        };
      }

      // Deactivate product
      const deactivatedProduct = await this.productRepository.deactivate(request.id);

      return {
        success: true,
        product: deactivatedProduct,
        message: 'Product deactivated successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Product deactivation failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Validate create product request
   */
  private validateCreateProductRequest(request: CreateProductRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.type) {
      errors.push('Product type is required');
    }

    if (!request.slug || request.slug.length < 3) {
      errors.push('Product slug must be at least 3 characters long');
    }

    if (!request.title || request.title.trim().length === 0) {
      errors.push('Product title is required');
    }

    if (!request.description || request.description.trim().length === 0) {
      errors.push('Product description is required');
    }

    if (!request.shortDescription || request.shortDescription.trim().length === 0) {
      errors.push('Product short description is required');
    }

    if (!request.price || !request.price.amount || request.price.amount <= 0) {
      errors.push('Valid product price is required');
    }

    if (!request.price?.currency) {
      errors.push('Product currency is required');
    }

    if (!request.location) {
      errors.push('Product location is required');
    } else {
      if (!request.location.name || request.location.name.trim().length === 0) {
        errors.push('Location name is required');
      }
      if (!request.location.city || request.location.city.trim().length === 0) {
        errors.push('Location city is required');
      }
      if (!request.location.country || request.location.country.trim().length === 0) {
        errors.push('Location country is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate update product request
   */
  private validateUpdateProductRequest(request: UpdateProductRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!request.id) {
      errors.push('Product ID is required');
    }

    if (request.title !== undefined && request.title.trim().length === 0) {
      errors.push('Product title cannot be empty');
    }

    if (request.description !== undefined && request.description.trim().length === 0) {
      errors.push('Product description cannot be empty');
    }

    if (request.shortDescription !== undefined && request.shortDescription.trim().length === 0) {
      errors.push('Product short description cannot be empty');
    }

    if (request.price && (!request.price.amount || request.price.amount <= 0)) {
      errors.push('Valid product price is required');
    }

    if (request.location) {
      if (!request.location.name || request.location.name.trim().length === 0) {
        errors.push('Location name is required');
      }
      if (!request.location.city || request.location.city.trim().length === 0) {
        errors.push('Location city is required');
      }
      if (!request.location.country || request.location.country.trim().length === 0) {
        errors.push('Location country is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 