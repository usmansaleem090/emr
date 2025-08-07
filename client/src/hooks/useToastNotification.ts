import { useCallback } from 'react';
import { toast, ToastOptions } from 'react-hot-toast';

interface ToastNotification {
  showSuccess: (message: string, options?: ToastOptions) => void;
  showError: (message: string, options?: ToastOptions) => void;
  showWarning: (message: string, options?: ToastOptions) => void;
  showInfo: (message: string, options?: ToastOptions) => void;
}

export const useToastNotification = (): ToastNotification => {
  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'var(--success-500)',
        color: 'white',
      },
      ...options,
    });
  }, []);

  const showError = useCallback((message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'var(--error-500)',
        color: 'white',
      },
      ...options,
    });
  }, []);

  const showWarning = useCallback((message: string, options?: ToastOptions) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'var(--warning-500)',
        color: 'white',
      },
      icon: '⚠️',
      ...options,
    });
  }, []);

  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: 'var(--primary-500)',
        color: 'white',
      },
      icon: 'ℹ️',
      ...options,
    });
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};