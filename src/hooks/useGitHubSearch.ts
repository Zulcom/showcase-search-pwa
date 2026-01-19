import { useState, useEffect, useCallback } from "react";
import { searchUsers } from "../api/github";
import type { GitHubUser } from "../types/github.generated";

export enum LoadingState {
  NOT_INIT = "NOT_INIT",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

interface UseGitHubSearchResult {
  users: GitHubUser[];

  loadingState: LoadingState;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;

  fetchError: string | null;

  reset: () => void;
}

export function useGitHubSearch(query?: string | null): UseGitHubSearchResult {
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.NOT_INIT);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const MIN_QUERY_LENGTH = 3;

  useEffect(() => {
    if (!query || query.length < MIN_QUERY_LENGTH) {
      return;
    }

    let cancelled = false;

    async function fetchUsers() {
      setLoadingState(LoadingState.LOADING);
      setFetchError(null);

      try {
        const result = await searchUsers(query!, 5);

        if (!cancelled) {
          setUsers(result.items);
          setLoadingState(LoadingState.SUCCESS);
        }
      } catch (err) {
        if (cancelled) return;

        if (err instanceof Error && err.message === "Search cancelled") {
          return;
        }

        setFetchError(err instanceof Error ? err.message : "Failed to search users");
        setUsers([]);
        setLoadingState(LoadingState.ERROR);
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const reset = useCallback(() => {
    setUsers([]);
    setLoadingState(LoadingState.NOT_INIT);
    setFetchError(null);
  }, []);

  return {
    users,

    loadingState,
    isLoading: loadingState === LoadingState.LOADING,
    isSuccess: loadingState === LoadingState.SUCCESS,
    isError: loadingState === LoadingState.ERROR,
    isIdle: loadingState === LoadingState.NOT_INIT,

    fetchError,

    reset,
  };
}
