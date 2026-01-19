import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

const STORAGE_KEY = "github-search:history";
const MAX_HISTORY_SIZE = 10;

export function useSearchHistory() {
  const [history, setHistory] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const addToHistory = useCallback(
    (query: string) => {
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return;

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmed);
        return [query.trim(), ...filtered].slice(0, MAX_HISTORY_SIZE);
      });
    },
    [setHistory]
  );

  const removeFromHistory = useCallback(
    (query: string) => {
      setHistory((prev) => prev.filter((item) => item !== query));
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

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
