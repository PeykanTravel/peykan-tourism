'use client';

import React from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface TextareaFieldProps {
  value?: string;
  onChange: (value: string) => void;
  field: any;
  error?: string;
}

export default function TextareaField({ value, onChange, field, error }: TextareaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const maxLength = field.validation?.maxLength ? 
    parseInt(field.validation.maxLength.match(/\d+/)?.[0] || '500') : 
    500;

  const currentLength = value?.length || 0;
  const isOverLimit = currentLength > maxLength;

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {field.label}
        </span>
        {field.required && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      <div className="relative">
        <textarea
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          rows={4}
          className={`w-full p-4 border rounded-lg resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error || isOverLimit
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          }`}
          maxLength={maxLength}
        />
        
        {/* Character counter */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {currentLength}/{maxLength}
        </div>
      </div>

      {/* Help text */}
      {field.validation?.maxLength && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          حداکثر {maxLength} کاراکتر مجاز است
        </div>
      )}

      {/* Over limit warning */}
      {isOverLimit && (
        <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-700 dark:text-yellow-300">
            متن شما از حد مجاز بیشتر است
          </span>
        </div>
      )}
    </div>
  );
} 