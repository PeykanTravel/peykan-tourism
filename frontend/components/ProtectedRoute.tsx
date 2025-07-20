'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/contexts/AuthContext';
import { useTranslations } from 'next-intl';

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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  // Extract locale from pathname
  const locale = pathname.startsWith('/fa') ? 'fa' : 
                 pathname.startsWith('/tr') ? 'tr' : 'en';
  
  const prefix = locale === 'en' ? '' : `/${locale}`;

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        router.push(`${prefix}${redirectTo}`);
      } else if (!requireAuth && isAuthenticated) {
        // Redirect to home if user is authenticated but page doesn't require auth (like login/register)
        router.push(`${prefix}/`);
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router, prefix]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show content if authentication requirements are met
  if ((requireAuth && isAuthenticated) || (!requireAuth && !isAuthenticated)) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
} 