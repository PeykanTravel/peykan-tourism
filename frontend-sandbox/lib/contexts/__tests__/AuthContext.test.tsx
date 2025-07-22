import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import '@testing-library/jest-dom';

function TestComponent() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="user">{user ? user.username : 'no-user'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  it('provides default values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  // برای تست مقداردهی کاربر باید mocking انجام شود (در اینجا فقط تست مقداردهی اولیه کافی است)
}); 