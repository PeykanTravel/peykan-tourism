import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { Product } from '../../../domain/entities/Product';
import { ProductType } from '../../../domain/value-objects/ProductType';
import { Price } from '../../../domain/value-objects/Price';
import { Currency } from '../../../domain/value-objects/Currency';

export interface GetProductsUseCaseRequest {
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  location?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetProductsUseCaseResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: GetProductsUseCaseRequest): Promise<GetProductsUseCaseResponse> {
    try {
      // Validate and prepare filters
      const filters: any = {};
      
      if (request.type) {
        filters.type = ProductType.create(request.type);
      }
      
      if (request.category) {
        filters.category = request.category;
      }
      
      if (request.minPrice !== undefined || request.maxPrice !== undefined) {
        const currency = request.currency ? Currency.create(request.currency) : Currency.create('USD');
        if (request.minPrice !== undefined) {
          filters.minPrice = Price.create(request.minPrice, currency);
        }
        if (request.maxPrice !== undefined) {
          filters.maxPrice = Price.create(request.maxPrice, currency);
        }
      }
      
      if (request.location) {
        filters.location = request.location;
      }
      
      if (request.search) {
        filters.search = request.search;
      }

      const page = request.page || 1;
      const limit = request.limit || 10;

      // Get products
      const result = await this.productRepository.findAll(filters, page, limit);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch products');
      }

      return {
        products: result.products,
        total: result.total,
        page,
        limit,
        hasMore: (page * limit) < result.total
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
      throw new Error('Failed to fetch products: Unknown error');
    }
  }
} 