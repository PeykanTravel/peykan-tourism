'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-lg hover:shadow-xl',
        destructive: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-primary-600 bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-500 shadow-lg hover:shadow-xl',
        ghost: 'hover:bg-primary-50 hover:text-primary-600 focus-visible:ring-primary-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
        gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 focus-visible:ring-primary-500 shadow-lg hover:shadow-xl',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus-visible:ring-white/50',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-12 px-8 py-4 text-base',
        xl: 'h-14 px-10 py-5 text-lg',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse-slow',
        bounce: 'animate-bounce',
        float: 'animate-float',
        glow: 'animate-glow',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 