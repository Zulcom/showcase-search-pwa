import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sanitizeQuery, getQueryFromURL, updateURL } from "./searchParams";

describe("searchParams", () => {
  describe("sanitizeQuery", () => {
    it("should return empty string for empty input", () => {
      expect(sanitizeQuery("")).toBe("");
    });

    it("should trim whitespace", () => {
      expect(sanitizeQuery("  test  ")).toBe("test");
    });

    it("should allow alphanumeric characters", () => {
      expect(sanitizeQuery("abc123")).toBe("abc123");
    });

    it("should allow dashes", () => {
      expect(sanitizeQuery("user-name")).toBe("user-name");
    });

    it("should remove special characters", () => {
      expect(sanitizeQuery("user<script>alert(1)</script>")).toBe("userscriptalert1script");
    });

    it("should remove spaces", () => {
      expect(sanitizeQuery("user name")).toBe("username");
    });

    it("should truncate to max length", () => {
      const longInput = "a".repeat(150);
      expect(sanitizeQuery(longInput).length).toBe(39);
    });

    it("should handle XSS attempts", () => {
      expect(sanitizeQuery('<img src="x" onerror="alert(1)">')).toBe("imgsrcxonerroralert1");
      expect(sanitizeQuery("javascript:alert(1)")).toBe("javascriptalert1");
      expect(sanitizeQuery("user&admin")).toBe("useradmin");
    });
  });

  describe("getQueryFromURL", () => {
    const originalLocation = window.location;

    beforeEach(() => {
      // @ts-expect-error - mocking location
      delete window.location;
    });

    afterEach(() => {
      // @ts-ignore - restoring mocked location
      window.location = originalLocation;
    });

    it("should return empty string when no query param", () => {
      // @ts-expect-error - mocking location
      window.location = { search: "" };
      expect(getQueryFromURL()).toBe("");
    });

    it("should return query param value", () => {
      // @ts-expect-error - mocking location
      window.location = { search: "?q=torvalds" };
      expect(getQueryFromURL()).toBe("torvalds");
    });

    it("should sanitize query from URL", () => {
      // @ts-expect-error - mocking location
      window.location = { search: "?q=<script>alert(1)</script>" };
      expect(getQueryFromURL()).toBe("scriptalert1script");
    });
  });

  describe("updateURL", () => {
    const originalLocation = window.location;

    beforeEach(() => {
      vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
      // @ts-expect-error - mocking location
      delete window.location;
      // @ts-expect-error - mocking location
      window.location = { href: "http://localhost:3000/", search: "" };
    });

    afterEach(() => {
      vi.restoreAllMocks();
      // @ts-ignore - restoring mocked location
      window.location = originalLocation;
    });

    it("should set query param when query is provided", () => {
      updateURL("torvalds");
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        expect.objectContaining({
          searchParams: expect.any(URLSearchParams),
        })
      );
    });

    it("should remove query param when query is empty", () => {
      // @ts-expect-error - mocking location
      window.location = { href: "http://localhost:3000/?q=test", search: "?q=test" };
      updateURL("");
      expect(window.history.replaceState).toHaveBeenCalled();
    });
  });
});
