'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
// Updated import for new auth store
import { useAuthStore } from '../../../lib/application/stores/authStore';
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

interface EditingField {
  field: string;
  value: string;
  label: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('profile');
  
  // New store usage
  const { user, isAuthenticated, logout, changePassword, isLoading: authLoading } = useAuthStore();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    city: '',
    country: ''
  });
  
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [currentOTPRequest, setCurrentOTPRequest] = useState<SensitiveFieldRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.getFirstName() || '',
        last_name: user.getLastName() || '',
        email: user.getEmail() || '',
        phone_number: user.getContactInfo().getPhone() || '',
        date_of_birth: user.getProfile().dateOfBirth?.toISOString().split('T')[0] || '',
        city: '', // These might not be in the user object
        country: ''
      });
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleEdit = (field: string, value: string, label: string) => {
    setEditingField({ field, value, label });
  };

  const handleSave = async () => {
    if (!editingField || !user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const isSensitiveField = ['email', 'phone_number'].includes(editingField.field);
      
      if (isSensitiveField) {
                  // Handle sensitive field update
          const request: SensitiveFieldRequest = {
            field: editingField.field as 'email' | 'first_name' | 'last_name' | 'phone_number',
            new_value: editingField.value
          };
        
        await profileService.requestSensitiveFieldUpdate(request);
        setCurrentOTPRequest(request);
        setShowOTPModal(true);
        setEditingField(null);
      } else {
        // Handle regular field update
        const updateData = {
          [editingField.field]: editingField.value
        };
        
        await profileService.updateBasicProfile(updateData);
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          [editingField.field]: editingField.value
        }));
        
        setSuccess(t('profileUpdated'));
        setEditingField(null);
      }
    } catch (error: any) {
      setError(error.message || t('updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode: string) => {
    if (!currentOTPRequest) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const verifyRequest: SensitiveFieldVerify = {
        field: currentOTPRequest.field,
        new_value: currentOTPRequest.new_value,
        otp_code: otpCode
      };
      
      await profileService.verifySensitiveFieldUpdate(verifyRequest);
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        [currentOTPRequest.field]: currentOTPRequest.new_value
      }));
      
      setSuccess(t('fieldUpdated'));
      setShowOTPModal(false);
      setCurrentOTPRequest(null);
    } catch (error: any) {
      setError(error.message || t('verificationError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      throw new Error(t('passwordsDontMatch'));
    }
    
    setIsLoading(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      setSuccess(t('passwordChanged'));
      setShowChangePassword(false);
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('خطا در خروج:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.getFirstName()} {user.getLastName()}
                  </h1>
                  <p className="text-gray-600">
                    {user.getEmail()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-600">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t('personalInformation')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile fields */}
              {[
                { field: 'first_name', label: t('firstName'), icon: User, value: profileData.first_name },
                { field: 'last_name', label: t('lastName'), icon: User, value: profileData.last_name },
                { field: 'email', label: t('email'), icon: Mail, value: profileData.email },
                { field: 'phone_number', label: t('phoneNumber'), icon: Phone, value: profileData.phone_number },
                { field: 'date_of_birth', label: t('dateOfBirth'), icon: Calendar, value: profileData.date_of_birth },
                { field: 'city', label: t('city'), icon: MapPin, value: profileData.city },
                { field: 'country', label: t('country'), icon: MapPin, value: profileData.country }
              ].map(({ field, label, icon: Icon, value }) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <div className="flex items-center">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      {editingField?.field === field ? (
                        <input
                          type={field === 'email' ? 'email' : field === 'date_of_birth' ? 'date' : 'text'}
                          value={editingField.value}
                          onChange={(e) => setEditingField({
                            ...editingField,
                            value: e.target.value
                          })}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder={label}
                        />
                      ) : (
                        <div className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900">
                          {field === 'date_of_birth' ? formatDate(value) : value || t('notSet')}
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      {editingField?.field === field ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingField(null)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(field, value, label)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {t('securitySettings')}
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Key className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {t('changePassword')}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {/* TODO: Add ChangePasswordModal component
      {showChangePassword && (
        <Modal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
          title={t('changePassword')}
        >
          <ChangePasswordModal
            isOpen={showChangePassword}
            onClose={() => setShowChangePassword(false)}
            onSubmit={handleChangePassword}
            isLoading={isLoading}
            t={t}
          />
        </Modal>
      )}
      */}

      {/* OTP Modal */}
      {/* TODO: Add OTPModal component
      {showOTPModal && currentOTPRequest && (
        <Modal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          title={t('verifyChange')}
        >
          <OTPModal
            isOpen={showOTPModal}
            onClose={() => setShowOTPModal(false)}
            onVerify={handleOTPVerify}
            field={currentOTPRequest.field}
            newValue={currentOTPRequest.new_value}
            message="Please enter the OTP sent to your device"
            isLoading={isLoading}
          />
        </Modal>
      )}
      */}
    </ProtectedRoute>
  );
} 