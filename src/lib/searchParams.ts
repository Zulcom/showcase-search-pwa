import { config } from "./config";

const SEARCH_PARAM = "q";

/**
 * Usernames for user accounts on GitHub can only contain alphanumeric characters and dashes (-).
 * @see https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/iam-configuration-reference/username-considerations-for-external-authentication
 */
export function sanitizeQuery(input: string): string {
  return input
    .trim()
    .slice(0, config.search.maxUsernameLength)
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
