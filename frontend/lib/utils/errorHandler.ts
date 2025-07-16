import { AxiosError } from 'axios';

// Define error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN'
}

// Standard error interface
export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
  details?: string;
  code?: string;
  statusCode?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Error classification function
export function classifyError(error: any): ErrorType {
  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    return ErrorType.NETWORK;
  }

  // HTTP status code based classification
  const status = error.response?.status;
  
  if (status === 401) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (status === 403) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (status === 404) {
    return ErrorType.NOT_FOUND;
  }
  
  if (status >= 400 && status < 500) {
    return ErrorType.VALIDATION;
  }
  
  if (status >= 500) {
    return ErrorType.SERVER_ERROR;
  }
  
  return ErrorType.UNKNOWN;
}

// Error translation function
export function translateError(error: any, t: (key: string) => string): AppError {
  const errorType = classifyError(error);
  const statusCode = error.response?.status;
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return {
        type: errorType,
        title: t('errors.network.title'),
        message: t('errors.network.message'),
        statusCode,
        action: {
          label: t('errors.network.retry'),
          onClick: () => window.location.reload()
        }
      };
      
    case ErrorType.AUTHENTICATION:
      return {
        type: errorType,
        title: t('errors.401.title'),
        message: t('errors.401.message'),
        statusCode,
        action: {
          label: t('errors.401.login'),
          onClick: () => window.location.href = '/login'
        }
      };
      
    case ErrorType.AUTHORIZATION:
      return {
        type: errorType,
        title: t('errors.403.title'),
        message: t('errors.403.message'),
        statusCode,
        action: {
          label: t('errors.403.goBack'),
          onClick: () => window.history.back()
        }
      };
      
    case ErrorType.NOT_FOUND:
      return {
        type: errorType,
        title: t('errors.404.title'),
        message: t('errors.404.message'),
        statusCode,
        action: {
          label: t('errors.404.backToHome'),
          onClick: () => window.location.href = '/'
        }
      };
      
    case ErrorType.VALIDATION:
      const validationMessage = error.response?.data?.message || 
                               error.response?.data?.detail || 
                               error.response?.data?.error ||
                               t('errors.general.message');
      return {
        type: errorType,
        title: t('errors.general.title'),
        message: validationMessage,
        statusCode,
        details: JSON.stringify(error.response?.data?.errors || {})
      };
      
    case ErrorType.SERVER_ERROR:
      return {
        type: errorType,
        title: t('errors.500.title'),
        message: t('errors.500.message'),
        statusCode,
        action: {
          label: t('errors.500.tryAgain'),
          onClick: () => window.location.reload()
        }
      };
      
    default:
      return {
        type: errorType,
        title: t('errors.general.title'),
        message: error.message || t('errors.general.message'),
        statusCode,
        details: error.stack
      };
  }
}

// Global error handler
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorToastHandler?: (title: string, message?: string) => void;
  private successToastHandler?: (title: string, message?: string) => void;
  private translator?: (key: string) => string;

  private constructor() {}

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  initialize(
    errorToastHandler: (title: string, message?: string) => void,
    successToastHandler: (title: string, message?: string) => void,
    translator: (key: string) => string
  ) {
    this.errorToastHandler = errorToastHandler;
    this.successToastHandler = successToastHandler;
    this.translator = translator;
  }

  handle(error: any, context?: string): AppError {
    if (!this.translator) {
      console.error('Error handler not initialized');
      return {
        type: ErrorType.UNKNOWN,
        title: 'Error',
        message: error.message || 'An unknown error occurred'
      };
    }

    const appError = translateError(error, this.translator);

    // Log for debugging
    console.error(`[${context || 'UNKNOWN'}] Error:`, {
      type: appError.type,
      title: appError.title,
      message: appError.message,
      statusCode: appError.statusCode,
      originalError: error
    });

    // Show toast notification
    if (this.errorToastHandler) {
      this.errorToastHandler(appError.title, appError.message);
    }

    return appError;
  }

  // Handle specific error types
  handleNetworkError(error: any, context?: string): AppError {
    return this.handle(error, context);
  }

  handleAPIError(error: AxiosError, context?: string): AppError {
    return this.handle(error, context);
  }

  handleValidationError(error: any, context?: string): AppError {
    return this.handle(error, context);
  }

  // Success handler
  handleSuccess(title: string, message?: string) {
    if (this.successToastHandler) {
      this.successToastHandler(title, message);
    }
  }
}

// Export singleton instance
export const errorHandler = GlobalErrorHandler.getInstance();

// Utility hook for components
export interface UseErrorHandlerReturn {
  handleError: (error: any, context?: string) => AppError;
  handleSuccess: (title: string, message?: string) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  return {
    handleError: (error: any, context?: string) => errorHandler.handle(error, context),
    handleSuccess: (title: string, message?: string) => errorHandler.handleSuccess(title, message)
  };
} 