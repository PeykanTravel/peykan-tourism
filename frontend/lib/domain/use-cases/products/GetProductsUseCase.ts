import { ProductRepository, ProductFilters } from '../../repositories/ProductRepository';
import { PaginatedResponse } from '../../entities/Common';
import { Product } from '../../entities/Product';

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Product>> {
    // Validate pagination parameters
    if (page < 1) {
      page = 1;
    }
    
    if (limit < 1 || limit > 100) {
      limit = 10;
    }

    // Validate filters
    if (filters) {
      // Validate price range
      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        if (filters.minPrice > filters.maxPrice) {
          // Swap if min > max
          const temp = filters.minPrice;
          filters.minPrice = filters.maxPrice;
          filters.maxPrice = temp;
        }
      }

      // Validate date range
      if (filters.dateFrom && filters.dateTo) {
        const fromDate = new Date(filters.dateFrom);
        const toDate = new Date(filters.dateTo);
        
        if (fromDate > toDate) {
          // Swap if from > to
          filters.dateFrom = filters.dateTo;
          filters.dateTo = filters.dateFrom;
        }
      }

      // Validate sort parameters
      if (filters.sortBy && !['price', 'name', 'rating', 'date'].includes(filters.sortBy)) {
        filters.sortBy = 'name';
      }

      if (filters.sortOrder && !['asc', 'desc'].includes(filters.sortOrder)) {
        filters.sortOrder = 'asc';
      }
    }

    try {
      // Call repository
      const result = await this.productRepository.getProducts(filters, page, limit);
      
      // Additional business logic can be added here
      // e.g., user preference filtering, promotional product highlighting, etc.
      
      return result;
    } catch (error: any) {
      // Return empty result with error handling
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  }
} 