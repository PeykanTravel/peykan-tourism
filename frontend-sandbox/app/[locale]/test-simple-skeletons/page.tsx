'use client';

import React, { useState, useEffect } from 'react';

// Simple Loading Skeleton Component
const SimpleSkeleton = ({ type, count = 1 }: { type: 'card' | 'list', count?: number }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className="bg-white border-2 border-gray-300 rounded-lg p-4 space-y-3 shadow-md">
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            {/* Content placeholders */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div key={index} className="flex items-center space-x-4 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-md">
            {/* Avatar placeholder */}
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            {/* Content placeholders */}
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {skeletons.map(renderSkeleton)}
    </div>
  );
};

export default function TestSimpleSkeletonsPage() {
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🎯 Simple Skeletons Page loaded');
    setShowSkeletons(true);
  }, []);

  const handleTest = () => {
    console.log('🎯 Test button clicked');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">تست ساده Loading Skeletons</h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-4">کنترل‌ها</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSkeletons(!showSkeletons)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showSkeletons ? 'مخفی کردن' : 'نمایش'}
            </button>
            
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'در حال بارگذاری...' : 'تست بارگذاری'}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Status: {showSkeletons ? 'نمایش داده می‌شود' : 'مخفی شده'}
          </div>
        </div>

        {/* Skeletons */}
        {showSkeletons && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Card Skeletons</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SimpleSkeleton type="card" count={1} />
                <SimpleSkeleton type="card" count={1} />
                <SimpleSkeleton type="card" count={1} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">List Skeletons</h3>
              <div className="space-y-4">
                <SimpleSkeleton type="list" count={3} />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Multiple Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SimpleSkeleton type="card" count={2} />
              </div>
            </div>
          </div>
        )}

        {/* Loading Demo */}
        {isLoading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">شبیه‌سازی بارگذاری</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SimpleSkeleton type="card" count={2} />
              <SimpleSkeleton type="list" count={4} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 