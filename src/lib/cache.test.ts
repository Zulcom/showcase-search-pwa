import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getFromCache, setInCache, removeFromCache, clearCache } from "./cache";

describe("cache", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should store and retrieve data", () => {
    setInCache("test-key", { foo: "bar" });
    const result = getFromCache("test-key");
    expect(result).toEqual({ foo: "bar" });
  });

  it("should return null for non-existent keys", () => {
    const result = getFromCache("non-existent");
    expect(result).toBeNull();
  });

  it("should expire data after TTL", () => {
    setInCache("test-key", { foo: "bar" }, 1000);

    vi.advanceTimersByTime(500);
    expect(getFromCache("test-key")).toEqual({ foo: "bar" });

    vi.advanceTimersByTime(600);
    expect(getFromCache("test-key")).toBeNull();
  });

  it("should remove specific keys", () => {
    setInCache("key1", "value1");
    setInCache("key2", "value2");

    removeFromCache("key1");

    expect(getFromCache("key1")).toBeNull();
    expect(getFromCache("key2")).toBe("value2");
  });

  it("should clear all cache entries", () => {
    setInCache("key1", "value1");
    setInCache("key2", "value2");

    clearCache();

    expect(getFromCache("key1")).toBeNull();
    expect(getFromCache("key2")).toBeNull();
  });

  it("should handle getFromCache errors gracefully", () => {
    localStorage.setItem("github-search:invalid", "not-json{{{");
    const result = getFromCache("invalid");
    expect(result).toBeNull();
  });

  it("should handle setInCache errors gracefully", () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error("Storage full");
    });

    expect(() => setInCache("key", "value")).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  it("should handle removeFromCache errors gracefully", () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn(() => {
      throw new Error("Storage error");
    });

    expect(() => removeFromCache("key")).not.toThrow();

    localStorage.removeItem = originalRemoveItem;
  });

  it("should handle clearCache errors gracefully", () => {
    const originalKey = localStorage.key;
    localStorage.key = vi.fn(() => {
      throw new Error("Storage error");
    });

    expect(() => clearCache()).not.toThrow();

    localStorage.key = originalKey;
  });

  it("should not remove non-prefixed keys during clearCache", () => {
    localStorage.setItem("other-key", "value");
    setInCache("cached-key", "cached-value");

    clearCache();

    expect(localStorage.getItem("other-key")).toBe("value");
    expect(getFromCache("cached-key")).toBeNull();
  });

  it("should evict LRU entries and retry on QuotaExceededError", () => {
    setInCache("old-key", "old-value");
    vi.advanceTimersByTime(100);
    setInCache("newer-key", "newer-value");

    const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");
    let callCount = 0;
    const originalSetItem = localStorage.setItem.bind(localStorage);

    localStorage.setItem = vi.fn((key: string, value: string) => {
      if (key === "github-search:quota-key" && callCount === 0) {
        callCount++;
        throw quotaError;
      }
      return originalSetItem(key, value);
    });

    setInCache("quota-key", "quota-value");

    localStorage.setItem = originalSetItem;

    expect(getFromCache("quota-key")).toBe("quota-value");
  });

  it("should handle QuotaExceededError even when retry fails", () => {
    const quotaError = new DOMException("Quota exceeded", "QuotaExceededError");
    const originalSetItem = localStorage.setItem;

    localStorage.setItem = vi.fn(() => {
      throw quotaError;
    });

    expect(() => setInCache("key", "value")).not.toThrow();

    localStorage.setItem = originalSetItem;
  });

  it("should evict LRU entries when cache is full", () => {
    vi.doMock("./config", () => ({
      config: {
        cache: {
          maxEntries: 2,
          ttlMs: 300000,
        },
      },
    }));

    setInCache("key1", "value1");
    vi.advanceTimersByTime(100);
    setInCache("key2", "value2");
    vi.advanceTimersByTime(100);

    getFromCache("key1");
    vi.advanceTimersByTime(100);

    setInCache("key3", "value3");

    expect(getFromCache("key3")).toBe("value3");
  });

  it("should remove invalid cache entries during LRU eviction", () => {
    setInCache("valid-key", "valid-value");

    localStorage.setItem("github-search:invalid-entry", "not-valid-json{{{");

    for (let i = 0; i < 50; i++) {
      setInCache(`key${i}`, `value${i}`);
    }

    expect(localStorage.getItem("github-search:invalid-entry")).toBeNull();
  });
});
