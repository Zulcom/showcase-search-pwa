import { useCallback, useState, useEffect, useRef, memo } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { css } from "../../styled-system/css";
import { RepoList } from "./RepoList";
import { RenderCounter } from "./RenderCounter";
import { getUserRepos } from "../api/github";
import { config } from "../lib/config";
import type { GitHubUser, GitHubRepository } from "../types/github.generated";

interface UserAccordionProps {
  users: GitHubUser[];
  selectedIndex: number;
  expandedIndex: number | null;
  onSelectUser: (index: number) => void;
  onExpandUser: (index: number | null) => void;
}

interface RepoState {
  repos: GitHubRepository[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const defaultRepoState: RepoState = {
  repos: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  page: 1,
  hasMore: false,
};

interface UserItemProps {
  user: GitHubUser;
  isSelected: boolean;
  isExpanded: boolean;
  repoState: RepoState;
  onSelect: () => void;
  onToggle: () => void;
  onLoadRepos: () => void;
  onLoadMore: () => void;
  onReset: () => void;
}

const UserItem = memo(function UserItem({
  user,
  isSelected,
  isExpanded,
  repoState,
  onSelect,
  onToggle,
  onLoadRepos,
  onLoadMore,
  onReset,
}: UserItemProps) {
  const handleToggle = useCallback(() => {
    onSelect();
    if (!isExpanded) {
      onLoadRepos();
    } else {
      onReset();
    }
    onToggle();
  }, [isExpanded, onLoadRepos, onSelect, onToggle, onReset]);

  return (
    <div
      className={css({
        bg: "bg.subtle",
        border: "1px solid",
        borderColor: isSelected ? "blue.500" : "border.default",
        borderRadius: "lg",
        overflow: "hidden",
        transition: "border-color 0.2s",
        position: "relative",
      })}
    >
      <RenderCounter name={user.login} enabled />
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={`repos-${user.id}`}
        className={css({
          w: "full",
          display: "flex",
          alignItems: "center",
          gap: "3",
          p: "4",
          bg: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background-color 0.2s",
          _hover: {
            bg: "bg.canvas",
          },
        })}
      >
        <img
          src={user.avatar_url}
          alt=""
          width={48}
          height={48}
          loading="lazy"
          className={css({
            borderRadius: "full",
            flexShrink: 0,
          })}
        />

        <div className={css({ flex: 1, minWidth: 0 })}>
          <span
            className={css({
              display: "block",
              fontWeight: "medium",
              color: "text.default",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
          >
            {user.login}
          </span>
          <span
            className={css({
              display: "block",
              fontSize: "sm",
              color: "text.muted",
            })}
          >
            {user.type}
          </span>
        </div>

        <span
          className={css({
            color: "text.muted",
            transition: "transform 0.2s",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          })}
          aria-hidden="true"
        >
          <span
            className={css({
              display: "block",
              width: "0",
              height: "0",
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "6px solid currentColor",
            })}
          />
        </span>
      </button>

      {isExpanded && (
        <div id={`repos-${user.id}`} className={css({ overflow: "hidden" })}>
          <div
            className={css({
              p: "4",
              pt: "0",
              borderTop: "1px solid",
              borderColor: "border.default",
            })}
          >
            {repoState.error ? (
              <p
                className={css({
                  color: "red.500",
                  textAlign: "center",
                  py: "4",
                })}
                role="alert"
              >
                {repoState.error}
              </p>
            ) : (
              <RepoList
                repos={repoState.repos}
                isLoading={repoState.isLoading}
                isLoadingMore={repoState.isLoadingMore}
                hasMore={repoState.hasMore}
                onLoadMore={onLoadMore}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default function UserAccordion({
  users,
  selectedIndex,
  expandedIndex,
  onSelectUser,
  onExpandUser,
}: UserAccordionProps) {
  const [parentRef] = useAutoAnimate();
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

  return (
    <div
      ref={parentRef}
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "3",
      })}
      role="list"
      aria-label="GitHub users"
    >
      {users.map((user, index) => (
        <div key={user.id} role="listitem">
          <UserItem
            user={user}
            isSelected={selectedIndex === index}
            isExpanded={expandedIndex === index}
            repoState={repoStates.get(user.login) || defaultRepoState}
            onSelect={() => onSelectUser(index)}
            onToggle={() => onExpandUser(expandedIndex === index ? null : index)}
            onLoadRepos={() => loadReposForUser(user.login)}
            onLoadMore={() => loadMoreForUser(user.login)}
            onReset={() => resetForUser(user.login)}
          />
        </div>
      ))}
    </div>
  );
}
