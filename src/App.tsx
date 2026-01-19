import { useState, useCallback, useEffect, startTransition, lazy, Suspense } from "react";
import { css } from "../styled-system/css";
import { SearchForm } from "./components/SearchForm";
import { SearchHistory } from "./components/SearchHistory";
import { ThemeToggle } from "./components/ThemeToggle";
import { KeyboardHints } from "./components/KeyboardHints";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Skeleton } from "./components/Skeleton";
import { useSearchHistory } from "./hooks/useSearchHistory";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { searchUsers } from "./api/github";
import type { GitHubUser } from "./types/github.generated";

const UserAccordion = lazy(() =>
  import("./components/UserAccordion").then((m) => ({ default: m.UserAccordion }))
);
const WebVitals = lazy(() =>
  import("./components/WebVitals").then((m) => ({ default: m.WebVitals }))
);

function App() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { selectedIndex, setSelectedIndex, expandedIndex, setExpandedIndex } = useKeyboardNav(
    users.length
  );

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setError("Please enter at least 3 characters");
        return;
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const result = await searchUsers(searchQuery, 5);
        startTransition(() => {
          setUsers(result.items);
          setSelectedIndex(0);
          setExpandedIndex(null);
        });
        addToHistory(searchQuery);
      } catch (err) {
        if (err instanceof Error && err.message === "Search cancelled") return;
        setError(err instanceof Error ? err.message : "Failed to search users");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [addToHistory, setSelectedIndex, setExpandedIndex]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setUsers([]);
    setError(null);
    setHasSearched(false);
    setSelectedIndex(0);
    setExpandedIndex(null);
  }, [setSelectedIndex, setExpandedIndex]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (hasSearched && query) {
      document.title = `"${query}" - GitHub User Search`;
    } else {
      document.title = "GitHub User Search - Explore Users & Repositories";
    }
  }, [query, hasSearched]);

  const showCentered = !hasSearched && users.length === 0;

  return (
    <div
      className={css({
        minHeight: "100vh",
        bg: "bg.canvas",
        color: "text.default",
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.2s, color 0.2s",
      })}
    >
      <header
        className={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: "4",
          borderBottom: "1px solid",
          borderColor: "border.default",
        })}
      >
        <h1
          className={css({
            fontSize: "xl",
            fontWeight: "bold",
          })}
        >
          GitHub User Search
        </h1>
        <div className={css({ display: "flex", gap: "2", alignItems: "center" })}>
          {isOffline && (
            <span
              className={css({
                px: "2",
                py: "1",
                bg: "yellow.500",
                color: "black",
                borderRadius: "md",
                fontSize: "sm",
              })}
              role="status"
              aria-live="polite"
            >
              Offline
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main
        className={css({
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: showCentered ? "center" : "flex-start",
          p: "4",
          transition: "all 0.3s ease",
        })}
      >
        <div
          className={css({
            w: "full",
            maxW: "2xl",
            display: "flex",
            flexDirection: "column",
            gap: "4",
          })}
        >
          <ErrorBoundary>
            <SearchForm
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              onClear={handleClear}
              isLoading={isLoading}
              error={error}
            />

            <SearchHistory
              history={history}
              currentQuery={query}
              onSelect={(q) => {
                setQuery(q);
                handleSearch(q);
              }}
              onClear={clearHistory}
            />

          </ErrorBoundary>

          {isLoading && (
            <div role="status" aria-label="Loading search results">
              <Skeleton count={5} />
            </div>
          )}

          {!isLoading && users.length > 0 && (
            <ErrorBoundary>
              <p
                className={css({
                  fontSize: "sm",
                  color: "text.muted",
                  mb: "2",
                })}
              >
                Showing users for "{query}"
              </p>
              <Suspense fallback={<Skeleton count={5} />}>
                <UserAccordion
                  users={users}
                  selectedIndex={selectedIndex}
                  expandedIndex={expandedIndex}
                  onSelectUser={setSelectedIndex}
                  onExpandUser={setExpandedIndex}
                />
              </Suspense>
            </ErrorBoundary>
          )}

          {!isLoading && hasSearched && users.length === 0 && !error && (
            <p className={css({ textAlign: "center", color: "text.muted", py: "8" })} role="status">
              No users found for "{query}"
            </p>
          )}
        </div>
      </main>

      <footer
        className={css({
          borderTop: "1px solid",
          borderColor: "border.default",
          p: "4",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "2",
        })}
      >
        <KeyboardHints />
        <Suspense fallback={null}>
          <WebVitals />
        </Suspense>
      </footer>
    </div>
  );
}

export default App;
