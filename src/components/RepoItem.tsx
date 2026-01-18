import { css } from "../../styled-system/css";
import type { GitHubRepository } from "../types/github.generated";

interface RepoItemProps {
  repo: GitHubRepository;
}

export function RepoItem({ repo }: RepoItemProps) {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={css({
        display: "block",
        p: "3",
        bg: "bg.canvas",
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: "md",
        textDecoration: "none",
        transition: "all 0.2s",
        _hover: {
          borderColor: "blue.500",
          bg: "blue.500/5",
        },
      })}
      aria-label={`Repository: ${repo.name}, ${repo.stargazers_count} stars`}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "2",
          mb: "1",
        })}
      >
        <span
          className={css({
            fontWeight: "medium",
            color: "blue.500",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          })}
        >
          {repo.name}
        </span>

        <span
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "1",
            color: "text.muted",
            fontSize: "sm",
            flexShrink: 0,
          })}
          aria-label={`${repo.stargazers_count} stars`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={css({ color: "yellow.500" })}
          >
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
          </svg>
          {repo.stargazers_count.toLocaleString()}
        </span>
      </div>

      {repo.description && (
        <p
          className={css({
            fontSize: "sm",
            color: "text.muted",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineClamp: 2,
            lineHeight: "1.4",
          })}
        >
          {repo.description}
        </p>
      )}

      <div
        className={css({
          display: "flex",
          gap: "3",
          mt: "2",
          fontSize: "xs",
          color: "text.muted",
        })}
      >
        {repo.language && (
          <span className={css({ display: "flex", alignItems: "center", gap: "1" })}>
            <span
              className={css({
                width: "10px",
                height: "10px",
                borderRadius: "full",
                bg: "blue.400",
              })}
              aria-hidden="true"
            />
            {repo.language}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span>
            {repo.forks_count.toLocaleString()} fork{repo.forks_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </a>
  );
}
