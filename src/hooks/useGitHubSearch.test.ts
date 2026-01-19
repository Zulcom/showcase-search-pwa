import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGitHubSearch, LoadingState } from "./useGitHubSearch";
import * as githubApi from "../api/github";
import type { GitHubUser } from "../types/github.generated";

vi.mock("../api/github");

const mockUsers: GitHubUser[] = [
  {
    id: 1,
    login: "user1",
    avatar_url: "https://example.com/1.png",
    html_url: "https://github.com/user1",
    node_id: "node1",
    gravatar_id: null,
    url: "https://api.github.com/users/user1",
    followers_url: "https://api.github.com/users/user1/followers",
    following_url: "https://api.github.com/users/user1/following{/other_user}",
    gists_url: "https://api.github.com/users/user1/gists{/gist_id}",
    starred_url: "https://api.github.com/users/user1/starred{/owner}{/repo}",
    subscriptions_url: "https://api.github.com/users/user1/subscriptions",
    organizations_url: "https://api.github.com/users/user1/orgs",
    repos_url: "https://api.github.com/users/user1/repos",
    events_url: "https://api.github.com/users/user1/events{/privacy}",
    received_events_url: "https://api.github.com/users/user1/received_events",
    type: "User",
    site_admin: false,
  },
];

describe("useGitHubSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in idle state with no query", () => {
    const { result } = renderHook(() => useGitHubSearch());

    expect(result.current.loadingState).toBe(LoadingState.NOT_INIT);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.users).toEqual([]);
    expect(result.current.fetchError).toBeNull();
  });

  it("should stay idle with null query", () => {
    const { result } = renderHook(() => useGitHubSearch(null));

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("should stay idle with empty string query", () => {
    const { result } = renderHook(() => useGitHubSearch(""));

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("should stay idle with query shorter than 3 characters", () => {
    const { result } = renderHook(() => useGitHubSearch("ab"));

    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(githubApi.searchUsers).not.toHaveBeenCalled();
  });

  it("should search and return users when query is provided", async () => {
    vi.mocked(githubApi.searchUsers).mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: mockUsers,
    });

    const { result } = renderHook(() => useGitHubSearch("test"));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.loadingState).toBe(LoadingState.SUCCESS);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.fetchError).toBeNull();
    expect(githubApi.searchUsers).toHaveBeenCalledWith("test", 5);
  });

  it("should refetch when query changes", async () => {
    vi.mocked(githubApi.searchUsers).mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: mockUsers,
    });

    const { result, rerender } = renderHook(({ query }) => useGitHubSearch(query), {
      initialProps: { query: "first" },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(githubApi.searchUsers).toHaveBeenCalledWith("first", 5);

    rerender({ query: "second" });

    await waitFor(() => {
      expect(githubApi.searchUsers).toHaveBeenCalledWith("second", 5);
    });
  });

  it("should handle search error", async () => {
    vi.mocked(githubApi.searchUsers).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useGitHubSearch("test"));

    await waitFor(() => {
      expect(result.current.loadingState).toBe(LoadingState.ERROR);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.fetchError).toBe("API Error");
    expect(result.current.users).toEqual([]);
  });

  it("should handle non-Error rejection", async () => {
    vi.mocked(githubApi.searchUsers).mockRejectedValue("Unknown error");

    const { result } = renderHook(() => useGitHubSearch("test"));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.fetchError).toBe("Failed to search users");
  });

  it("should ignore cancelled search errors", async () => {
    vi.mocked(githubApi.searchUsers).mockRejectedValue(new Error("Search cancelled"));

    const { result } = renderHook(() => useGitHubSearch("test"));

    await new Promise((r) => setTimeout(r, 50));

    expect(result.current.isError).toBe(false);
    expect(result.current.fetchError).toBeNull();
  });

  it("should reset state when query becomes null", async () => {
    vi.mocked(githubApi.searchUsers).mockResolvedValue({
      total_count: 1,
      incomplete_results: false,
      items: mockUsers,
    });

    const { result, rerender } = renderHook(({ query }) => useGitHubSearch(query), {
      initialProps: { query: "test" as string | null },
    });

    await waitFor(() => {
      expect(result.current.users.length).toBe(1);
    });

    result.current.reset();
    rerender({ query: null });

    expect(result.current.loadingState).toBe(LoadingState.NOT_INIT);
    expect(result.current.isIdle).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.fetchError).toBeNull();
  });
});
