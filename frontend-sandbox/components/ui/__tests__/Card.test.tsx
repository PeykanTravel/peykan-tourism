import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';
import '@testing-library/jest-dom';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    render(<Card>Default</Card>);
    const card = screen.getByText('Default').closest('div');
    expect(card).toHaveClass('border-gray-200');
  });

  it('applies custom className', () => {
    render(<Card className="custom-card">Custom</Card>);
    const card = screen.getByText('Custom').closest('div');
    expect(card).toHaveClass('custom-card');
  });

  it('applies padding variant', () => {
    render(<Card padding="lg">Padded</Card>);
    const card = screen.getByText('Padded').closest('div');
    expect(card).toHaveClass('p-8');
  });
}); 