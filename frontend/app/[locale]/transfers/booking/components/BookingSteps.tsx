'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle } from 'lucide-react';
import { BookingStep } from '@/lib/types/transfers';

interface Step {
  key: BookingStep;
  title: string;
  description: string;
}

interface BookingStepsProps {
  steps: Step[];
  currentStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
  isStepValid: (step: BookingStep) => boolean;
}

export default function BookingSteps({ steps, currentStep, onStepClick, isStepValid }: BookingStepsProps) {
  const t = useTranslations('transfers');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getStepStatus = (step: Step) => {
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    const stepIndex = steps.findIndex(s => s.key === step.key);
    
    if (stepIndex < currentIndex) {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium">{index + 1}</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          const currentIndex = steps.findIndex(s => s.key === currentStep);
          const stepIndex = steps.findIndex(s => s.key === step.key);
          
          // Only allow clicking on:
          // 1. Previous steps (completed)
          // 2. Current step
          // 3. Next step (only if current step is valid)
          const canClick = Boolean(
            isCompleted || 
            isCurrent || 
            (stepIndex === currentIndex + 1 && isStepValid(currentStep))
          );
          
          return (
            <div key={step.key} className="flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => canClick && onStepClick(step.key)}
                disabled={!canClick}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : canClick
                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </button>
              
              {/* Step Info */}
              <div className="ml-3">
                <h3 className={`
                  text-sm font-medium
                  ${isCompleted
                    ? 'text-green-600'
                    : isCurrent
                    ? 'text-blue-600'
                    : canClick
                    ? 'text-gray-900'
                    : 'text-gray-400'
                  }
                `}>
                  {step.title}
                </h3>
                <p className={`
                  text-xs
                  ${isCompleted
                    ? 'text-green-500'
                    : isCurrent
                    ? 'text-blue-500'
                    : canClick
                    ? 'text-gray-600'
                    : 'text-gray-400'
                  }
                `}>
                  {step.description}
                </p>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 