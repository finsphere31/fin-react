import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * LoadingButton Component
 * 
 * Features:
 * - Disables button immediately on first click
 * - Shows loading spinner and "Processing..." text
 * - Prevents multiple clicks and duplicate submissions
 * - Shows success/error toast only once after completion
 * - Re-enables button only after process completes
 * - Ignores extra clicks while processing
 * - Toast doesn't repeat on re-render or state update
 * 
 * Usage:
 * <LoadingButton 
 *   onClick={async () => {
 *     const response = await api.post('/endpoint', data);
 *     return response;
 *   }}
 *   successMessage="Data saved successfully!"
 *   loadingText="Saving..."
 * >
 *   Save Changes
 * </LoadingButton>
 */
const LoadingButton = ({
  children,
  onClick,
  successMessage = 'Operation completed successfully!',
  errorMessage = null,
  loadingText = 'Processing...',
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  showToast = true,
  onSuccess = null,
  onError = null,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Track if a request is currently in progress to prevent duplicate submissions
  const isProcessingRef = useRef(false);
  
  // Store toast ID to prevent duplicate toasts on re-render
  const toastIdRef = useRef(null);

  const handleClick = async (e) => {
    // Prevent multiple simultaneous requests
    if (isProcessingRef.current || isLoading) {
      return;
    }

    try {
      // Mark as processing
      isProcessingRef.current = true;
      setIsLoading(true);

      // Cancel any existing toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }

      // Execute the async operation
      const result = await onClick?.(e);

      // Show success toast only once
      if (showToast && successMessage) {
        toastIdRef.current = toast.success(successMessage, { 
          duration: 3000,
          position: 'top-center'
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      // Show error toast
      const errorMsg = errorMessage || error?.response?.data?.message || 'An error occurred';
      if (showToast) {
        toastIdRef.current = toast.error(errorMsg, {
          duration: 4000,
          position: 'top-center'
        });
      }

      // Call error callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      // Reset states only after a small delay to ensure smooth UX
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100',
    secondary: 'bg-white text-slate-600 border-2 border-slate-100 hover:bg-slate-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg shadow-amber-100',
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <RefreshCw className="animate-spin" size={16} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
