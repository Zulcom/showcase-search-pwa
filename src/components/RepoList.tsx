import { Virtuoso } from "react-virtuoso";
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

  const useVirtualization = repos.length >= config.ui.repoListScrollThreshold;

  if (!useVirtualization) {
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

  return (
    <div className={css({ pl: "4" })} role="list" aria-label="Repositories">
      <Virtuoso
        style={{ height: config.ui.repoListMaxHeight }}
        data={repos}
        endReached={() => {
          if (hasMore && !isLoadingMore && onLoadMore) {
            onLoadMore();
          }
        }}
        overscan={200}
        itemContent={(_index, repo) => (
          <div
            role="listitem"
            className={css({
              pb: "2",
            })}
          >
            <RepoItem repo={repo} />
          </div>
        )}
        components={{
          Footer: () =>
            isLoadingMore ? (
              <div
                className={css({
                  textAlign: "center",
                  py: "3",
                  color: "text.muted",
                })}
              >
                Loading more...
              </div>
            ) : null,
        }}
      />
    </div>
  );
}
