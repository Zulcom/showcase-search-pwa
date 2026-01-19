import { useMemo } from "react";
import { css } from "../../styled-system/css";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { config } from "../lib/config";

interface SearchHistoryProps {
  history: string[];
  currentQuery: string;
  onSelect: (query: string) => void;
  onClear: () => void;
}

export function SearchHistory({ history, currentQuery, onSelect, onClear }: SearchHistoryProps) {
  const [parentRef] = useAutoAnimate();

  const hasHistory = history.length > 0;
  const items = hasHistory ? history : config.search.defaultSuggestions;

  const filteredItems = useMemo(() => {
    if (!currentQuery.trim()) return items;
    const lower = currentQuery.toLowerCase();
    return items.filter(
      (item) => item.toLowerCase().includes(lower) && item.toLowerCase() !== lower
    );
  }, [items, currentQuery]);

  if (filteredItems.length === 0) return null;

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2",
      })}
      role="region"
      aria-label="Search history"
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        })}
      >
        <span
          className={css({
            fontSize: "sm",
            color: "text.muted",
          })}
        >
          {hasHistory ? "Recent searches" : "Suggestions"}
        </span>
        {hasHistory && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search history"
            className={css({
              fontSize: "sm",
              color: "text.muted",
              bg: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              _hover: {
                color: "text.default",
              },
            })}
          >
            Clear
          </button>
        )}
      </div>

      <ul
        ref={parentRef}
        className={css({
          display: "flex",
          flexWrap: "wrap",
          gap: "2",
          listStyle: "none",
          p: "0",
          m: "0",
        })}
      >
        {filteredItems.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              aria-label={`Search for ${item}`}
              className={css({
                px: "3",
                py: "1.5",
                bg: "bg.subtle",
                border: "1px solid",
                borderColor: "border.default",
                borderRadius: "full",
                color: "text.default",
                fontSize: "sm",
                cursor: "pointer",
                transition: "all 0.2s",
                _hover: {
                  borderColor: "blue.500",
                  bg: "blue.500/10",
                },
              })}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
