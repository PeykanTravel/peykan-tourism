'use client';

import React from 'react';
import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import { ProgressStep } from '@/lib/types/unified-booking';

interface ProgressBarProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export default function ProgressBar({ 
  steps, 
  currentStep, 
  onStepClick, 
  className = '' 
}: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div className="flex items-center">
              <button
                onClick={() => !step.isDisabled && onStepClick?.(index)}
                disabled={step.isDisabled}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  step.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : step.isDisabled
                    ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 cursor-pointer'
                }`}
              >
                {step.isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              
              {/* Step Info */}
              <div className="mr-4 ml-3">
                <div className={`text-sm font-medium ${
                  step.isActive 
                    ? 'text-gray-900 dark:text-white' 
                    : step.isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-0.5 ${
                  steps[index + 1].isCompleted || steps[index + 1].isActive
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Mobile Progress Bar */}
      <div className="mt-4 lg:hidden">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>مرحله {currentStep + 1} از {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% تکمیل شده</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
} 