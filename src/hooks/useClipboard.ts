import { useState, useCallback } from "react";
import { logger } from "../lib/logger";

interface UseClipboardResult {
  paste: () => Promise<string | null>;
  copy: (text: string) => Promise<boolean>;
  isSupported: boolean;
  error: string | null;
}

export function useClipboard(): UseClipboardResult {
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof navigator !== "undefined" &&
    "clipboard" in navigator &&
    "readText" in navigator.clipboard;

  const paste = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError("Clipboard API not supported");
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setError(null);
      return text.trim();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to read clipboard";
      logger.warn("Clipboard paste failed", err);
      setError(message);
      return null;
    }
  }, [isSupported]);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!isSupported) {
        setError("Clipboard API not supported");
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to copy to clipboard";
        logger.warn("Clipboard copy failed", err);
        setError(message);
        return false;
      }
    },
    [isSupported]
  );

  return { paste, copy, isSupported, error };
}
