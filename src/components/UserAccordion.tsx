import { useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { css } from "../../styled-system/css";
import { RepoList } from "./RepoList";
import { useInfiniteRepos } from "../hooks/useInfiniteRepos";
import type { GitHubUser } from "../types/github.generated";

interface UserAccordionProps {
  users: GitHubUser[];
  selectedIndex: number;
  expandedIndex: number | null;
  onSelectUser: (index: number) => void;
  onExpandUser: (index: number | null) => void;
  virtualized?: boolean;
}

interface UserItemProps {
  user: GitHubUser;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  virtualized?: boolean;
}

function UserItem({
  user,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  virtualized,
}: UserItemProps) {
  const { repos, isLoading, isLoadingMore, error, hasMore, loadRepos, loadMore, reset } =
    useInfiniteRepos();

  const handleToggle = useCallback(() => {
    onSelect();
    if (!isExpanded) {
      loadRepos(user.login);
    } else {
      reset();
    }
    onToggle();
  }, [isExpanded, loadRepos, onSelect, onToggle, reset, user.login]);

  return (
    <div
      className={css({
        bg: "bg.subtle",
        border: "1px solid",
        borderColor: isSelected ? "blue.500" : "border.default",
        borderRadius: "lg",
        overflow: "hidden",
        transition: "border-color 0.2s",
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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`repos-${user.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={css({ overflow: "hidden" })}
          >
            <div
              className={css({
                p: "4",
                pt: "0",
                borderTop: "1px solid",
                borderColor: "border.default",
              })}
            >
              {error ? (
                <p
                  className={css({
                    color: "red.500",
                    textAlign: "center",
                    py: "4",
                  })}
                  role="alert"
                >
                  {error}
                </p>
              ) : (
                <RepoList
                  repos={repos}
                  isLoading={isLoading}
                  isLoadingMore={isLoadingMore}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                  virtualized={virtualized}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function UserAccordion({
  users,
  selectedIndex,
  expandedIndex,
  onSelectUser,
  onExpandUser,
  virtualized = false,
}: UserAccordionProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 3,
    enabled: virtualized,
  });

  useEffect(() => {
    if (virtualized && parentRef.current) {
      virtualizer.scrollToIndex(selectedIndex, { align: "center" });
    }
  }, [selectedIndex, virtualized, virtualizer]);

  if (virtualized) {
    return (
      <div
        ref={parentRef}
        className={css({
          maxHeight: "600px",
          overflowY: "auto",
        })}
        role="list"
        aria-label="GitHub users"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const user = users[virtualRow.index];
            return (
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
                <div className={css({ pb: "3" })}>
                  <UserItem
                    user={user}
                    index={virtualRow.index}
                    isSelected={selectedIndex === virtualRow.index}
                    isExpanded={expandedIndex === virtualRow.index}
                    onSelect={() => onSelectUser(virtualRow.index)}
                    onToggle={() =>
                      onExpandUser(expandedIndex === virtualRow.index ? null : virtualRow.index)
                    }
                    virtualized={virtualized}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "3",
      })}
      role="list"
      aria-label="GitHub users"
      layout
    >
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          role="listitem"
        >
          <UserItem
            user={user}
            index={index}
            isSelected={selectedIndex === index}
            isExpanded={expandedIndex === index}
            onSelect={() => onSelectUser(index)}
            onToggle={() => onExpandUser(expandedIndex === index ? null : index)}
            virtualized={false}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
