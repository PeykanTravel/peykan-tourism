'use client';

import React, { Suspense, lazy } from 'react';
// Simple loading spinner component
function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text,
  className = '' 
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  text?: string;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full animate-spin ${colorClasses[color]}`}
      />
      {text && (
        <p className={`mt-2 text-sm ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <p className="text-gray-600">Something went wrong loading this component.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy Loading Wrapper
function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner size="lg" text="Loading..." />,
  errorFallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Lazy Components
export const LazyTourCard = lazy(() => import('../../components/tours/TourCard'));
export const LazyEventCard = lazy(() => import('../../components/events/EventCard'));
export const LazyTransferCard = lazy(() => import('../../components/transfers/TransferCard'));
export const LazySeatMap = lazy(() => import('../../components/events/SeatMap'));
export const LazyPricingBreakdown = lazy(() => import('../../components/events/PricingBreakdown'));
export const LazyPerformanceSelector = lazy(() => import('../../components/events/PerformanceSelector'));

// Enhanced Lazy Components with Error Handling
export function LazyTourCardWrapper(props: any) {
  return (
    <LazyWrapper
      errorFallback={
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      }
    >
      <LazyTourCard {...props} />
    </LazyWrapper>
  );
}

export function LazyEventCardWrapper(props: any) {
  return (
    <LazyWrapper
      errorFallback={
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      }
    >
      <LazyEventCard {...props} />
    </LazyWrapper>
  );
}

export function LazyTransferCardWrapper(props: any) {
  return (
    <LazyWrapper
      errorFallback={
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      }
    >
      <LazyTransferCard {...props} />
    </LazyWrapper>
  );
}

export function LazySeatMapWrapper(props: any) {
  return (
    <LazyWrapper
      fallback={<LoadingSpinner size="lg" text="Loading seat map..." />}
      errorFallback={
        <div className="text-center p-8">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-gray-600">Failed to load seat map.</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page.</p>
        </div>
      }
    >
      <LazySeatMap {...props} />
    </LazyWrapper>
  );
}

export function LazyPricingBreakdownWrapper(props: any) {
  return (
    <LazyWrapper
      fallback={<LoadingSpinner size="md" text="Calculating pricing..." />}
      errorFallback={
        <div className="text-center p-4">
          <p className="text-gray-600">Failed to load pricing information.</p>
        </div>
      }
    >
      <LazyPricingBreakdown {...props} />
    </LazyWrapper>
  );
}

export function LazyPerformanceSelectorWrapper(props: any) {
  return (
    <LazyWrapper
      fallback={<LoadingSpinner size="md" text="Loading performances..." />}
      errorFallback={
        <div className="text-center p-4">
          <p className="text-gray-600">Failed to load performance options.</p>
        </div>
      }
    >
      <LazyPerformanceSelector {...props} />
    </LazyWrapper>
  );
}

// Utility function for dynamic imports
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyWrapper fallback={fallback} errorFallback={errorFallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
} 