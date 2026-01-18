import { logger } from "./logger";

const CACHE_PREFIX = "github-search:";
const DEFAULT_TTL = 1000 * 60 * 60;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
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

    return entry.data;
  } catch (err) {
    logger.warn("Failed to read from cache", err);
    return null;
  }
}

export function setInCache<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (err) {
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
