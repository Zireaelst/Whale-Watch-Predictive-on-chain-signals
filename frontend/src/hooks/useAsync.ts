import { useState, useCallback, useEffect } from 'react';
import { notificationQueue } from '../utils/NotificationQueue';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface UseAsyncOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
  autoExecute?: boolean;
  notifyOnError?: boolean;
  notifyOnSuccess?: boolean;
  successMessage?: string;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncOptions = {}
) {
  const {
    onError,
    onSuccess,
    autoExecute = true,
    notifyOnError = true,
    notifyOnSuccess = false,
    successMessage,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        setState({ data, loading: false, error: null });

        if (onSuccess) {
          onSuccess(data);
        }

        if (notifyOnSuccess) {
          notificationQueue.push({
            type: 'success',
            title: 'Success',
            message: successMessage || 'Operation completed successfully',
            sound: true,
          });
        }

        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: errorObj });

        if (onError) {
          onError(errorObj);
        }

        if (notifyOnError) {
          notificationQueue.push({
            type: 'error',
            title: 'Error',
            message: errorObj.message,
            sound: true,
          });
        }

        throw errorObj;
      }
    },
    [asyncFunction, onSuccess, onError, notifyOnError, notifyOnSuccess, successMessage]
  );

  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [...dependencies, execute]);

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, error: null, loading: false });
    }, []),
  };
}

// Helper hook for simple data fetching
export function useFetch<T = any>(
  url: string,
  options: RequestInit & UseAsyncOptions = {}
) {
  const { 
    onError, 
    onSuccess, 
    autoExecute, 
    notifyOnError, 
    notifyOnSuccess, 
    successMessage,
    ...fetchOptions 
  } = options;

  const asyncOptions = {
    onError,
    onSuccess,
    autoExecute,
    notifyOnError,
    notifyOnSuccess,
    successMessage,
  };

  return useAsync<T>(
    () => 
      fetch(url, fetchOptions)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        }),
    [url, JSON.stringify(fetchOptions)],
    asyncOptions
  );
}