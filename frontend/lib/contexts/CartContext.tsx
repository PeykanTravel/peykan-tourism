'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { tokenService } from '../services/tokenService';
import { CartItem, TourCartItem, EventCartItem, TransferCartItem } from '../hooks/useCart';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  isLoading: boolean;
  isClient: boolean;
  addItem: (item: CartItem) => Promise<{ success: boolean; error?: string }>;
  updateItem: (id: string, updates: Partial<CartItem>) => Promise<{ success: boolean; error?: string }>;
  removeItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  clearCart: () => Promise<{ success: boolean; error?: string }>;
  getItemById: (id: string) => CartItem | undefined;
  isInCart: (id: string) => boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Calculate derived values
  const totalItems = items.reduce((total, item) => {
    if (item.type === 'tour') {
      return total + (item as TourCartItem).total_participants;
    } else {
      return total + (item as EventCartItem | TransferCartItem).quantity;
    }
  }, 0);

  const totalPrice = items.reduce((total, item) => {
    if (item.type === 'tour') {
      return total + (item as TourCartItem).subtotal;
    } else if (item.type === 'transfer' && (item as TransferCartItem).pricing_breakdown) {
      return total + (item as TransferCartItem).pricing_breakdown!.final_price;
    } else {
      return total + (item.price * (item as EventCartItem | TransferCartItem).quantity);
    }
  }, 0);

  const currency = items.length > 0 ? items[0].currency : 'USD';

  // Load cart from backend and localStorage on mount
  useEffect(() => {
    setIsClient(true);
    
    // Only load cart when we have complete authentication state
    if (isAuthenticated && user) {
      loadCartFromBackend();
    } else if (!isAuthenticated) {
      loadCartFromLocalStorage();
    }
  }, [isAuthenticated, user]);

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.items || []);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setItems([]);
      }
    } else {
      setItems([]);
    }
    setIsLoading(false);
  };

  const loadCartFromBackend = async () => {
    try {
      const token = tokenService.getAccessToken();
      if (!token) {
        console.warn('No access token found, loading from localStorage');
        loadCartFromLocalStorage();
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://peykantravelistanbul.com/api/v1';
      const response = await fetch(`${API_URL}/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        const backendItems = cartData.items || [];
        
        // Convert backend items to frontend format
        const convertedItems = backendItems.map((item: any) => {
          if (item.product_type === 'transfer') {
            return {
              id: item.id,
              type: 'transfer',
              title: item.product_title,
              price: parseFloat(item.unit_price),
              currency: item.currency,
              quantity: item.quantity,
              slug: item.product_slug || '',
              
              // Transfer-specific fields
              route_id: item.booking_data?.route_id || '',
              route_data: {
                id: item.booking_data?.route_id || '',
                name: item.product_title || '',
                name_display: item.product_title || '',
                origin: item.booking_data?.pickup_address || '',
                destination: item.booking_data?.dropoff_address || '',
                distance_km: 0,
                estimated_duration_minutes: 0
              },
              vehicle_type: item.booking_data?.vehicle_type || 'sedan',
              trip_type: item.booking_data?.trip_type || 'one_way',
              outbound_datetime: item.booking_data?.outbound_datetime || '',
              return_datetime: item.booking_data?.return_datetime || '',
              passenger_count: item.booking_data?.passenger_count || 1,
              luggage_count: item.booking_data?.luggage_count || 0,
              pickup_address: item.booking_data?.pickup_address || '',
              dropoff_address: item.booking_data?.dropoff_address || '',
              contact_name: item.booking_data?.contact_name || '',
              contact_phone: item.booking_data?.contact_phone || '',
              selected_options: item.selected_options || [],
              special_requirements: item.booking_data?.special_requirements || '',
              
              // Pricing breakdown
              pricing_breakdown: {
                base_price: parseFloat(item.unit_price),
                time_surcharge: 0,
                round_trip_discount: 0,
                options_total: parseFloat(item.options_total || '0'),
                final_price: parseFloat(item.total_price),
                currency: item.currency
              }
            } as TransferCartItem;
          } else if (item.product_type === 'tour') {
            return {
              id: item.id,
              type: 'tour',
              title: item.product_title,
              price: parseFloat(item.unit_price),
              currency: item.currency,
              image: item.product_image || '',
              duration: item.booking_data?.duration || '',
              location: item.booking_data?.location || '',
              
              // Tour-specific fields
              tour_id: item.product_id,
              schedule_id: item.booking_data?.schedule_id || '',
              variant_id: item.variant_id || '',
              participants: item.booking_data?.participants || { adult: 1, child: 0, infant: 0 },
              selected_options: item.selected_options || [],
              special_requests: item.booking_data?.special_requests || '',
              
              // Calculated fields
              total_participants: (item.booking_data?.participants?.adult || 0) + 
                                (item.booking_data?.participants?.child || 0) + 
                                (item.booking_data?.participants?.infant || 0),
              unit_price: parseFloat(item.unit_price),
              options_total: parseFloat(item.options_total || '0'),
              subtotal: parseFloat(item.total_price)
            } as TourCartItem;
          } else {
            return {
              id: item.id,
              type: 'event',
              title: item.product_title,
              price: parseFloat(item.unit_price),
              quantity: item.quantity,
              currency: item.currency,
              date: item.booking_data?.performance_date || item.booking_data?.date || '',
              time: item.booking_data?.performance_time || item.booking_data?.time || '',
              variant: item.variant_name || '',
              variant_name: item.variant_name || '',
              options: item.selected_options || {},
              special_requests: item.booking_data?.special_requests || '',
              image: item.product_image || '',
              duration: item.booking_data?.duration || '',
              location: item.booking_data?.venue_name || item.booking_data?.location || '',
              
              // Preserve the complete booking_data for detailed event information
              booking_data: item.booking_data || {},
              selected_options: item.selected_options || []
            } as EventCartItem;
          }
        });
        
        setItems(convertedItems);
      } else {
        console.error('Failed to load cart from backend:', response.status);
        loadCartFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading cart from backend:', error);
      loadCartFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (newItem: CartItem): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check authentication first
      if (!isAuthenticated || !user) {
        // For guests, add to localStorage
        if (newItem.type === 'transfer') {
          // For transfers, always create a new item (no quantity merging)
          setItems(prevItems => {
            // Remove any existing transfer item (only one transfer allowed)
            const filteredItems = prevItems.filter(item => item.type !== 'transfer');
            return [...filteredItems, newItem];
          });
        } else if (newItem.type === 'tour') {
          // For tours, always create a new item (no quantity merging)
          setItems(prevItems => {
            const filteredItems = prevItems.filter(item => item.id !== newItem.id);
            return [...filteredItems, newItem];
          });
        } else {
          // For events, check if same item exists
          setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => 
              item.id === newItem.id && item.type === newItem.type
            );
            
            if (existingItemIndex >= 0) {
              // Update existing item quantity
              const updatedItems = [...prevItems];
              const existingItem = updatedItems[existingItemIndex] as EventCartItem;
              const newItemTyped = newItem as EventCartItem;
              updatedItems[existingItemIndex] = {
                ...existingItem,
                quantity: existingItem.quantity + newItemTyped.quantity
              };
              return updatedItems;
            } else {
              // Add new item
              return [...prevItems, newItem];
            }
          });
        }
        
        // Update localStorage
        const updatedItems = [...items, newItem];
        localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
        return { success: true };
      }
      
      // For authenticated users, the backend API call should be handled by the specific components
      // But we refresh the cart from backend after adding to get latest data
      await loadCartFromBackend();
      return { success: true };
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return { success: false, error: 'Failed to add item to cart' };
    }
  };

  const updateItem = async (id: string, updates: Partial<CartItem>): Promise<{ success: boolean; error?: string }> => {
    try {
      // First update the backend if authenticated
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (token) {
          const response = await fetch(`http://localhost:8000/api/v1/cart/items/${id}/update/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
          });

          if (response.ok) {
            // Backend update successful, refresh cart from backend
            await loadCartFromBackend();
            return { success: true };
          } else {
            console.error('Failed to update cart item on backend:', response.status);
            // Continue with local update as fallback
          }
        }
      }

      // Local update (for unauthenticated users or as fallback)
      setItems(prevItems =>
        prevItems.map(item => {
          if (item.id === id) {
            return { ...item, ...updates } as CartItem;
          }
          return item;
        })
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return { success: false, error: 'Failed to update cart item' };
    }
  };

  const removeItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // First remove from backend if authenticated
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (token) {
          const response = await fetch(`http://localhost:8000/api/v1/cart/items/${id}/remove/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            // Backend removal successful, refresh cart from backend
            await loadCartFromBackend();
            return { success: true };
          } else {
            console.error('Failed to remove cart item from backend:', response.status);
            // Continue with local removal as fallback
          }
        }
      }

      // Local removal (for unauthenticated users or as fallback)
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error removing cart item:', error);
      return { success: false, error: 'Failed to remove cart item' };
    }
  };

  const clearCart = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // First clear from backend if authenticated
      if (isAuthenticated) {
        const token = tokenService.getAccessToken();
        if (token) {
          const response = await fetch('http://localhost:8000/api/v1/cart/clear/', {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            // Backend clear successful, refresh cart from backend
            await loadCartFromBackend();
            return { success: true };
          } else {
            console.error('Failed to clear cart on backend:', response.status);
            // Continue with local clear as fallback
          }
        }
      }

      // Local clear (for unauthenticated users or as fallback)
      setItems([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'Failed to clear cart' };
    }
  };

  const getItemById = (id: string): CartItem | undefined => {
    return items.find(item => item.id === id);
  };

  const isInCart = (id: string): boolean => {
    return items.some(item => item.id === id);
  };

  const refreshCart = async (): Promise<void> => {
    if (isAuthenticated && user) {
      await loadCartFromBackend();
    } else {
      loadCartFromLocalStorage();
    }
  };

  const value = {
    items,
    totalItems,
    totalPrice,
    currency,
    isLoading,
    isClient,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getItemById,
    isInCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 