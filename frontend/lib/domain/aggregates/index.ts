/**
 * Domain Aggregates
 * Groups entities and value objects with business rules
 */

export { UserAggregate } from './UserAggregate';
export type { UserProfile, UserPreferences } from './UserAggregate';

export { ProductAggregate } from './ProductAggregate';
export type { ProductMetadata } from './ProductAggregate';

export { CartAggregate } from './CartAggregate';
export type { CartSummary, CartValidationResult } from './CartAggregate';

export { OrderAggregate } from './OrderAggregate';
export type { 
  OrderSummary, 
  OrderValidationResult, 
  OrderWorkflowStep 
} from './OrderAggregate'; 