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
});
