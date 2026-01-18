import { useCallback, useRef, useState, useEffect, type FormEvent } from "react";
import { css } from "../../styled-system/css";
import { useClipboard } from "../hooks/useClipboard";
import { useDebouncedFn } from "../hooks/useDebounce";
import { useHotkeys } from "react-hotkeys-hook";

interface SearchFormProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
}

export function SearchForm({
  query,
  onQueryChange,
  onSearch,
  onClear,
  isLoading,
  error,
}: SearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { paste, isSupported: clipboardSupported } = useClipboard();

  const debouncedSearch = useDebouncedFn((q: string) => {
    if (q.length >= 3) {
      onSearch(q);
    }
  }, 300);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (query.trim().length >= 3) {
        onSearch(query.trim());
      }
    },
    [query, onSearch]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      onQueryChange(value);
      debouncedSearch(value);
    },
    [onQueryChange, debouncedSearch]
  );

  const handlePaste = useCallback(async () => {
    const text = await paste();
    if (text) {
      onQueryChange(text);
      if (text.length >= 3) {
        onSearch(text);
      }
    }
  }, [paste, onQueryChange, onSearch]);

  const handleClear = useCallback(() => {
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      inputRef.current?.focus();
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    "escape",
    () => {
      if (isFocused) {
        inputRef.current?.blur();
      } else if (query) {
        handleClear();
      }
    },
    { enableOnFormTags: true }
  );

  useEffect(() => {
    const handleResize = () => {
      if (isFocused && window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        document.documentElement.style.setProperty("--viewport-height", `${viewportHeight}px`);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, [isFocused]);

  return (
    <form
      onSubmit={handleSubmit}
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "2",
        w: "full",
      })}
      role="search"
      aria-label="Search GitHub users"
    >
      <div
        className={css({
          display: "flex",
          gap: "2",
          alignItems: "stretch",
        })}
      >
        <div
          className={css({
            position: "relative",
            flex: 1,
          })}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search GitHub users..."
            aria-label="Search query"
            aria-describedby={error ? "search-error" : undefined}
            aria-invalid={!!error}
            minLength={3}
            className={css({
              w: "full",
              px: "4",
              py: "3",
              pr: query ? "10" : "4",
              bg: "bg.subtle",
              border: "1px solid",
              borderColor: error ? "red.500" : "border.default",
              borderRadius: "lg",
              color: "text.default",
              fontSize: "md",
              outline: "none",
              transition: "all 0.2s",
              _focus: {
                borderColor: "blue.500",
                boxShadow: "0 0 0 3px token(colors.blue.500/20)",
              },
              _placeholder: {
                color: "text.muted",
              },
            })}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className={css({
                position: "absolute",
                right: "3",
                top: "50%",
                transform: "translateY(-50%)",
                p: "1",
                bg: "transparent",
                border: "none",
                cursor: "pointer",
                color: "text.muted",
                borderRadius: "full",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s",
                _hover: {
                  color: "text.default",
                },
              })}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          )}
        </div>

        {clipboardSupported && (
          <button
            type="button"
            onClick={handlePaste}
            aria-label="Paste from clipboard"
            className={css({
              px: "3",
              py: "2",
              bg: "bg.subtle",
              border: "1px solid",
              borderColor: "border.default",
              borderRadius: "lg",
              color: "text.muted",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              _hover: {
                borderColor: "blue.500",
                color: "text.default",
              },
            })}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || query.length < 3}
          aria-label={isLoading ? "Searching..." : "Search"}
          className={css({
            px: "6",
            py: "2",
            bg: "blue.500",
            border: "none",
            borderRadius: "lg",
            color: "white",
            fontWeight: "medium",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2",
            minWidth: "100px",
            transition: "all 0.2s",
            _hover: {
              bg: "blue.600",
            },
            _disabled: {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          })}
        >
          {isLoading ? (
            <span
              className={css({
                width: "18px",
                height: "18px",
                border: "2px solid",
                borderColor: "white",
                borderTopColor: "transparent",
                borderRadius: "full",
                animation: "spin 0.6s linear infinite",
              })}
              aria-hidden="true"
            />
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Search
            </>
          )}
        </button>
      </div>

      {error && (
        <p
          id="search-error"
          role="alert"
          className={css({
            color: "red.500",
            fontSize: "sm",
            mt: "1",
          })}
        >
          {error}
        </p>
      )}
    </form>
  );
}
