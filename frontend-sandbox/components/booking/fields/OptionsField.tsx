'use client';

import React from 'react';

interface Option {
  id: string;
  name: string;
  price: number;
}

interface OptionsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  label?: string;
}

export function OptionsField({ value, onChange, options, label = 'گزینه‌های اضافی' }: OptionsFieldProps) {
  const handleOptionToggle = (optionId: string) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    
    onChange(newValue);
  };

  const selectedOptions = options.filter(option => value.includes(option.id));
  const totalPrice = selectedOptions.reduce((sum, option) => sum + option.price, 0);

  return (
    <div className="options-field space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <input
                type="checkbox"
                id={option.id}
                checked={value.includes(option.id)}
                onChange={() => handleOptionToggle(option.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor={option.id} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {option.name}
              </label>
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {option.price.toLocaleString()} تومان
            </span>
          </div>
        ))}
      </div>

      {selectedOptions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            گزینه‌های انتخاب شده: {selectedOptions.map(opt => opt.name).join(', ')}
          </div>
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mt-1">
            قیمت کل گزینه‌ها: {totalPrice.toLocaleString()} تومان
          </div>
        </div>
      )}
    </div>
  );
} 