/**
 * Toast Context
 * 
 * Manages toast notifications and provides toast methods
 */

'use client';

import React, { createContext, useContext, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  showLoading: (message: string) => string;
  dismiss: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
      },
    });
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  const value: ToastContextType = {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 