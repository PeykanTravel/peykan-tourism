'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otpCode: string) => Promise<void>;
  field: string;
  newValue: string;
  message: string;
  isLoading?: boolean;
}

export default function OTPModal({
  isOpen,
  onClose,
  onVerify,
  field,
  newValue,
  message,
  isLoading = false
}: OTPModalProps) {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOtpCode('');
      setError('');
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (!otpCode.trim()) {
      setError('لطفاً کد تایید را وارد کنید');
      return;
    }

    if (otpCode.length !== 6) {
      setError('کد تایید باید 6 رقم باشد');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await onVerify(otpCode);
    } catch (err: any) {
      setError(err.message || 'خطا در تایید کد');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'email':
        return 'ایمیل';
      case 'phone_number':
        return 'شماره تلفن';
      case 'first_name':
        return 'نام';
      case 'last_name':
        return 'نام خانوادگی';
      default:
        return field;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                تایید تغییر {getFieldLabel(field)}
              </h3>
              <p className="text-sm text-gray-500">
                برای امنیت بیشتر، کد تایید ارسال شده را وارد کنید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isVerifying}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium mb-1">
                  {message}
                </p>
                <p className="text-xs text-blue-600">
                  کد تایید به {field === 'email' ? 'ایمیل' : 'شماره تلفن'} شما ارسال شده است
                </p>
              </div>
            </div>
          </div>

          {/* Field Info */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {getFieldLabel(field)} جدید:
              </span>
              <span className="text-sm font-medium text-gray-900">
                {newValue}
              </span>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-6">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              کد تایید 6 رقمی
            </label>
            <input
              type="text"
              id="otp"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
              maxLength={6}
              disabled={isVerifying}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying || !otpCode.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال تایید...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  تایید
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 