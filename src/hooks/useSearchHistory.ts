import { useState, useCallback, useEffect } from "react";
import { logger } from "../lib/logger";

const STORAGE_KEY = "github-search:history";
const MAX_HISTORY_SIZE = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      logger.warn("Failed to load search history", err);
    }
  }, []);

  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (err) {
      logger.warn("Failed to save search history", err);
    }
  }, []);

  const addToHistory = useCallback(
    (query: string) => {
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return;

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmed);
        const updated = [query.trim(), ...filtered].slice(0, MAX_HISTORY_SIZE);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  const removeFromHistory = useCallback(
    (query: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item !== query);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      logger.warn("Failed to clear search history", err);
    }
  }, []);

  const getFilteredHistory = useCallback(
    (filterQuery: string) => {
      if (!filterQuery.trim()) return history;
      const lower = filterQuery.toLowerCase();
      return history.filter((item) => item.toLowerCase().includes(lower));
    },
    [history]
  );

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getFilteredHistory,
  };
}
