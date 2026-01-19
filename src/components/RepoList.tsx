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
}

export function RepoList({
  repos,
  isLoading,
  isLoadingMore,
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
      {isLoadingMore && (
        <div className={css({ py: "2" })}>
          <RepoSkeleton count={2} />
        </div>
      )}
    </div>
  );
}
