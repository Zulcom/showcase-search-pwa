import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useInfiniteRepos } from "./useInfiniteRepos";
import * as githubApi from "../api/github";

vi.mock("../api/github");

const mockRepos = [
  {
    id: 1,
    name: "repo1",
    full_name: "user/repo1",
    html_url: "https://github.com/user/repo1",
    description: "Test repo 1",
    stargazers_count: 100,
    forks_count: 10,
    language: "TypeScript",
  },
  {
    id: 2,
    name: "repo2",
    full_name: "user/repo2",
    html_url: "https://github.com/user/repo2",
    description: "Test repo 2",
    stargazers_count: 50,
    forks_count: 5,
    language: "JavaScript",
  },
];

describe("useInfiniteRepos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with empty state", () => {
    const { result } = renderHook(() => useInfiniteRepos());

    expect(result.current.repos).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should load repos for a user", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue(mockRepos as never);

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await waitFor(() => {
      expect(result.current.repos).toEqual(mockRepos);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle load error", async () => {
    vi.mocked(githubApi.getUserRepos).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("API Error");
      expect(result.current.repos).toEqual([]);
    });
  });

  it("should reset state", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue(mockRepos as never);

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.repos).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should not load if username is empty", async () => {
    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("");
    });

    expect(githubApi.getUserRepos).not.toHaveBeenCalled();
  });

  it("should load more repos", async () => {
    const page1Repos = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      name: `repo${i}`,
      full_name: `user/repo${i}`,
      html_url: `https://github.com/user/repo${i}`,
      description: `Test repo ${i}`,
      stargazers_count: 10,
      forks_count: 1,
      language: "TypeScript",
    }));

    const page2Repos = Array.from({ length: 10 }, (_, i) => ({
      id: 30 + i,
      name: `repo${30 + i}`,
      full_name: `user/repo${30 + i}`,
      html_url: `https://github.com/user/repo${30 + i}`,
      description: `Test repo ${30 + i}`,
      stargazers_count: 5,
      forks_count: 0,
      language: "JavaScript",
    }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(page1Repos as never)
      .mockResolvedValueOnce(page2Repos as never);

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await waitFor(() => {
      expect(result.current.repos.length).toBe(30);
      expect(result.current.hasMore).toBe(true);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.repos.length).toBe(40);
      expect(result.current.hasMore).toBe(false);
    });
  });

  it("should not load more if hasMore is false", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue(mockRepos as never);

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await waitFor(() => {
      expect(result.current.hasMore).toBe(false);
    });

    vi.clearAllMocks();

    await act(async () => {
      await result.current.loadMore();
    });

    expect(githubApi.getUserRepos).not.toHaveBeenCalled();
  });

  it("should handle loadMore error", async () => {
    const page1Repos = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      name: `repo${i}`,
      full_name: `user/repo${i}`,
      html_url: `https://github.com/user/repo${i}`,
      description: `Test repo ${i}`,
      stargazers_count: 10,
      forks_count: 1,
      language: "TypeScript",
    }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(page1Repos as never)
      .mockRejectedValueOnce(new Error("Load more failed"));

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Load more failed");
    });
  });

  it("should handle non-Error rejection in loadMore", async () => {
    const page1Repos = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      name: `repo${i}`,
      full_name: `user/repo${i}`,
      html_url: `https://github.com/user/repo${i}`,
      description: `Test repo ${i}`,
      stargazers_count: 10,
      forks_count: 1,
      language: "TypeScript",
    }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(page1Repos as never)
      .mockRejectedValueOnce("String error");

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to load more repositories");
    });
  });

  it("should handle non-Error rejection in loadRepos", async () => {
    vi.mocked(githubApi.getUserRepos).mockRejectedValue("String error");

    const { result } = renderHook(() => useInfiniteRepos());

    await act(async () => {
      await result.current.loadRepos("testuser");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to load repositories");
    });
  });
});
