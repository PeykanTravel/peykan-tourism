/**
 * Toaster Component
 * 
 * A simple wrapper for react-hot-toast
 */

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 4000,
          style: {
            background: '#10b981',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
          },
        },
      }}
    />
  );
} 