'use client';

import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ReservationStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  isError?: boolean;
  errorMessage?: string;
}

interface ReservationStepsProps {
  steps: ReservationStep[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  showStepNumbers?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export default function ReservationSteps({
  steps,
  currentStep,
  onStepClick,
  showStepNumbers = true,
  variant = 'horizontal'
}: ReservationStepsProps) {
  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start">
            <div className="flex-shrink-0">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step.isComplete
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.isActive
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : step.isError
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {step.isComplete ? (
                  <CheckCircle className="w-4 h-4" />
                ) : step.isError ? (
                  <AlertCircle className="w-4 h-4" />
                ) : showStepNumbers ? (
                  <span className="text-xs font-medium">{step.id}</span>
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${
                step.isComplete || step.isActive
                  ? 'text-gray-900'
                  : step.isError
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`}>
                {step.title}
              </h3>
              <p className={`text-xs ${
                step.isComplete || step.isActive
                  ? 'text-gray-500'
                  : step.isError
                  ? 'text-red-500'
                  : 'text-gray-400'
              }`}>
                {step.description}
              </p>
              {step.isError && step.errorMessage && (
                <p className="text-xs text-red-500 mt-1">
                  {step.errorMessage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick?.(step.id)}
            disabled={!step.isActive}
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
              step.isComplete
                ? 'bg-green-500 border-green-500 text-white'
                : step.isActive
                ? 'bg-blue-500 border-blue-500 text-white'
                : step.isError
                ? 'bg-red-500 border-red-500 text-white'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            } ${step.isActive ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
          >
            {step.isComplete ? (
              <CheckCircle className="w-6 h-6" />
            ) : step.isError ? (
              <AlertCircle className="w-6 h-6" />
            ) : showStepNumbers ? (
              <span className="text-sm font-medium">{step.id}</span>
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </button>
          
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              step.isComplete || step.isActive
                ? 'text-gray-900'
                : step.isError
                ? 'text-red-600'
                : 'text-gray-400'
            }`}>
              {step.title}
            </h3>
            <p className={`text-xs ${
              step.isComplete || step.isActive
                ? 'text-gray-500'
                : step.isError
                ? 'text-red-500'
                : 'text-gray-400'
            }`}>
              {step.description}
            </p>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
              step.isComplete
                ? 'bg-green-500'
                : step.isActive
                ? 'bg-blue-500'
                : step.isError
                ? 'bg-red-500'
                : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
} 