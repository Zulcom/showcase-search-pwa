import { memo, useCallback } from "react";
import { css } from "../../styled-system/css";
import { RepoList } from "./RepoList";
import type { GitHubUser, GitHubRepository } from "../types/github";

export interface RepoState {
  repos: GitHubRepository[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

export const defaultRepoState: RepoState = {
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

export const UserItem = memo(function UserItem({
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
