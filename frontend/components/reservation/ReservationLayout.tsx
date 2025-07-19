/**
 * ReservationLayout Component
 * 
 * This component provides a consistent layout for all reservation pages
 * following DDD principles and Clean Architecture patterns.
 * 
 * Responsibilities:
 * - Provide consistent UI structure for reservation flows
 * - Handle common reservation state management
 * - Manage reservation step navigation
 * - Provide error handling and loading states
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslations } from 'next-intl';

// Domain Types
interface ReservationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

interface ReservationLayoutProps {
  children: ReactNode;
  currentStep: string;
  steps: ReservationStep[];
  onStepChange?: (stepId: string) => void;
  onBack?: () => void;
  onNext?: () => void;
  isLoading?: boolean;
  error?: string | null;
  showProgress?: boolean;
  className?: string;
}

// UI Components
const StepIndicator: React.FC<{ steps: ReservationStep[]; currentStep: string }> = ({
  steps,
  currentStep,
}) => {
  const t = useTranslations('reservation');
  
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  step.isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.isActive
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}
              >
                {step.isCompleted ? '✓' : index + 1}
              </div>
              <div className="mt-2 text-xs text-center max-w-20">
                <div className="font-medium">{t(`steps.${step.id}.title`)}</div>
                <div className="text-gray-500">{t(`steps.${step.id}.description`)}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  step.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ErrorDisplay: React.FC<{ error: string | null }> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    </div>
  );
};

const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

const NavigationButtons: React.FC<{
  onBack?: () => void;
  onNext?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLoading: boolean;
}> = ({ onBack, onNext, canGoBack, canGoNext, isLoading }) => {
  const t = useTranslations('reservation');
  
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        className={`px-6 py-2 rounded-lg border ${
          canGoBack && !isLoading
            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
            : 'border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {t('navigation.back')}
      </button>
      
      <button
        onClick={onNext}
        disabled={!canGoNext || isLoading}
        className={`px-6 py-2 rounded-lg ${
          canGoNext && !isLoading
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {t('navigation.next')}
      </button>
    </div>
  );
};

// Main Component
export const ReservationLayout: React.FC<ReservationLayoutProps> = ({
  children,
  currentStep,
  steps,
  onStepChange,
  onBack,
  onNext,
  isLoading = false,
  error = null,
  showProgress = true,
  className = '',
}) => {
  const t = useTranslations('reservation');
  const router = useRouter();
  
  // State management
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Effects
  useEffect(() => {
    const index = steps.findIndex(step => step.id === currentStep);
    setCurrentStepIndex(index >= 0 ? index : 0);
  }, [currentStep, steps]);
  
  // Event handlers
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (onStepChange && !prevStep.isDisabled) {
        onStepChange(prevStep.id);
      }
    }
  };
  
  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (onStepChange && !nextStep.isDisabled) {
        onStepChange(nextStep.id);
      }
    }
  };
  
  // Computed values
  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;
  const currentStepData = steps[currentStepIndex];
  
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {currentStepData?.title}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      {showProgress && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
          {/* Error Display */}
          <ErrorDisplay error={error} />
          
          {/* Loading Overlay */}
          <LoadingOverlay isLoading={isLoading} />
          
          {/* Content */}
          <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
            {children}
          </div>
          
          {/* Navigation */}
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ReservationLayout; 