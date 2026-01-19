import { useAutoAnimate } from "@formkit/auto-animate/react";
import { css } from "../../styled-system/css";
import { UserItem } from "./UserItem";
import { useUserRepos } from "../hooks/useUserRepos";
import type { GitHubUser } from "../types/github";

interface UserAccordionProps {
  users: GitHubUser[];
  selectedIndex: number;
  expandedIndex: number | null;
  onSelectUser: (index: number) => void;
  onExpandUser: (index: number | null) => void;
}

export default function UserAccordion({
  users,
  selectedIndex,
  expandedIndex,
  onSelectUser,
  onExpandUser,
}: UserAccordionProps) {
  const [parentRef] = useAutoAnimate();
  const { getRepoState, loadReposForUser, loadMoreForUser, resetForUser } = useUserRepos(users);

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
            isSelected={selectedIndex === index}
            isExpanded={expandedIndex === index}
            repoState={getRepoState(user.login)}
            onSelect={() => onSelectUser(index)}
            onToggle={() => onExpandUser(expandedIndex === index ? null : index)}
            onLoadRepos={() => loadReposForUser(user.login)}
            onLoadMore={() => loadMoreForUser(user.login)}
            onReset={() => resetForUser(user.login)}
          />
        </div>
      ))}
    </div>
  );
}
