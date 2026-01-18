import { useCallback } from "react";

type TransitionCallback = () => void | Promise<void>;

interface UseViewTransitionResult {
  startTransition: (callback: TransitionCallback) => void;
  isSupported: boolean;
}

export function useViewTransition(): UseViewTransitionResult {
  const isSupported = typeof document !== "undefined" && "startViewTransition" in document;

  const startTransition = useCallback(
    (callback: TransitionCallback) => {
      if (isSupported) {
        (
          document as Document & { startViewTransition: (cb: TransitionCallback) => void }
        ).startViewTransition(callback);
      } else {
        callback();
      }
    },
    [isSupported]
  );

  return { startTransition, isSupported };
}
