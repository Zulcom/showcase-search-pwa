import { useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { css } from "../../styled-system/css";
import { RepoItem } from "./RepoItem";
import { RepoSkeleton } from "./Skeleton";
import type { GitHubRepository } from "../types/github.generated";

interface RepoListProps {
  repos: GitHubRepository[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  virtualized?: boolean;
}

export function RepoList({
  repos,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  virtualized = false,
}: RepoListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: repos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
    enabled: virtualized,
  });

  const handleScroll = useCallback(() => {
    if (!parentRef.current || !virtualized || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      onLoadMore();
    }
  }, [virtualized, isLoadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent || !virtualized) return;

    parent.addEventListener("scroll", handleScroll);
    return () => parent.removeEventListener("scroll", handleScroll);
  }, [handleScroll, virtualized]);

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

  if (virtualized) {
    return (
      <div
        ref={parentRef}
        className={css({
          maxHeight: "400px",
          overflowY: "auto",
          pl: "4",
        })}
        role="list"
        aria-label="Repositories"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              role="listitem"
            >
              <div className={css({ pb: "2" })}>
                <RepoItem repo={repos[virtualRow.index]} />
              </div>
            </div>
          ))}
        </div>

        {isLoadingMore && (
          <div className={css({ py: "2" })}>
            <RepoSkeleton count={2} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2",
        pl: "4",
      })}
      role="list"
      aria-label="Repositories"
    >
      {repos.map((repo) => (
        <div key={repo.id} role="listitem">
          <RepoItem repo={repo} />
        </div>
      ))}
    </div>
  );
}
