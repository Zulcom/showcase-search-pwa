import { css } from "../../styled-system/css";
import { StarIcon } from "./icons";
import type { GitHubRepository } from "../types/github";

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
          <StarIcon className={css({ color: "yellow.500" })} />
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
