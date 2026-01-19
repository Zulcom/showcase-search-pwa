import { withRetry, HttpError } from "../lib/retry";
import { getFromCache, setInCache } from "../lib/cache";
import { logger } from "../lib/logger";
import type {
  GitHubUserSearchResponse,
  GitHubRepository,
  GitHubError,
} from "../types/github.generated";

const BASE_URL = "https://api.github.com";
const CACHE_TTL = 1000 * 60 * 5;

let currentSearchController: AbortController | null = null;

async function fetchWithAuth<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
    signal,
  });

  if (!response.ok) {
    const error: GitHubError = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }));

    if (response.status === 403 && error.message.includes("rate limit")) {
      throw new HttpError("GitHub API rate limit exceeded. Please try again later.", 429);
    }

    const message = error.message || `Request failed with status ${response.status}`;
    throw new HttpError(message, response.status);
  }

  return response.json();
}

export async function searchUsers(
  query: string,
  perPage: number = 5
): Promise<GitHubUserSearchResponse> {
  if (currentSearchController) {
    currentSearchController.abort();
  }
  currentSearchController = new AbortController();
  const { signal } = currentSearchController;

  const cacheKey = `users:${query}:${perPage}`;
  const cached = getFromCache<GitHubUserSearchResponse>(cacheKey);

  if (cached) {
    logger.debug("Returning cached user search results", { query, perPage });
    return cached;
  }

  logger.info("Searching GitHub users", { query, perPage });

  try {
    const result = await withRetry(() =>
      fetchWithAuth<GitHubUserSearchResponse>(
        `/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}`,
        signal
      )
    );

    setInCache(cacheKey, result, CACHE_TTL);
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Search cancelled");
    }
    throw error;
  }
}

export async function getUserRepos(
  username: string,
  page: number = 1,
  perPage: number = 30
): Promise<GitHubRepository[]> {
  const cacheKey = `repos:${username}:${page}:${perPage}`;
  const cached = getFromCache<GitHubRepository[]>(cacheKey);

  if (cached) {
    logger.debug("Returning cached repositories", { username, page, perPage });
    return cached;
  }

  logger.info("Fetching user repositories", { username, page, perPage });

  const result = await withRetry(() =>
    fetchWithAuth<GitHubRepository[]>(
      `/users/${encodeURIComponent(username)}/repos?page=${page}&per_page=${perPage}&sort=updated`
    )
  );

  setInCache(cacheKey, result, CACHE_TTL);
  return result;
}
