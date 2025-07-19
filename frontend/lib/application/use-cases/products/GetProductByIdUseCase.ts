import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { Product } from '../../../domain/entities/Product';

export interface GetProductByIdUseCaseRequest {
  id: string;
}

export interface GetProductByIdUseCaseResponse {
  product: Product;
}

export class GetProductByIdUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: GetProductByIdUseCaseRequest): Promise<GetProductByIdUseCaseResponse> {
    try {
      // Validate input
      if (!request.id) {
        throw new Error('Product ID is required');
      }

      // Get product
      const result = await this.productRepository.findById(request.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Product not found');
      }

      if (!result.product) {
        throw new Error('Product not found');
      }

      return {
        product: result.product
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
      throw new Error('Failed to fetch product: Unknown error');
    }
  }
} 