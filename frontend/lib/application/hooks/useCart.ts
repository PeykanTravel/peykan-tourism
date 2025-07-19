import { useCart as useAppCart } from '../../contexts/AppContext';
import { CartItem } from '../../domain/entities/CartItem';
import { CartService } from '../services/CartService';

export interface UseCartReturn {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  addItem: (item: CartItem) => Promise<void>;
  updateItem: (id: string, item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export function useCart(): UseCartReturn {
  const cartContext = useAppCart();
  // Note: CartService requires CartRepository in constructor
  // For now, we'll use a simplified approach

  const addItem = async (item: CartItem) => {
    try {
      cartContext.setLoading(true);
      cartContext.clearError();
      
      // TODO: Implement proper CartService with repository
      // const cartService = new CartService(cartRepository);
      // await cartService.addItem(item);
      
      // Temporary implementation - directly update context
      cartContext.addItem(item);
    } catch (error: any) {
      cartContext.setError(error.message || 'Failed to add item to cart');
    } finally {
      cartContext.setLoading(false);
    }
  };

  const updateItem = async (id: string, item: CartItem) => {
    try {
      cartContext.setLoading(true);
      cartContext.clearError();
      
      // TODO: Implement proper CartService with repository
      // const cartService = new CartService(cartRepository);
      // await cartService.updateItem(id, item);
      
      // Temporary implementation - directly update context
      cartContext.updateItem(id, item);
    } catch (error: any) {
      cartContext.setError(error.message || 'Failed to update cart item');
    } finally {
      cartContext.setLoading(false);
    }
  };

  const removeItem = async (id: string) => {
    try {
      cartContext.setLoading(true);
      cartContext.clearError();
      
      // TODO: Implement proper CartService with repository
      // const cartService = new CartService(cartRepository);
      // await cartService.removeItem(id);
      
      // Temporary implementation - directly update context
      cartContext.removeItem(id);
    } catch (error: any) {
      cartContext.setError(error.message || 'Failed to remove item from cart');
    } finally {
      cartContext.setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      cartContext.setLoading(true);
      cartContext.clearError();
      
      // TODO: Implement proper CartService with repository
      // const cartService = new CartService(cartRepository);
      // await cartService.clearCart();
      
      // Temporary implementation - directly update context
      cartContext.clearCart();
    } catch (error: any) {
      cartContext.setError(error.message || 'Failed to clear cart');
    } finally {
      cartContext.setLoading(false);
    }
  };

  return {
    items: cartContext.items,
    totalItems: cartContext.totalItems,
    totalPrice: cartContext.totalPrice,
    isLoading: cartContext.isLoading,
    error: cartContext.error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    setItems: cartContext.setItems,
    setLoading: cartContext.setLoading,
    setError: cartContext.setError,
    clearError: cartContext.clearError,
  };
} 