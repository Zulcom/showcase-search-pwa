import { Virtuoso } from "react-virtuoso";
import { css } from "../../styled-system/css";
import { RepoItem } from "./RepoItem";
import { config } from "../lib/config";
import type { GitHubRepository } from "../types/github";

interface VirtualizedRepoListProps {
  repos: GitHubRepository[];
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
}

export default function VirtualizedRepoList({
  repos,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: VirtualizedRepoListProps) {
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
