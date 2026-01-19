import { useCallback, useRef } from "react";
import { css } from "../../styled-system/css";
import { RepoItem } from "./RepoItem";
import { RepoSkeleton } from "./Skeleton";
import { config } from "../lib/config";
import type { GitHubRepository } from "../types/github.generated";

interface RepoListProps {
  repos: GitHubRepository[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

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

    if (distanceFromBottom < config.ui.loadMoreThreshold) {
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

  const useScroll = repos.length >= config.ui.repoListScrollThreshold;

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
          maxHeight: `${config.ui.repoListMaxHeight}px`,
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
