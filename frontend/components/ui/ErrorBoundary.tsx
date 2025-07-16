'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/lib/design-system';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReportError = () => {
    // Here you can implement error reporting to your service
    console.log('Reporting error:', this.state.error);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                خطایی رخ داده است
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                متأسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید یا صفحه را بارگذاری مجدد کنید.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                fullWidth
                size="lg"
              >
                تلاش مجدد
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                fullWidth
                size="lg"
              >
                بارگذاری مجدد صفحه
              </Button>
              
              <Button
                onClick={this.handleReportError}
                variant="ghost"
                fullWidth
                size="md"
              >
                گزارش خطا
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                  جزئیات خطا (فقط در حالت توسعه)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 