/**
 * Domain Entities Index
 * Exports all domain entities for easy importing
 */

// User Entity
export { User, UserRole } from './User';
export type { UserProfile, UserPreferences } from './User';

// Product Entity
export { Product, ProductType, ProductStatus } from './Product';
export type { 
  ProductImage, 
  ProductVariant, 
  ProductOption 
} from './Product';

// Cart Entity
export { Cart, CartItemType } from './Cart';
export type { 
  CartItem, 
  CartItemOption 
} from './Cart';

// Order Entity
export { 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod 
} from './Order';
export type { 
  OrderItem, 
  OrderItemOption, 
  OrderPayment, 
  OrderParticipant 
} from './Order'; 