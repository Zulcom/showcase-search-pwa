import { useCallback, useRef } from "react";
import { css } from "../../styled-system/css";
import { RepoItem } from "./RepoItem";
import { RepoSkeleton } from "./Skeleton";
import type { GitHubRepository } from "../types/github.generated";

interface RepoListProps {
  repos: GitHubRepository[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const MAX_VISIBLE_HEIGHT = 400;
const SCROLL_THRESHOLD = 10;
const LOAD_MORE_THRESHOLD = 100;

export function RepoList({
  repos,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
}: RepoListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore || isLoadingMore || !onLoadMore) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < LOAD_MORE_THRESHOLD) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (isLoading) {
    return <RepoSkeleton count={5} />;
  }

  if (repos.length === 0) {
    return (
      <p
        className={css({
          textAlign: "center",
          color: "text.muted",
          py: "4",
        })}
      >
        No repositories found
      </p>
    );
  }

  const useScroll = repos.length >= SCROLL_THRESHOLD;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2",
        pl: "4",
        ...(useScroll && {
          maxHeight: `${MAX_VISIBLE_HEIGHT}px`,
          overflow: "auto",
        }),
      })}
      role="list"
      aria-label="Repositories"
    >
      {repos.map((repo) => (
        <div key={repo.id} role="listitem">
          <RepoItem repo={repo} />
        </div>
      ))}
      {isLoadingMore && (
        <div
          className={css({
            textAlign: "center",
            py: "3",
            color: "text.muted",
          })}
        >
          Loading more...
        </div>
      )}
      {hasMore && !isLoadingMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className={css({
            py: "2",
            px: "4",
            bg: "bg.subtle",
            border: "1px solid",
            borderColor: "border.default",
            borderRadius: "md",
            color: "text.default",
            cursor: "pointer",
            mx: "auto",
            _hover: {
              bg: "bg.canvas",
            },
          })}
        >
          Load more
        </button>
      )}
    </div>
  );
}
