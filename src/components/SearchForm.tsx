import { useCallback, useRef, useState, type FormEvent } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { css } from "../../styled-system/css";
import { useClipboard } from "../hooks/useClipboard";
import { useHotkeys } from "react-hotkeys-hook";
import { CloseIcon, ClipboardPasteIcon, SearchIcon } from "./icons";

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

  const debouncedSearch = useDebounceCallback((q: string) => {
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
              <CloseIcon />
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
            <ClipboardPasteIcon />
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
            border: "1px solid",
            borderColor: "blue.600",
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
              <SearchIcon />
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
