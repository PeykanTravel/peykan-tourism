'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
// Updated import for new auth store
import { useAuthStore } from '../../../lib/application/stores/authStore';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations('auth');
  
  // New store usage
  const { register, login, isLoading: authLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t('enterValidVerificationCode'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the new auth store's verifyEmail method
      await login({
        username: userEmail,
        password: formData.password
      });
      
      setSuccess(t('emailVerifiedSuccessfully'));
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || t('verificationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.password_confirm) {
      setError(t('pleaseFillAllFields'));
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError(t('passwordsDontMatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the new auth store's register method
      const response = await register({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password_confirm: formData.password_confirm
      });

      if (response.requires_email_verification || response.email_verification_required) {
        console.log('Email verification required - showing verification form');
        setUserEmail(response.email || formData.email);
        setShowVerification(true);
        setSuccess(t('verificationEmailSent'));
      } else {
        // Direct registration success
        console.log('Direct registration success');
        setSuccess(t('registerSuccess'));
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
      
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || t('registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('registerTitle')}
            </h1>
            <p className="text-gray-600">
              {t('registerSubtitle')}
            </p>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-200">
            {showVerification ? (
              /* Verification Form */
              <form onSubmit={handleVerification} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('verifyYourEmail')}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {t('verificationCodeSentTo')} {userEmail}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="verification-code" className="block text-sm font-semibold text-gray-700">
                    {t('verificationCode')}
                  </label>
                  <input
                    type="text"
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-center text-lg font-mono"
                    placeholder="000000"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('verifying')}
                    </div>
                  ) : (
                    t('verifyEmail')
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowVerification(false)}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    {t('backToRegister')}
                  </button>
                </div>
              </form>
            ) : (
              /* Registration Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                    {t('username')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder={t('enterUsername')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder={t('enterEmail')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700">
                      {t('firstName')}
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder={t('enterFirstName')}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700">
                      {t('lastName')}
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder={t('enterLastName')}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
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
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
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
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password_confirm" className="block text-sm font-semibold text-gray-700">
                    {t('confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      placeholder={t('confirmYourPassword')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{t('registering')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('registerButton')}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Links */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    {t('alreadyHaveAccount')} <span className="text-blue-600 hover:text-blue-700">{t('loginNow')}</span>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 