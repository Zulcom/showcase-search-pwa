import { useState, useCallback, lazy, Suspense, useEffect } from "react";
import { css } from "../styled-system/css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SearchForm } from "./components/SearchForm";
import { SearchHistory } from "./components/SearchHistory";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Skeleton } from "./components/Skeleton";
import { useSearchHistory } from "./hooks/useSearchHistory";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { useDocumentTitle } from "usehooks-ts";
import { useGitHubSearch } from "./hooks/useGitHubSearch";
import { sanitizeQuery, getQueryFromURL, updateURL } from "./lib/searchParams";

const UserAccordion = lazy(() => import("./components/UserAccordion"));

const MIN_QUERY_LENGTH = 3;
const DEFAULT_TITLE = "GitHub User Search - Explore Users & Repositories";

function App() {
  const [query, setQuery] = useState(getQueryFromURL);
  const [inputError, setInputError] = useState<string | null>(null);

  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { users, isLoading, isIdle, fetchError, reset } = useGitHubSearch(query);
  const { selectedIndex, setSelectedIndex, expandedIndex, setExpandedIndex } = useKeyboardNav(
    users.length
  );

  useEffect(() => {
    if (!isLoading && users.length > 0) {
      setSelectedIndex(0);
      setExpandedIndex(null);
    }
  }, [isLoading, users.length, setSelectedIndex, setExpandedIndex]);

  const hasSearched = !isIdle;
  useDocumentTitle(hasSearched && query ? `"${query}" - GitHub User Search` : DEFAULT_TITLE);

  const handleSearch = useCallback(
    (inputQuery: string) => {
      const sanitized = sanitizeQuery(inputQuery);
      if (sanitized.length < MIN_QUERY_LENGTH) {
        setInputError(`Please enter at least ${MIN_QUERY_LENGTH} characters`);
        return;
      }
      setInputError(null);
      setQuery(sanitized);
      updateURL(sanitized);
      addToHistory(sanitized);
    },
    [addToHistory]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setInputError(null);
    updateURL("");
    reset();
    setSelectedIndex(0);
    setExpandedIndex(null);
  }, [reset, setSelectedIndex, setExpandedIndex]);

  const displayError = inputError || fetchError;
  const showCentered = isIdle && users.length === 0;

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
      <Header />

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
              error={displayError}
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

          {!isLoading && hasSearched && users.length === 0 && !fetchError && (
            <p className={css({ textAlign: "center", color: "text.muted", py: "8" })} role="status">
              No users found for "{query}"
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
