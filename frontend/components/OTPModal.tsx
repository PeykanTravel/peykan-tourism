'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw, Loader2 } from 'lucide-react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
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
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(300);
      setCanResend(false);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    
    try {
      await onVerify(otpValue);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Invalid OTP code');
    }
  };

  const handleResend = async () => {
    setTimeLeft(300);
    setCanResend(false);
    setError('');
    // In a real app, you would call the resend API here
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Verify OTP
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              {message}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>{field}:</strong> {newValue}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {timeLeft > 0 ? (
                  <>Time remaining: <span className="font-mono font-semibold">{formatTime(timeLeft)}</span></>
                ) : (
                  <span className="text-red-600">Code expired</span>
                )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Resend Button */}
            {canResend && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 mx-auto"
                >
                  <RefreshCw className="h-4 w-4" />
                  Resend Code
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 