import { GetProductsUseCase } from '../use-cases/products/GetProductsUseCase';
import { GetProductByIdUseCase } from '../use-cases/products/GetProductByIdUseCase';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export interface GetProductsRequest {
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

export interface GetProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export class ProductService {
  private getProductsUseCase: GetProductsUseCase;
  private getProductByIdUseCase: GetProductByIdUseCase;

  constructor(productRepository: ProductRepository) {
    this.getProductsUseCase = new GetProductsUseCase(productRepository);
    this.getProductByIdUseCase = new GetProductByIdUseCase(productRepository);
  }

  async getProducts(request: GetProductsRequest): Promise<GetProductsResponse> {
    try {
      const result = await this.getProductsUseCase.execute({
        type: request.type,
        category: request.category,
        minPrice: request.minPrice,
        maxPrice: request.maxPrice,
        currency: request.currency,
        location: request.location,
        page: request.page,
        limit: request.limit,
        search: request.search
      });

      return {
        products: result.products,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
      throw new Error('Failed to fetch products: Unknown error');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const result = await this.getProductByIdUseCase.execute({ id });
      return result.product;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
      throw new Error('Failed to fetch product: Unknown error');
    }
  }

  async getTours(request: Omit<GetProductsRequest, 'type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...request, type: 'tour' });
  }

  async getEvents(request: Omit<GetProductsRequest, 'type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...request, type: 'event' });
  }

  async getTransfers(request: Omit<GetProductsRequest, 'type'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...request, type: 'transfer' });
  }

  async searchProducts(query: string, options?: Omit<GetProductsRequest, 'search'>): Promise<GetProductsResponse> {
    return this.getProducts({ ...options, search: query });
  }
} 