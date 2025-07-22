'use client';

import React from 'react';

interface ParticipantsFieldProps {
  value: { adult: number; child: number; infant: number };
  onChange: (value: { adult: number; child: number; infant: number }) => void;
  label?: string;
  error?: string;
}

export function ParticipantsField({ value, onChange, label = 'شرکت‌کنندگان', error }: ParticipantsFieldProps) {
  const updateCount = (type: 'adult' | 'child' | 'infant', delta: number) => {
    const newValue = { ...value };
    newValue[type] = Math.max(0, newValue[type] + delta);
    
    // Ensure at least one adult
    if (type === 'adult' && newValue.adult === 0) {
      newValue.adult = 1;
    }
    
    onChange(newValue);
  };

  return (
    <div className="participants-field space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
      
      <div className="space-y-3">
        {/* Adults */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">بزرگسال</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">سن 12 سال به بالا</div>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => updateCount('adult', -1)}
              disabled={value.adult <= 1}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
              {value.adult || 0}
            </span>
            <button
              type="button"
              onClick={() => updateCount('adult', 1)}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">کودک</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">سن 2 تا 11 سال</div>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => updateCount('child', -1)}
              disabled={value.child <= 0}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
              {value.child || 0}
            </span>
            <button
              type="button"
              onClick={() => updateCount('child', 1)}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">نوزاد</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">سن کمتر از 2 سال</div>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => updateCount('infant', -1)}
              disabled={value.infant <= 0}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
              {value.infant || 0}
            </span>
            <button
              type="button"
              onClick={() => updateCount('infant', 1)}
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">مجموع شرکت‌کنندگان:</span>
          <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
            {(value.adult || 0) + (value.child || 0) + (value.infant || 0)} نفر
          </span>
        </div>
      </div>
    </div>
  );
} 