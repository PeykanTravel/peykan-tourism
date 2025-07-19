import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    hover = false,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200';
    
    const variantClasses = {
      default: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800',
      elevated: 'bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800',
      outlined: 'bg-transparent border-2 border-zinc-200 dark:border-zinc-800',
      interactive: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer'
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6'
    };
    
    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
    
    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex items-start justify-between', className)}
        ref={ref}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={cn('flex-1', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'start', children, ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between'
    };
    
    return (
      <div
        className={cn('flex items-center gap-2', justifyClasses[justify], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card; 