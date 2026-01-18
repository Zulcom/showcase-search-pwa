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
});
