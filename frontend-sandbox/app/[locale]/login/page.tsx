'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { login } from '../../../lib/api/auth';
import { useAuth } from '../../../lib/contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const { login: authLogin } = useAuth();
  
  // Get locale from current path
  const locale = typeof window !== 'undefined' ? 
    window.location.pathname.split('/')[1] || 'en' : 'en';
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get redirect URL from query params
  const redirect = searchParams.get('redirect') || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError(t('pleaseFillAllFields'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await login({
        username: formData.username,
        password: formData.password
      });

      if (response.data.requires_email_verification) {
        // Redirect to email verification page with email if available
        if (response.data.email) {
          router.push(`/verify-email?email=${encodeURIComponent(response.data.email)}`);
        } else {
          // If email is not available in response, use the username as it might be an email
          router.push(`/verify-email?email=${encodeURIComponent(formData.username)}`);
        }
        return;
      }

      if (response.data.success) {
        // Check if both user and tokens are available
        if (response.data.user && response.data.tokens) {
          // Use AuthContext to handle login
          authLogin(response.data.user, response.data.tokens);
          
          setSuccess(t('loginSuccess'));
          
          // Check for pending transfer booking
          const pendingBookingData = localStorage.getItem('pendingTransferBooking');
          if (pendingBookingData) {
            try {
              const bookingData = JSON.parse(pendingBookingData);
              // Check if booking is not too old (within 1 hour)
              const isBookingValid = Date.now() - bookingData.timestamp < 60 * 60 * 1000;
              
              if (isBookingValid) {
                // Store booking data for completion
                localStorage.setItem('completeTransferBooking', JSON.stringify(bookingData));
                localStorage.removeItem('pendingTransferBooking');
                
                                 // Redirect to the original booking page
                 setTimeout(() => {
                   router.push(bookingData.returnUrl || `/${locale}/transfers/booking`);
                 }, 1000);
                return;
              } else {
                // Remove expired booking data
                localStorage.removeItem('pendingTransferBooking');
              }
            } catch (error) {
              console.error('Error parsing pending booking data:', error);
              localStorage.removeItem('pendingTransferBooking');
            }
          }
          
          // Redirect after a short delay
          setTimeout(() => {
            router.push(redirect);
          }, 1000);
        } else {
          setError(t('loginError'));
        }
      } else {
        setError(response.data.message || t('loginError'));
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        t('loginError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('loginTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('usernameOrEmail')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder={t('enterUsernameOrEmail')}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder={t('enterPassword')}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-xl">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('loginButton')}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Links */}
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="text-center">
                  <Link
                    href="/register"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 font-medium transition-colors"
                  >
                    {t('noAccount')} <span className="text-blue-600 hover:text-blue-700">{t('registerNow')}</span>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 