/**
 * Modern Button Component
 * 
 * A comprehensive button component with multiple variants,
 * sizes, and states following modern design principles
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        // Primary variants
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
        'primary-outline': 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        'primary-ghost': 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        
        // Secondary variants
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-sm',
        'secondary-outline': 'border border-secondary-600 text-secondary-600 hover:bg-secondary-50 focus:ring-secondary-500',
        'secondary-ghost': 'text-secondary-600 hover:bg-secondary-50 focus:ring-secondary-500',
        
        // Success variants
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
        'success-outline': 'border border-success-600 text-success-600 hover:bg-success-50 focus:ring-success-500',
        
        // Warning variants
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm',
        'warning-outline': 'border border-warning-600 text-warning-600 hover:bg-warning-50 focus:ring-warning-500',
        
        // Error variants
        error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-sm',
        'error-outline': 'border border-error-600 text-error-600 hover:bg-error-50 focus:ring-error-500',
        
        // Neutral variants
        neutral: 'bg-neutral-600 text-white hover:bg-neutral-700 focus:ring-neutral-500 shadow-sm',
        'neutral-outline': 'border border-neutral-600 text-neutral-600 hover:bg-neutral-50 focus:ring-neutral-500',
        'neutral-ghost': 'text-neutral-600 hover:bg-neutral-50 focus:ring-neutral-500',
        
        // Special variants
        link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500',
        'text-link': 'text-primary-600 hover:text-primary-700 focus:ring-primary-500',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'opacity-75 pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 