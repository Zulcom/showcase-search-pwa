import { describe, it, expect, vi } from "vitest";
import { withRetry, HttpError } from "./retry";

describe("HttpError", () => {
  it("should create error with status code", () => {
    const error = new HttpError("Not Found", 404);
    expect(error.message).toBe("Not Found");
    expect(error.status).toBe(404);
    expect(error.name).toBe("HttpError");
  });

  it("should identify permanent errors", () => {
    const permanentCodes = [400, 401, 403, 404, 422];
    for (const code of permanentCodes) {
      const error = new HttpError("Error", code);
      expect(error.isPermanent).toBe(true);
      expect(error.isTransient).toBe(false);
      expect(error.isRateLimit).toBe(false);
    }
  });

  it("should identify transient errors", () => {
    const transientCodes = [408, 500, 502, 503, 504];
    for (const code of transientCodes) {
      const error = new HttpError("Error", code);
      expect(error.isTransient).toBe(true);
      expect(error.isPermanent).toBe(false);
      expect(error.isRateLimit).toBe(false);
    }
  });

  it("should identify rate limit errors", () => {
    const error = new HttpError("Too Many Requests", 429);
    expect(error.isRateLimit).toBe(true);
    expect(error.isPermanent).toBe(false);
    expect(error.isTransient).toBe(false);
  });
});

describe("withRetry", () => {
  it("should return result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("success");

    const result = await withRetry(fn, { retries: 0 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and succeed", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("fail")).mockResolvedValue("success");

    const result = await withRetry(fn, { retries: 1, minTimeout: 1 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("always fails"));

    await expect(withRetry(fn, { retries: 1, minTimeout: 1 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should not retry on AbortError", async () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";
    const fn = vi.fn().mockRejectedValue(abortError);

    await expect(withRetry(fn, { retries: 2, minTimeout: 1 })).rejects.toThrow("Aborted");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should not retry on rate limit errors", async () => {
    const rateLimitError = new HttpError("Too Many Requests", 429);
    const fn = vi.fn().mockRejectedValue(rateLimitError);

    await expect(withRetry(fn, { retries: 2, minTimeout: 1 })).rejects.toThrow("Too Many Requests");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should not retry on permanent HTTP errors", async () => {
    const permanentError = new HttpError("Not Found", 404);
    const fn = vi.fn().mockRejectedValue(permanentError);

    await expect(withRetry(fn, { retries: 2, minTimeout: 1 })).rejects.toThrow("Not Found");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on transient HTTP errors", async () => {
    const transientError = new HttpError("Service Unavailable", 503);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(transientError)
      .mockResolvedValue("success");

    const result = await withRetry(fn, { retries: 1, minTimeout: 1 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should retry on TypeError (network errors)", async () => {
    const networkError = new TypeError("Failed to fetch");
    const fn = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue("success");

    const result = await withRetry(fn, { retries: 1, minTimeout: 1 });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
