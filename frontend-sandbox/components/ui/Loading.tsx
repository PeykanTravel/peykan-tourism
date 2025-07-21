'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const loadingVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-primary-600',
        secondary: 'text-secondary-600',
        accent: 'text-accent-600',
        white: 'text-white',
        dark: 'text-gray-900',
      },
      size: {
        sm: 'w-4 h-4',
        default: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  fullScreen?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant, size, text, fullScreen, ...props }, ref) => {
    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="text-center">
            <div className={cn(loadingVariants({ variant, size, className }))} ref={ref} {...props}>
              <div className="animate-spin rounded-full border-2 border-current border-t-transparent">
                <div className="sr-only">Loading...</div>
              </div>
            </div>
            {text && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                {text}
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center">
        <div className={cn(loadingVariants({ variant, size, className }))} ref={ref} {...props}>
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent">
            <div className="sr-only">Loading...</div>
          </div>
        </div>
        {text && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

// Pulse Loading
export const PulseLoading = ({ className, size = 'default', ...props }: LoadingProps) => (
  <div className={cn('flex space-x-1', className)} {...props}>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={cn(
          'bg-current rounded-full animate-pulse',
          size === 'sm' && 'w-2 h-2',
          size === 'default' && 'w-3 h-3',
          size === 'lg' && 'w-4 h-4',
          size === 'xl' && 'w-6 h-6'
        )}
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// Dots Loading
export const DotsLoading = ({ className, size = 'default', ...props }: LoadingProps) => (
  <div className={cn('flex space-x-1', className)} {...props}>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className={cn(
          'bg-current rounded-full animate-bounce',
          size === 'sm' && 'w-1 h-1',
          size === 'default' && 'w-2 h-2',
          size === 'lg' && 'w-3 h-3',
          size === 'xl' && 'w-4 h-4'
        )}
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

// Skeleton Loading
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
    {...props}
  />
);

// Shimmer Loading
export const ShimmerLoading = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('relative overflow-hidden', className)} {...props}>
    <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
  </div>
);

export { Loading }; 