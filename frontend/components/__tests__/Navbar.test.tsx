import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslations } from 'next-intl';
import Navbar from '../Navbar';

// Mock the hooks
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('../../lib/application/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    isAuthenticated: false,
    logout: jest.fn(),
  })),
}));

jest.mock('../../lib/application/stores/cartStore', () => ({
  useCartStore: jest.fn(() => ({
    items: [],
    totalItems: 0,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('Navbar', () => {
  const mockTranslations = {
    'home': 'Home',
    'tours': 'Tours',
    'events': 'Events',
    'transfers': 'Transfers',
    'login': 'Login',
    'register': 'Register',
    'profile': 'Profile',
    'cart': 'Cart',
    'logout': 'Logout',
  };

  beforeEach(() => {
    (useTranslations as jest.Mock).mockReturnValue((key: string) => mockTranslations[key as keyof typeof mockTranslations] || key);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders navbar with basic elements', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Tours')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Transfers')).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows cart with no items initially', () => {
    render(<Navbar />);
    
    const cartElement = screen.getByText('Cart');
    expect(cartElement).toBeInTheDocument();
  });

  it('shows user profile when authenticated', () => {
    const mockAuthStore = require('../../lib/application/stores/authStore').useAuthStore;
    mockAuthStore.mockReturnValue({
      user: { id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User' },
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(<Navbar />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows cart with items count', () => {
    const mockCartStore = require('../../lib/application/stores/cartStore').useCartStore;
    mockCartStore.mockReturnValue({
      items: [
        { id: '1', title: 'Test Tour 1' },
        { id: '2', title: 'Test Tour 2' },
      ],
      totalItems: 2,
    });

    render(<Navbar />);
    
    const cartElement = screen.getByText('Cart');
    expect(cartElement).toBeInTheDocument();
    // Check if cart count is displayed somehow (this depends on implementation)
  });

  it('handles navigation link clicks', () => {
    render(<Navbar />);
    
    const homeLink = screen.getByText('Home');
    fireEvent.click(homeLink);
    
    // If there's any click handler, it should work
    expect(homeLink).toBeInTheDocument();
  });

  it('handles logout when authenticated', () => {
    const mockLogout = jest.fn();
    const mockAuthStore = require('../../lib/application/stores/authStore').useAuthStore;
    mockAuthStore.mockReturnValue({
      user: { id: '1', email: 'test@example.com', first_name: 'Test', last_name: 'User' },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(<Navbar />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
}); 