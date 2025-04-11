
import { useRef, useCallback } from 'react';

/**
 * Creates a debounced version of a function
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Hook to create a stable debounced function that doesn't trigger re-renders
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef<T>(callback);
  
  // Update the callback ref whenever it changes
  callbackRef.current = callback;
  
  // Create a stable reference to the debounced function
  const debouncedFn = useRef(
    debounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, delay)
  ).current;
  
  return debouncedFn;
}

/**
 * Hook to memoize a function based on its dependencies
 * Prevents unnecessary re-creation of functions causing re-renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;
  
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
}

/**
 * Helper for handling Supabase queries with error management
 * @param queryFn Function that performs the Supabase query
 * @param onSuccess Optional callback for successful queries
 * @param onError Optional callback for error handling
 */
export async function handleSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  onSuccess?: (data: T) => void,
  onError?: (error: any) => void
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.error('Supabase query error:', error);
      onError?.(error);
      return { data: null, error };
    }
    
    if (data) {
      onSuccess?.(data);
    }
    
    return { data, error: null };
  } catch (unexpectedError) {
    console.error('Unexpected error in Supabase query:', unexpectedError);
    onError?.(unexpectedError);
    return { data: null, error: unexpectedError };
  }
}
