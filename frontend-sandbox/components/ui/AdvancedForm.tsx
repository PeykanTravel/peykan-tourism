'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, EyeOff, Search, Calendar, MapPin } from 'lucide-react';

interface AdvancedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  className?: string;
}

export function AdvancedInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  success = false,
  icon,
  autoComplete,
  className = ''
}: AdvancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <motion.label
        className={`absolute left-3 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? 'text-xs text-blue-600 dark:text-blue-400 -top-2 bg-white dark:bg-gray-800 px-2'
            : 'text-sm text-gray-500 dark:text-gray-400 top-3'
        }`}
        initial={false}
        animate={{
          y: isFocused || value ? -8 : 0,
          scale: isFocused || value ? 0.85 : 1
        }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-300
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-12' : ''}
            ${isFocused 
              ? 'border-blue-500 ring-2 ring-blue-500/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${error 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : ''
            }
            ${success 
              ? 'border-green-500 ring-2 ring-green-500/20' 
              : ''
            }
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none
          `}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* Success Icon */}
        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500"
          >
            <Check size={20} />
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AdvancedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; price?: number }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function AdvancedSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  className = ''
}: AdvancedSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      <motion.label
        className={`absolute left-3 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? 'text-xs text-blue-600 dark:text-blue-400 -top-2 bg-white dark:bg-gray-800 px-2'
            : 'text-sm text-gray-500 dark:text-gray-400 top-3'
        }`}
        initial={false}
        animate={{
          y: isFocused || value ? -8 : 0,
          scale: isFocused || value ? 0.85 : 1
        }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Select Container */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-300 text-left
            ${isFocused 
              ? 'border-blue-500 ring-2 ring-blue-500/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            ${error 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : ''
            }
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-3 text-left transition-colors duration-200
                    ${option.value === value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {option.price && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {option.price.toLocaleString()} تومان
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AdvancedCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  price?: number;
  className?: string;
}

export function AdvancedCheckbox({
  label,
  checked,
  onChange,
  description,
  price,
  className = ''
}: AdvancedCheckboxProps) {
  return (
    <motion.div
      className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
        checked
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      } ${className}`}
      onClick={() => onChange(!checked)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1">
        <motion.div
          className={`w-5 h-5 border-2 rounded transition-colors duration-200 ${
            checked
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          animate={{
            scale: checked ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center w-full h-full"
            >
              <Check size={14} className="text-white" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`font-medium transition-colors duration-200 ${
            checked
              ? 'text-blue-900 dark:text-blue-100'
              : 'text-gray-900 dark:text-white'
          }`}>
            {label}
          </h3>
          {price && (
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {price.toLocaleString()} تومان
            </span>
          )}
        </div>
        {description && (
          <p className={`mt-1 text-sm transition-colors duration-200 ${
            checked
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface AdvancedNumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  error?: string;
  className?: string;
}

export function AdvancedNumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  required = false,
  error,
  className = ''
}: AdvancedNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <motion.label
        className={`absolute left-3 transition-all duration-300 pointer-events-none ${
          isFocused || value > 0
            ? 'text-xs text-blue-600 dark:text-blue-400 -top-2 bg-white dark:bg-gray-800 px-2'
            : 'text-sm text-gray-500 dark:text-gray-400 top-3'
        }`}
        initial={false}
        animate={{
          y: isFocused || value > 0 ? -8 : 0,
          scale: isFocused || value > 0 ? 0.85 : 1
        }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </motion.label>

      {/* Input Container */}
      <div className="relative">
        <div className="flex items-center border rounded-lg transition-all duration-300 bg-white dark:bg-gray-800">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="px-3 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Number Display */}
          <div className="flex-1 px-4 py-3 text-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {value}
            </span>
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="px-3 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 