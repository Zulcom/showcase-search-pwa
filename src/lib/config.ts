function getEnvString(key: string, defaultValue: string): string {
  return import.meta.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export const config = {
  github: {
    apiUrl: getEnvString("VITE_GITHUB_API_URL", "https://api.github.com"),
    token: getEnvString("VITE_GITHUB_TOKEN", ""),
  },

  cache: {
    ttlMs: getEnvNumber("VITE_CACHE_TTL_MS", 300000),
    maxEntries: getEnvNumber("VITE_CACHE_MAX_ENTRIES", 50),
  },

  retry: {
    count: getEnvNumber("VITE_RETRY_COUNT", 3),
    minTimeoutMs: getEnvNumber("VITE_RETRY_MIN_TIMEOUT_MS", 1000),
    maxTimeoutMs: getEnvNumber("VITE_RETRY_MAX_TIMEOUT_MS", 10000),
  },

  pagination: {
    reposPerPage: getEnvNumber("VITE_REPOS_PER_PAGE", 30),
    usersPerPage: getEnvNumber("VITE_USERS_PER_PAGE", 5),
  },

  ui: {
    repoListMaxHeight: getEnvNumber("VITE_REPO_LIST_MAX_HEIGHT", 400),
    repoListScrollThreshold: getEnvNumber("VITE_REPO_LIST_SCROLL_THRESHOLD", 10),
    loadMoreThreshold: getEnvNumber("VITE_LOAD_MORE_THRESHOLD", 100),
  },

  search: {
    defaultSuggestions: [
      "torvalds",
      "microsoft",
      "tradebyte",
      "zulcom",
      "howtologinquickwiththirtyninecharacters",
    ],
  },
} as const;
