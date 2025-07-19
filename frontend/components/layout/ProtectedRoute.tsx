'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/application/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Extract locale from pathname
  const locale = pathname.startsWith('/fa') ? 'fa' : 
                 pathname.startsWith('/tr') ? 'tr' : 'en';
  
  const prefix = locale === 'en' ? '' : `/${locale}`;

  useEffect(() => {
    // Prevent multiple redirects
    if (isLoading || hasRedirected) return;

    const isAuthenticated = !!user;

    if (requireAuth && !isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      setHasRedirected(true);
      router.push(`${prefix}${redirectTo}`);
    } else if (!requireAuth && isAuthenticated) {
      // Redirect to home if user is authenticated but page doesn't require auth (like login/register)
      setHasRedirected(true);
      router.push(`${prefix}/`);
    }
  }, [user, isLoading, requireAuth, redirectTo, router, prefix, hasRedirected]);

  // Reset redirect flag when auth state changes
  useEffect(() => {
    setHasRedirected(false);
  }, [user]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Show content if authentication requirements are met
  const isAuthenticated = !!user;
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return <>{children}</>;
  }

  // Return loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">در حال انتقال...</p>
      </div>
    </div>
  );
} 