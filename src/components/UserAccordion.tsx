import { useCallback, useState, memo } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { css } from "../../styled-system/css";
import { RepoList } from "./RepoList";
import { RenderCounter } from "./RenderCounter";
import { getUserRepos } from "../api/github";
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
  hasMore: boolean;
}

const defaultRepoState: RepoState = {
  repos: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  hasMore: false,
};

interface UserItemProps {
  user: GitHubUser;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  repoState: RepoState;
  onSelect: () => void;
  onToggle: () => void;
  onLoadRepos: () => void;
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
                onLoadMore={() => {}}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export function UserAccordion({
  users,
  selectedIndex,
  expandedIndex,
  onSelectUser,
  onExpandUser,
}: UserAccordionProps) {
  const [parentRef] = useAutoAnimate();
  const [repoStates, setRepoStates] = useState<Map<string, RepoState>>(new Map());

  const loadReposForUser = useCallback(async (username: string) => {
    setRepoStates((prev) => {
      const next = new Map(prev);
      next.set(username, { ...defaultRepoState, isLoading: true });
      return next;
    });

    try {
      const repos = await getUserRepos(username, 1, 30);
      setRepoStates((prev) => {
        const next = new Map(prev);
        next.set(username, {
          repos,
          isLoading: false,
          isLoadingMore: false,
          error: null,
          hasMore: repos.length === 30,
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
            index={index}
            isSelected={selectedIndex === index}
            isExpanded={expandedIndex === index}
            repoState={repoStates.get(user.login) || defaultRepoState}
            onSelect={() => onSelectUser(index)}
            onToggle={() => onExpandUser(expandedIndex === index ? null : index)}
            onLoadRepos={() => loadReposForUser(user.login)}
            onReset={() => resetForUser(user.login)}
          />
        </div>
      ))}
    </div>
  );
}
