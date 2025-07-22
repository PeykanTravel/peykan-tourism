'use client';

import React from 'react';

interface SpecialRequestsFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function SpecialRequestsField({ 
  value, 
  onChange, 
  label = 'درخواست‌های ویژه', 
  placeholder = 'درخواست‌های خاص خود را بنویسید' 
}: SpecialRequestsFieldProps) {
  return (
    <div className="special-requests-field space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
      />
    </div>
  );
} 