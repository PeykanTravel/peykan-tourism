'use client';

import React from 'react';
import { Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'progress';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showIcon?: boolean;
  className?: string;
  progress?: number; // For progress type
  status?: 'loading' | 'success' | 'error';
}

export default function Loading({
  type = 'spinner',
  size = 'md',
  text,
  showIcon = true,
  className = '',
  progress,
  status = 'loading'
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const getIcon = () => {
    if (status === 'success') return <CheckCircle className={`${sizeClasses[size]} text-green-500`} />;
    if (status === 'error') return <AlertCircle className={`${sizeClasses[size]} text-red-500`} />;
    if (status === 'loading') {
      switch (type) {
        case 'spinner':
          return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />;
        case 'dots':
          return <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>;
        case 'progress':
          return <Clock className={`${sizeClasses[size]} text-blue-500`} />;
        default:
          return <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />;
      }
    }
    return null;
  };

  const renderContent = () => {
    switch (type) {
      case 'skeleton':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 mb-2"></div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4"></div>
          </div>
        );

      case 'progress':
        return (
          <div className={`flex flex-col items-center space-y-2 ${className}`}>
            {showIcon && getIcon()}
            {progress !== undefined && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                ></div>
              </div>
            )}
            {text && (
              <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>
                {text} {progress !== undefined && `${Math.round(progress)}%`}
              </span>
            )}
          </div>
        );

      default:
        return (
          <div className={`flex flex-col items-center space-y-2 ${className}`}>
            {showIcon && getIcon()}
            {text && (
              <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>
                {text}
              </span>
            )}
          </div>
        );
    }
  };

  return renderContent();
}

// Specialized loading components
export const Spinner = (props: Omit<LoadingProps, 'type'>) => (
  <Loading type="spinner" {...props} />
);

export const Skeleton = (props: Omit<LoadingProps, 'type'>) => (
  <Loading type="skeleton" {...props} />
);

export const Dots = (props: Omit<LoadingProps, 'type'>) => (
  <Loading type="dots" {...props} />
);

export const Progress = (props: Omit<LoadingProps, 'type'>) => (
  <Loading type="progress" {...props} />
);

// Loading overlay component
export const LoadingOverlay = ({ 
  children, 
  isLoading, 
  text = 'Loading...',
  ...props 
}: LoadingProps & { children: React.ReactNode; isLoading: boolean }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        <Loading text={text} {...props} />
      </div>
    </div>
  );
};

// Loading button component
export const LoadingButton = ({ 
  children, 
  loading, 
  loadingText = 'Loading...',
  disabled,
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
}) => {
  return (
    <button 
      {...props} 
      disabled={disabled || loading}
      className={`flex items-center justify-center space-x-2 ${className}`}
    >
      {loading && <Spinner size="sm" showIcon={true} />}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}; 