import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * useLoadingButton Hook
 * 
 * A flexible hook for managing button loading states, preventing duplicate submissions,
 * and showing single toast notifications.
 * 
 * Features:
 * - Tracks loading state
 * - Prevents multiple simultaneous requests
 * - Manages single toast notification
 * - Provides cleanup on unmount
 * 
 * Usage:
 * const { isLoading, handleClick } = useLoadingButton({
 *   onSubmit: async () => {
 *     await api.post('/endpoint', data);
 *   },
 *   successMessage: 'Data saved!',
 *   errorMessage: 'Failed to save'
 * });
 * 
 * <button onClick={handleClick} disabled={isLoading}>
 *   {isLoading ? 'Processing...' : 'Save'}
 * </button>
 */
export const useLoadingButton = ({
  onSubmit,
  successMessage = 'Operation completed successfully!',
  errorMessage = null,
  onSuccess = null,
  onError = null,
  showToast = true,
} = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref to prevent duplicate submissions
  const isProcessingRef = useRef(false);
  
  // Ref to store toast ID for preventing duplicate toasts
  const toastIdRef = useRef(null);

  const handleClick = useCallback(async (e) => {
    // Prevent multiple simultaneous requests
    if (isProcessingRef.current || isLoading) {
      return;
    }

    try {
      // Mark as processing
      isProcessingRef.current = true;
      setIsLoading(true);

      // Dismiss any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }

      // Execute the async operation
      const result = await onSubmit?.(e);

      // Show success toast only once
      if (showToast && successMessage) {
        toastIdRef.current = toast.success(successMessage, {
          duration: 3000,
          position: 'top-center'
        });
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Show error toast
      const msg = errorMessage || error?.response?.data?.message || error?.message || 'An error occurred';
      if (showToast) {
        toastIdRef.current = toast.error(msg, {
          duration: 4000,
          position: 'top-center'
        });
      }

      // Call error callback
      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      // Reset states
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [isLoading, onSubmit, successMessage, errorMessage, onSuccess, onError, showToast]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    isProcessingRef.current = false;
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    handleClick,
    cleanup,
  };
};

export default useLoadingButton;
