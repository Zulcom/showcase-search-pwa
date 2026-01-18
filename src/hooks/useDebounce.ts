import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedFn<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number = 300
) {
  return useDebouncedCallback(fn, delay);
}
