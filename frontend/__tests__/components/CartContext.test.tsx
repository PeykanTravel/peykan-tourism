import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartProvider, useCart } from '../../lib/contexts/UnifiedCartContext';
import { AuthProvider } from '../../lib/contexts/AuthContext';

// Mock the auth context
jest.mock('../../lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock the token service
jest.mock('../../lib/services/tokenService', () => ({
  tokenService: {
    getAccessToken: jest.fn(() => null),
    refreshToken: jest.fn(() => Promise.resolve(false)),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const TestComponent = () => {
  const { items, totalItems, totalPrice, addItem, removeItem, clearCart } = useCart();
  
  return (
    <div>
      <div data-testid="item-count">{items.length}</div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice}</div>
      <button 
        onClick={() => addItem({
          product_type: 'tour',
          product_id: 'test-tour-1',
          product_title: 'Test Tour',
          quantity: 1,
          unit_price: 100,
          options_total: 0,
          currency: 'USD',
          booking_date: '2024-01-01',
          booking_time: '10:00:00',
          selected_options: [],
          booking_data: {},
        })}
        data-testid="add-item"
      >
        Add Item
      </button>
      <button 
        onClick={() => removeItem('test-item-1')}
        data-testid="remove-item"
      >
        Remove Item
      </button>
      <button 
        onClick={() => clearCart()}
        data-testid="clear-cart"
      >
        Clear Cart
      </button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  it('should initialize with empty cart', () => {
    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-price')).toHaveTextContent('0');
  });

  it('should add item to cart', async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
      expect(screen.getByTestId('total-items')).toHaveTextContent('1');
      expect(screen.getByTestId('total-price')).toHaveTextContent('100');
    });
  });

  it('should remove item from cart', async () => {
    // First add an item
    localStorage.clear();
    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    });

    // Then remove it
    fireEvent.click(screen.getByTestId('remove-item'));

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).not.toHaveTextContent('1');
    });
    expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    expect(screen.getByTestId('total-items')).toHaveTextContent('0');
    expect(screen.getByTestId('total-price')).toHaveTextContent('0');
  });

  it('should clear cart', async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    // Add items first
    fireEvent.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    });

    // Clear cart
    fireEvent.click(screen.getByTestId('clear-cart'));

    await waitFor(() => {
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
      expect(screen.getByTestId('total-items')).toHaveTextContent('0');
      expect(screen.getByTestId('total-price')).toHaveTextContent('0');
    });
  });

  it('should load cart from localStorage on mount', () => {
    // Set up localStorage with cart data
    const mockCartData = {
      items: [
        {
          id: 'test-item-1',
          product_type: 'tour',
          product_id: 'test-tour-1',
          product_title: 'Test Tour',
          quantity: 1,
          unit_price: 100,
          total_price: 100,
          currency: 'USD',
          booking_date: '2024-01-01',
          booking_time: '10:00:00',
          selected_options: [],
          booking_data: {},
        },
      ],
    };
    localStorage.setItem('cart', JSON.stringify(mockCartData));

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('1');
    expect(screen.getByTestId('total-items')).toHaveTextContent('1');
    expect(screen.getByTestId('total-price')).toHaveTextContent('100');
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.getItem to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = jest.fn(() => {
      throw new Error('Storage error');
    });

    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    expect(screen.getByTestId('item-count')).toHaveTextContent('0');

    // Restore original function
    localStorage.getItem = originalGetItem;
  });

  it('should persist cart to localStorage', async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByTestId('add-item'));

    await waitFor(() => {
      const cartData = localStorage.getItem('cart');
      expect(cartData).toBeTruthy();
      
      const parsedCart = JSON.parse(cartData!);
      expect(parsedCart.items).toHaveLength(1);
      expect(parsedCart.items[0].product_title).toBe('Test Tour');
    });
  });
}); 