import { logger } from "./logger";
import { config } from "./config";

const CACHE_PREFIX = "github-search:";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  lastAccessed: number;
}

export function getFromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();

    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    entry.lastAccessed = now;
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));

    return entry.data;
  } catch (err) {
    logger.warn("Failed to read from cache", err);
    return null;
  }
}

function evictLRU(): void {
  const entries: { key: string; lastAccessed: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entry = JSON.parse(raw) as CacheEntry<unknown>;
          entries.push({ key, lastAccessed: entry.lastAccessed || entry.timestamp });
        }
      } catch {
        if (key) localStorage.removeItem(key);
      }
    }
  }

  entries.sort((a, b) => a.lastAccessed - b.lastAccessed);

  const toRemove = entries.length - config.cache.maxEntries + 1;
  if (toRemove > 0) {
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(entries[i].key);
      logger.debug("LRU evicted cache entry", { key: entries[i].key });
    }
  }
}

export function setInCache<T>(key: string, data: T, ttl: number = config.cache.ttlMs): void {
  try {
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) cacheKeys.push(k);
    }
    if (cacheKeys.length >= config.cache.maxEntries) {
      evictLRU();
    }

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      lastAccessed: now,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      logger.warn("localStorage quota exceeded, evicting LRU entries");
      evictLRU();
      try {
        const now = Date.now();
        const entry: CacheEntry<T> = { data, timestamp: now, ttl, lastAccessed: now };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
        return;
      } catch {
      }
    }
    logger.warn("Failed to write to cache", err);
  }
}

export function removeFromCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (err) {
    logger.warn("Failed to remove from cache", err);
  }
}

export function clearCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (err) {
    logger.warn("Failed to clear cache", err);
  }
}
