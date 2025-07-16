'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../lib/contexts/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Shield,
  Bell,
  Globe,
  Key,
  LogOut,
  Settings,
  Heart,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { profileService, SensitiveFieldRequest, SensitiveFieldVerify } from '../../../lib/services/profileService';
import { Modal } from '../../../components/ui';
import { useLocale } from 'next-intl';
import toast from 'react-hot-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  city: string;
  country: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const t = useTranslations('profile');
  const { user, updateUser, logout } = useAuth();
  const locale = useLocale();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    date_of_birth: (user as any)?.date_of_birth || '',
    city: (user as any)?.profile?.city || '',
    country: (user as any)?.profile?.country || 'ایران',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // OTP Modal states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpField, setOtpField] = useState<string>('');
  const [otpNewValue, setOtpNewValue] = useState<string>('');
  const [otpMessage, setOtpMessage] = useState<string>('');
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);

  const [otpMethod, setOtpMethod] = useState<'email' | 'phone_number' | null>(null);
  const [showOtpMethodModal, setShowOtpMethodModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  // Add state for phone editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        date_of_birth: (user as any)?.date_of_birth || '',
        city: (user as any)?.profile?.city || '',
        country: (user as any)?.profile?.country || 'ایران',
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check for sensitive field changes
      const sensitiveFields = ['first_name', 'last_name', 'email', 'phone_number'];
      const changedSensitiveFields = sensitiveFields.filter(field => {
        const currentValue = user?.[field as keyof typeof user] || '';
        const newValue = profileData[field as keyof ProfileData];
        return currentValue !== newValue;
      });

      if (changedSensitiveFields.length > 0) {
        // Handle sensitive field changes with OTP
        await handleSensitiveFieldChange(changedSensitiveFields[0]);
        return;
      }

      // Update non-sensitive fields only
      const updateData = {
        user_data: {
          date_of_birth: profileData.date_of_birth,
        },
        profile: {
          city: profileData.city,
          country: profileData.country,
        }
      };

      const result = await profileService.updateBasicProfile(updateData);

      if (result.success) {
        updateUser(result.user);
        setSuccess(t('updateSuccess'));
        toast.success(t('updateSuccess'));
        setIsEditing(false);
      } else {
        setError(result.message || t('updateError'));
        toast.error(result.message || t('updateError'));
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || t('updateError'));
      toast.error(err.message || t('updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSensitiveFieldChange = async (field: string) => {
    setIsRequestingOTP(true);
    setError(null);

    try {
      // بررسی وضعیت تایید ایمیل و تلفن
      if (!user?.is_email_verified && !user?.is_phone_verified) {
        setError(t('verifyContactFirst'));
        setIsRequestingOTP(false);
        return;
      }
      // اگر هر دو تایید شده‌اند، انتخاب روش
      if (user?.is_email_verified && user?.is_phone_verified) {
        setShowOtpMethodModal(true);
        setIsRequestingOTP(false);
        return;
      }
      // اگر فقط یکی تایید شده
      let method: 'email' | 'phone_number' = user?.is_email_verified ? 'email' : 'phone_number';
      await requestSensitiveFieldOtp(field, method);
    } catch (err: any) {
      setError(err.message || t('sensitiveFieldError'));
      toast.error(err.message || t('sensitiveFieldError'));
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const requestSensitiveFieldOtp = async (field: string, method: 'email' | 'phone_number') => {
    const newValue = profileData[field as keyof ProfileData];
    const request: SensitiveFieldRequest = {
      field: field as 'email' | 'phone_number' | 'first_name' | 'last_name',
      new_value: newValue,
      method,
    };
    const result = await profileService.requestSensitiveFieldUpdate(request);
    if (result.success) {
      setOtpField(field);
      setOtpNewValue(newValue);
      setOtpMessage(result.message);
      setShowOTPModal(true);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  const handleOTPVerify = async (otpCode: string) => {
    try {
      const verifyData: SensitiveFieldVerify = {
        field: otpField as 'email' | 'phone_number' | 'first_name' | 'last_name',
        new_value: otpNewValue,
        otp_code: otpCode
      };

      const result = await profileService.verifySensitiveFieldUpdate(verifyData);

      if (result.success) {
        updateUser(result.user);
        setSuccess(t('sensitiveFieldSuccess'));
        toast.success(t('sensitiveFieldSuccess'));
        setShowOTPModal(false);
        setIsEditing(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      throw new Error(err.message || t('otpVerifyError'));
    }
  };

  const handleCancel = () => {
    setProfileData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      date_of_birth: (user as any)?.date_of_birth || '',
      city: (user as any)?.profile?.city || '',
      country: (user as any)?.profile?.country || 'ایران',
    });
    setIsEditing(false);
    setError(null);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch('/api/v1/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const handleResendEmailOTP = async () => {
    const result = await profileService.resendEmailOTP();
    toast.success(result.message);
  };
  
  const handleResendPhoneOTP = async () => {
    const result = await profileService.resendPhoneOTP();
    toast.success(result.message);
  };

  // تابع جدید برای نمایش تاریخ عضویت بر اساس زبان
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (locale === 'fa') {
      // تبدیل ساده میلادی به شمسی (در صورت نیاز می‌توان از کتابخانه استفاده کرد)
      // اینجا فقط نمایش YYYY/MM/DD به سبک شمسی برای نمونه
      const y = date.getFullYear() - 621;
      const m = date.getMonth() + 1;
      const d = date.getDate();
      return `${y}/${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`;
    }
    return date.toLocaleDateString('en-US');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === 'profile' 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {t('personalInfo')}
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === 'orders' 
                        ? 'text-blue-600 bg-blue-50 font-medium' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    {t('ordersTab')}
                  </button>
                  <button 
                    onClick={() => router.push('/wishlist')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {t('wishlistTab')}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <CreditCard className="w-4 h-4" />
                    {t('paymentMethods')}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                    {t('notifications')}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Shield className="w-4 h-4" />
                    {t('security')}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Globe className="w-4 h-4" />
                    {t('languageRegion')}
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {activeTab === 'profile' ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">{t('personalInfo')}</h2>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          {t('editProfile')}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {isLoading ? t('saving') : t('save')}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            {t('cancel')}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm">{success}</p>
                      </div>
                    )}

                    {/* Email & Phone verification status */}
                    <div className="flex flex-col gap-2 mb-6">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{profileData.email}</span>
                        {user?.is_email_verified ? (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{t('verified')}</span>
                        ) : (
                          <>
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">{t('notVerified')}</span>
                            <button
                              onClick={handleResendEmailOTP}
                              className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              {t('resendVerificationCode')}
                            </button>
                          </>
                        )}
                      </div>
                      {/* بخش شماره تلفن */}
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {isEditingPhone ? (
                          <>
                            <input
                              type="tel"
                              id="phone_number"
                              name="phone_number"
                              value={profileData.phone_number}
                              onChange={handleInputChange}
                              placeholder={t('phonePlaceholder')}
                              className="w-40 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                              disabled={isRequestingOTP}
                            />
                            <button
                              onClick={async () => {
                                if (!profileData.phone_number) return;
                                await handleSensitiveFieldChange('phone_number');
                                setIsEditingPhone(false);
                              }}
                              className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
                              disabled={!profileData.phone_number || isRequestingOTP}
                            >
                              {t('saveAndVerifyPhone')}
                            </button>
                            <button
                              onClick={() => {
                                setProfileData(prev => ({ ...prev, phone_number: user?.phone_number || '' }));
                                setIsEditingPhone(false);
                              }}
                              className="ml-2 text-xs text-gray-500 underline hover:text-gray-700"
                            >
                              {t('cancel')}
                            </button>
                          </>
                        ) : profileData.phone_number ? (
                          <>
                            <span className="text-sm">{profileData.phone_number}</span>
                            {user?.is_phone_verified ? (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{t('verified')}</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">{t('notVerified')}</span>
                            )}
                            <button
                              onClick={handleResendPhoneOTP}
                              className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
                              disabled={isRequestingOTP}
                            >
                              {t('resendVerificationCode')}
                            </button>
                            <button
                              onClick={() => setIsEditingPhone(true)}
                              className="ml-2 text-xs text-gray-500 underline hover:text-gray-700"
                            >
                              {t('editPhone')}
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="tel"
                              id="phone_number"
                              name="phone_number"
                              value={profileData.phone_number}
                              onChange={handleInputChange}
                              placeholder={t('phonePlaceholder')}
                              className="w-40 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                              disabled={isRequestingOTP}
                            />
                            <button
                              onClick={async () => {
                                if (!profileData.phone_number) return;
                                await handleSensitiveFieldChange('phone_number');
                              }}
                              className="ml-2 text-xs text-blue-600 underline hover:text-blue-800"
                              disabled={!profileData.phone_number || isRequestingOTP}
                            >
                              {t('addAndVerifyPhone')}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Profile Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('firstName')}
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder={t('firstNamePlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('lastName')}
                        </label>
                        <input
                          type="text"
                          id="last_name"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder={t('lastNamePlaceholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                            value={profileData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder={t('emailPlaceholder')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('dateOfBirth')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="date_of_birth"
                            name="date_of_birth"
                            value={profileData.date_of_birth || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                            placeholder={t('dateOfBirthPlaceholder')}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('country')}
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={profileData.country}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder={t('countryPlaceholder')}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          {t('city')}
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={profileData.city}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder={t('cityPlaceholder')}
                        />
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountInfo')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t('joinDate')}</p>
                          <p className="font-medium text-gray-900">
                            {user?.created_at ? formatDate(String(user.created_at)) : t('unknown')}
                          </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">{t('accountStatus')}</p>
                          <p className="font-medium text-green-600">{t('active')}</p>
                        </div>
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setShowChangePasswordModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
                      >
                        <Key className="w-4 h-4" />
                        {t('changePassword')}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p>تاریخچه سفارشات</p>
                    <p className="text-sm mt-2">این بخش در حال توسعه است</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        <Modal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          title="تایید کد"
        >
          <div className="text-center">
            <p className="mb-4">{otpMessage}</p>
            <input
              type="text"
              placeholder="کد تایید را وارد کنید"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              maxLength={6}
              onChange={(e) => {
                if (e.target.value.length === 6) {
                  handleOTPVerify(e.target.value);
                }
              }}
            />
            <button
              onClick={() => setShowOTPModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
            >
              لغو
            </button>
          </div>
        </Modal>
        
        {/* Modal انتخاب روش دریافت OTP */}
        {showOtpMethodModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-xs w-full">
              <h3 className="text-lg font-semibold mb-4">{t('chooseOtpMethod')}</h3>
              <div className="flex flex-col gap-3 mb-4">
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={async () => {
                    setShowOtpMethodModal(false);
                    await requestSensitiveFieldOtp(otpField || 'email', 'email');
                  }}
                >
                  {t('sendOtpToEmail', { email: user?.email || '' })}
                </button>
                <button
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  onClick={async () => {
                    setShowOtpMethodModal(false);
                    await requestSensitiveFieldOtp(otpField || 'phone_number', 'phone_number');
                  }}
                >
                  {t('sendOtpToPhone', { phone: user?.phone_number || '' })}
                </button>
              </div>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg" onClick={() => setShowOtpMethodModal(false)}>{t('cancel')}</button>
            </div>
          </div>
        )}
        {/* پیام اگر هیچ راه تایید نیست */}
        {error === t('verifyContactFirst') && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">{t('verifyContactFirst')}</p>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleResendEmailOTP}>{t('verifyEmail')}</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={handleResendPhoneOTP}>{t('verifyPhone')}</button>
            </div>
          </div>
        )}
        
        {/* Toast notification */}
        {/* نمایش toast به صورت مستقیم با فراخوانی toast.success یا toast.error در محل مناسب */}
        {/* نیازی به رندر دستی نیست */}
        
        {/* Change Password Modal */}
        <Modal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          title="تغییر رمز عبور"
        >
          <div className="space-y-4">
            <input
              type="password"
              placeholder="رمز عبور فعلی"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              id="current-password"
            />
            <input
              type="password"
              placeholder="رمز عبور جدید"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              id="new-password"
            />
            <input
              type="password"
              placeholder="تایید رمز عبور جدید"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              id="confirm-password"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
              >
                لغو
              </button>
              <button
                onClick={() => {
                  toast.success('رمز عبور با موفقیت تغییر یافت');
                  setShowChangePasswordModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                تغییر رمز
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  );
} 