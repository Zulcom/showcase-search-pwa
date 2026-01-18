import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchUsers, getUserRepos } from "./github";

vi.mock("../lib/retry", () => ({
  withRetry: vi.fn((fn) => fn()),
}));

const mockUserResponse = {
  total_count: 2,
  incomplete_results: false,
  items: [
    { id: 1, login: "user1", avatar_url: "https://example.com/1.png" },
    { id: 2, login: "user2", avatar_url: "https://example.com/2.png" },
  ],
};

const mockRepos = [
  { id: 1, name: "repo1", stargazers_count: 100 },
  { id: 2, name: "repo2", stargazers_count: 50 },
];

describe("github API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchUsers", () => {
    it("should search users and return results", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      } as Response);

      const result = await searchUsers("test", 5);

      expect(result.items).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/search/users?q=test&per_page=5"),
        expect.any(Object)
      );
    });

    it("should return cached results on second call", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUserResponse),
      } as Response);

      await searchUsers("cached", 5);
      await searchUsers("cached", 5);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should handle rate limit error", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: "API rate limit exceeded" }),
      } as Response);

      await expect(searchUsers("ratelimit")).rejects.toThrow("rate limit");
    });

    it("should handle 404 error", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: "Not Found" }),
      } as Response);

      await expect(searchUsers("notfound")).rejects.toThrow("not found");
    });
  });

  describe("getUserRepos", () => {
    it("should get user repos", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      } as Response);

      const result = await getUserRepos("testuser");

      expect(result).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/testuser/repos"),
        expect.any(Object)
      );
    });

    it("should handle pagination", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRepos),
      } as Response);

      await getUserRepos("paginateduser", 2, 50);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("page=2&per_page=50"),
        expect.any(Object)
      );
    });
  });
});
