import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Cart, 
  CartItem, 
  CartSummary, 
  AddToCartRequest, 
  UpdateCartItemRequest 
} from '../../domain/entities/Cart';
import { cartApi } from '../../infrastructure/api/cart';

interface CartState {
  // State
  cart: Cart | null;
  items: CartItem[];
  summary: CartSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeCart: () => Promise<void>;
  getCart: () => Promise<void>;
  addToCart: (item: AddToCartRequest) => Promise<void>;
  updateCartItem: (itemId: string, updates: UpdateCartItemRequest) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Bulk operations
  addMultipleToCart: (items: AddToCartRequest[]) => Promise<void>;
  removeMultipleCartItems: (itemIds: string[]) => Promise<void>;
  
  // Cart management
  validateCart: () => Promise<boolean>;
  calculatePrices: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  
  // Checkout
  prepareCheckout: () => Promise<any>;
  
  // Utilities
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  findCartItem: (productId: string, productType: string) => CartItem | undefined;
  isProductInCart: (productId: string, productType: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      items: [],
      summary: null,
      isLoading: false,
      error: null,

      // Actions
      initializeCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.getCart();
          set({ 
            cart, 
            items: cart.items || [], 
            isLoading: false 
          });
          
          // Get summary
          const summary = await cartApi.getCartSummary();
          set({ summary });
        } catch (error: any) {
          // If no cart exists, create one
          if (error.status_code === 404) {
            try {
              const newCart = await cartApi.createCart();
              set({ 
                cart: newCart, 
                items: [], 
                isLoading: false 
              });
            } catch (createError: any) {
              set({ 
                error: createError.message || 'Failed to create cart', 
                isLoading: false 
              });
            }
          } else {
            set({ 
              error: error.message || 'Failed to load cart', 
              isLoading: false 
            });
          }
        }
      },

      getCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.getCart();
          const summary = await cartApi.getCartSummary();
          set({ 
            cart, 
            items: cart.items || [], 
            summary, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to load cart', 
            isLoading: false 
          });
        }
      },

      addToCart: async (item: AddToCartRequest) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await cartApi.addToCart(item);
          
          // Update local state
          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(
            i => i.product_id === item.product_id && i.product_type === item.product_type
          );
          
          let updatedItems;
          if (existingItemIndex !== -1) {
            // Update existing item
            updatedItems = [...currentItems];
            updatedItems[existingItemIndex] = newItem;
          } else {
            // Add new item
            updatedItems = [...currentItems, newItem];
          }
          
          set({ items: updatedItems, isLoading: false });
          
          // Refresh cart summary
          await get().calculatePrices();
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to add item to cart', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateCartItem: async (itemId: string, updates: UpdateCartItemRequest) => {
        set({ isLoading: true, error: null });
        try {
          const updatedItem = await cartApi.updateCartItem(itemId, updates);
          
          // Update local state
          const currentItems = get().items;
          const updatedItems = currentItems.map(item =>
            item.id === itemId ? updatedItem : item
          );
          
          set({ items: updatedItems, isLoading: false });
          
          // Refresh cart summary
          await get().calculatePrices();
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update cart item', 
            isLoading: false 
          });
          throw error;
        }
      },

      removeCartItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await cartApi.removeCartItem(itemId);
          
          // Update local state
          const currentItems = get().items;
          const updatedItems = currentItems.filter(item => item.id !== itemId);
          
          set({ items: updatedItems, isLoading: false });
          
          // Refresh cart summary
          await get().calculatePrices();
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to remove cart item', 
            isLoading: false 
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await cartApi.clearCart();
          set({ 
            cart: null, 
            items: [], 
            summary: null, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to clear cart', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Bulk operations
      addMultipleToCart: async (items: AddToCartRequest[]) => {
        set({ isLoading: true, error: null });
        try {
          const newItems = await cartApi.addMultipleToCart(items);
          
          // Update local state
          const currentItems = get().items;
          const updatedItems = [...currentItems, ...newItems];
          
          set({ items: updatedItems, isLoading: false });
          
          // Refresh cart summary
          await get().calculatePrices();
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to add items to cart', 
            isLoading: false 
          });
          throw error;
        }
      },

      removeMultipleCartItems: async (itemIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
          await cartApi.removeMultipleCartItems(itemIds);
          
          // Update local state
          const currentItems = get().items;
          const updatedItems = currentItems.filter(item => !itemIds.includes(item.id));
          
          set({ items: updatedItems, isLoading: false });
          
          // Refresh cart summary
          await get().calculatePrices();
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to remove items from cart', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Cart management
      validateCart: async () => {
        set({ error: null });
        try {
          const result = await cartApi.validateCart();
          if (!result.is_valid) {
            set({ error: 'Some items in your cart are no longer available' });
          }
          return result.is_valid;
        } catch (error: any) {
          set({ error: error.message || 'Cart validation failed' });
          return false;
        }
      },

      calculatePrices: async () => {
        try {
          const summary = await cartApi.calculatePrices();
          set({ summary });
        } catch (error: any) {
          set({ error: error.message || 'Failed to calculate prices' });
        }
      },

      applyCoupon: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const summary = await cartApi.applyCoupon(code);
          set({ summary, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to apply coupon', 
            isLoading: false 
          });
          throw error;
        }
      },

      removeCoupon: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const summary = await cartApi.removeCoupon(code);
          set({ summary, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to remove coupon', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Checkout
      prepareCheckout: async () => {
        set({ isLoading: true, error: null });
        try {
          const checkoutData = await cartApi.prepareCheckout();
          set({ isLoading: false });
          return checkoutData;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to prepare checkout', 
            isLoading: false 
          });
          throw error;
        }
      },

      // Utilities
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      getCartItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      getCartTotal: () => {
        const summary = get().summary;
        return summary?.total?.amount || 0;
      },

      findCartItem: (productId: string, productType: string) => {
        const items = get().items;
        return items.find(item => 
          item.product_id === productId && item.product_type === productType
        );
      },

      isProductInCart: (productId: string, productType: string) => {
        const items = get().items;
        return items.some(item => 
          item.product_id === productId && item.product_type === productType
        );
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        cart: state.cart,
        items: state.items,
        summary: state.summary,
      }),
    }
  )
);

// Initialize cart on store creation
if (typeof window !== 'undefined') {
  useCartStore.getState().initializeCart();
} 