'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  errorFallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  errorFallback,
  onLoad,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      errorFallback || (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
          <ImageOff className="w-8 h-8 text-gray-400" />
        </div>
      )
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      <Image
        {...props}
        src={hasError ? fallback : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
} 