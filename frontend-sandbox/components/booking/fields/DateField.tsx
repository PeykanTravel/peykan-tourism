'use client';

import React from 'react';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function DateField({ value, onChange, label = 'تاریخ', placeholder = 'تاریخ را انتخاب کنید' }: DateFieldProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="date-field space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={today}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        placeholder={placeholder}
      />
    </div>
  );
} 