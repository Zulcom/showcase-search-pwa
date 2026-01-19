import { useState, useEffect, useRef, useCallback } from "react";
import { getUserRepos } from "../api/github";
import { config } from "../lib/config";
import type { GitHubUser } from "../types/github";
import { defaultRepoState, type RepoState } from "../components/UserItem";

export function useUserRepos(users: GitHubUser[]) {
  const [repoStates, setRepoStates] = useState<Map<string, RepoState>>(new Map());

  const repoStatesRef = useRef(repoStates);
  repoStatesRef.current = repoStates;

  useEffect(() => {
    const currentUsernames = new Set(users.map((u) => u.login));
    setRepoStates((prev) => {
      const next = new Map<string, RepoState>();
      for (const [username, state] of prev) {
        if (currentUsernames.has(username)) {
          next.set(username, state);
        }
      }
      return next.size === prev.size ? prev : next;
    });
  }, [users]);

  const loadReposForUser = useCallback(async (username: string) => {
    setRepoStates((prev) => {
      const next = new Map(prev);
      next.set(username, { ...defaultRepoState, isLoading: true });
      return next;
    });

    try {
      const repos = await getUserRepos(username, 1, config.pagination.reposPerPage);
      setRepoStates((prev) => {
        const next = new Map(prev);
        next.set(username, {
          repos,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          page: 1,
          hasMore: repos.length === config.pagination.reposPerPage,
        });
        return next;
      });
    } catch (err) {
      setRepoStates((prev) => {
        const next = new Map(prev);
        next.set(username, {
          ...defaultRepoState,
          error: err instanceof Error ? err.message : "Failed to load repositories",
        });
        return next;
      });
    }
  }, []);

  const loadMoreForUser = useCallback(async (username: string) => {
    const currentState = repoStatesRef.current.get(username);
    if (!currentState || currentState.isLoadingMore || !currentState.hasMore) {
      return;
    }

    const nextPage = currentState.page + 1;

    setRepoStates((prev) => {
      const next = new Map(prev);
      const current = prev.get(username);
      if (current) {
        next.set(username, { ...current, isLoadingMore: true });
      }
      return next;
    });

    try {
      const newRepos = await getUserRepos(username, nextPage, config.pagination.reposPerPage);
      setRepoStates((prev) => {
        const next = new Map(prev);
        const current = prev.get(username);
        if (current) {
          next.set(username, {
            ...current,
            repos: [...current.repos, ...newRepos],
            isLoadingMore: false,
            page: nextPage,
            hasMore: newRepos.length === config.pagination.reposPerPage,
          });
        }
        return next;
      });
    } catch (err) {
      setRepoStates((prev) => {
        const next = new Map(prev);
        const current = prev.get(username);
        if (current) {
          next.set(username, {
            ...current,
            isLoadingMore: false,
            error: err instanceof Error ? err.message : "Failed to load more repositories",
          });
        }
        return next;
      });
    }
  }, []);

  const resetForUser = useCallback((username: string) => {
    setRepoStates((prev) => {
      const next = new Map(prev);
      next.delete(username);
      return next;
    });
  }, []);

  const getRepoState = useCallback(
    (username: string) => repoStates.get(username) || defaultRepoState,
    [repoStates]
  );

  return {
    getRepoState,
    loadReposForUser,
    loadMoreForUser,
    resetForUser,
  };
}
