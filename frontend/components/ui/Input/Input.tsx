import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    
    const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const stateClasses = error 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50 dark:border-red-600 dark:focus:border-red-500'
      : 'border-zinc-300 focus:border-apple-primary focus:ring-apple-primary/50 dark:border-zinc-600 dark:focus:border-apple-primary-dark';
    
    const paddingClasses = leftIcon || rightIcon 
      ? 'pl-10 pr-10' 
      : 'px-4';
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              baseClasses,
              stateClasses,
              paddingClasses,
              'py-2',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 