const MAX_QUERY_LENGTH = 100;
const SEARCH_PARAM = "q";

export function sanitizeQuery(input: string): string {
  return input
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .replace(/[^a-zA-Z0-9-]/g, "");
}

export function getQueryFromURL(): string {
  const raw = new URLSearchParams(window.location.search).get(SEARCH_PARAM) || "";
  return sanitizeQuery(raw);
}

export function updateURL(query: string): void {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set(SEARCH_PARAM, query);
  } else {
    url.searchParams.delete(SEARCH_PARAM);
  }
  window.history.replaceState(null, "", url);
}
