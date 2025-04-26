import { notificationQueue } from './NotificationQueue';

interface ErrorDetails {
  code: string;
  message: string;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private static readonly ERROR_MESSAGES = {
    // Pioneer-specific error codes
    PIONEER_NOT_FOUND: 'Pioneer wallet not found',
    INVALID_PIONEER_CATEGORY: 'Invalid pioneer category',
    INSUFFICIENT_TRANSACTIONS: 'Insufficient transactions to qualify as pioneer',
    METRICS_UPDATE_FAILED: 'Failed to update pioneer metrics',
    PROTOCOL_DISCOVERY_FAILED: 'Failed to record protocol discovery',
    STRATEGY_DEPLOYMENT_FAILED: 'Failed to record strategy deployment',
    CHAIN_ACTIVITY_FAILED: 'Failed to update chain activity',
    
    // Generic error codes
    NETWORK_ERROR: 'Network connection error',
    API_ERROR: 'API request failed',
    VALIDATION_ERROR: 'Invalid input data',
    UNKNOWN_ERROR: 'An unknown error occurred'
  };

  private static readonly ERROR_PRIORITIES = {
    PIONEER_NOT_FOUND: 2,
    INVALID_PIONEER_CATEGORY: 2,
    INSUFFICIENT_TRANSACTIONS: 1,
    METRICS_UPDATE_FAILED: 3,
    PROTOCOL_DISCOVERY_FAILED: 3,
    STRATEGY_DEPLOYMENT_FAILED: 3,
    CHAIN_ACTIVITY_FAILED: 2,
    NETWORK_ERROR: 3,
    API_ERROR: 3,
    VALIDATION_ERROR: 2,
    UNKNOWN_ERROR: 1
  };

  public static handleError(error: Error | ErrorDetails) {
    let errorDetails: ErrorDetails;

    if (error instanceof Error) {
      errorDetails = this.parseError(error);
    } else {
      errorDetails = error;
    }

    // Log error for debugging
    console.error('Error:', errorDetails);

    // Get error message and priority
    const message = this.ERROR_MESSAGES[errorDetails.code] || errorDetails.message;
    const priority = this.ERROR_PRIORITIES[errorDetails.code] || 1;

    // Add error notification
    notificationQueue.add({
      id: Date.now().toString(),
      title: 'Error',
      message,
      type: 'error',
      timestamp: Date.now(),
      priority,
      read: false
    });

    return errorDetails;
  }

  private static parseError(error: Error): ErrorDetails {
    // Parse known error patterns
    if (error.message.includes('wallet not found')) {
      return {
        code: 'PIONEER_NOT_FOUND',
        message: error.message
      };
    }

    if (error.message.includes('invalid category')) {
      return {
        code: 'INVALID_PIONEER_CATEGORY',
        message: error.message
      };
    }

    if (error.message.includes('insufficient transactions')) {
      return {
        code: 'INSUFFICIENT_TRANSACTIONS',
        message: error.message
      };
    }

    // Network errors
    if (error.message.includes('network') || error.message.includes('Network Error')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message
      };
    }

    // API errors
    if (error.message.includes('API') || error.message.includes('status code')) {
      return {
        code: 'API_ERROR',
        message: error.message
      };
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message
      };
    }

    // Default unknown error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message
    };
  }

  public static handlePioneerError(error: Error, context?: Record<string, any>): ErrorDetails {
    let errorDetails: ErrorDetails;

    // Pioneer-specific error parsing
    if (error.message.includes('metrics')) {
      errorDetails = {
        code: 'METRICS_UPDATE_FAILED',
        message: error.message,
        context
      };
    } else if (error.message.includes('protocol discovery')) {
      errorDetails = {
        code: 'PROTOCOL_DISCOVERY_FAILED',
        message: error.message,
        context
      };
    } else if (error.message.includes('strategy deployment')) {
      errorDetails = {
        code: 'STRATEGY_DEPLOYMENT_FAILED',
        message: error.message,
        context
      };
    } else if (error.message.includes('chain activity')) {
      errorDetails = {
        code: 'CHAIN_ACTIVITY_FAILED',
        message: error.message,
        context
      };
    } else {
      errorDetails = this.parseError(error);
    }

    return this.handleError(errorDetails);
  }

  public static isRecoverable(errorCode: string): boolean {
    const unrecoverableErrors = [
      'PIONEER_NOT_FOUND',
      'INVALID_PIONEER_CATEGORY',
      'INSUFFICIENT_TRANSACTIONS'
    ];
    return !unrecoverableErrors.includes(errorCode);
  }
}