import { useState, useCallback, useRef } from "react";
import { getUserRepos } from "../api/github";
import { logger } from "../lib/logger";
import type { GitHubRepository } from "../types/github.generated";

const PAGE_SIZE = 30;

interface UseInfiniteReposResult {
  repos: GitHubRepository[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadRepos: (username: string) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useInfiniteRepos(): UseInfiniteReposResult {
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const currentUsername = useRef<string>("");
  const currentPage = useRef(1);

  const loadRepos = useCallback(async (username: string) => {
    if (!username) return;

    currentUsername.current = username;
    currentPage.current = 1;
    setIsLoading(true);
    setError(null);
    setHasMore(true);

    try {
      const result = await getUserRepos(username, 1, PAGE_SIZE);
      setRepos(result);
      setHasMore(result.length === PAGE_SIZE);
      logger.debug("Loaded initial repos", { username, count: result.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load repositories";
      setError(message);
      setRepos([]);
      logger.error("Failed to load repos", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentUsername.current || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage.current + 1;

    try {
      const result = await getUserRepos(currentUsername.current, nextPage, PAGE_SIZE);
      currentPage.current = nextPage;
      setRepos((prev) => [...prev, ...result]);
      setHasMore(result.length === PAGE_SIZE);
      logger.debug("Loaded more repos", {
        username: currentUsername.current,
        page: nextPage,
        count: result.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load more repositories";
      setError(message);
      logger.error("Failed to load more repos", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore]);

  const reset = useCallback(() => {
    setRepos([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setHasMore(true);
    currentUsername.current = "";
    currentPage.current = 1;
  }, []);

  return {
    repos,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadRepos,
    loadMore,
    reset,
  };
}
