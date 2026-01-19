import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useUserRepos } from "./useUserRepos";
import * as githubApi from "../api/github";
import { config } from "../lib/config";
import type { GitHubUser, GitHubRepository } from "../types/github";

vi.mock("../api/github");

const REPOS_PER_PAGE = config.pagination.reposPerPage;

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

const mockRepos: GitHubRepository[] = [
  // @ts-ignore
  {
    id: 1,
    node_id: "repo1",
    name: "repo1",
    full_name: "user1/repo1",
    private: false,
    owner: mockUsers[0],
    html_url: "https://github.com/user1/repo1",
    description: "Test repo",
    fork: false,
    url: "https://api.github.com/repos/user1/repo1",
    created_at: "2021-01-01T00:00:00Z",
    updated_at: "2021-01-01T00:00:00Z",
    pushed_at: "2021-01-01T00:00:00Z",
    homepage: null,
    size: 100,
    stargazers_count: 10,
    watchers_count: 10,
    language: "TypeScript",
    forks_count: 5,
    open_issues_count: 0,
    default_branch: "main",
    visibility: "public",
  },
];

describe("useUserRepos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default repo state for unknown user", () => {
    const { result } = renderHook(() => useUserRepos(mockUsers));

    const state = result.current.getRepoState("unknown");
    expect(state.repos).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should load repos for a user", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue(mockRepos);

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    expect(result.current.getRepoState("user1").isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.getRepoState("user1").isLoading).toBe(false);
    });

    const state = result.current.getRepoState("user1");
    expect(state.repos).toEqual(mockRepos);
    expect(state.error).toBeNull();
    expect(state.page).toBe(1);
  });

  it("should handle load error", async () => {
    vi.mocked(githubApi.getUserRepos).mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").error).toBe("API Error");
    });

    expect(result.current.getRepoState("user1").repos).toEqual([]);
  });

  it("should handle non-Error rejection", async () => {
    vi.mocked(githubApi.getUserRepos).mockRejectedValue("Unknown");

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").error).toBe("Failed to load repositories");
    });
  });

  it("should load more repos", async () => {
    const firstPageRepos = Array(REPOS_PER_PAGE)
      .fill(null)
      .map((_, i) => ({ ...mockRepos[0], id: i, name: `repo${i}` }));
    const secondPageRepos = Array(REPOS_PER_PAGE)
      .fill(null)
      .map((_, i) => ({
        ...mockRepos[0],
        id: i + REPOS_PER_PAGE,
        name: `repo${i + REPOS_PER_PAGE}`,
      }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(firstPageRepos)
      .mockResolvedValueOnce(secondPageRepos);

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").repos.length).toBe(REPOS_PER_PAGE);
    });

    expect(result.current.getRepoState("user1").hasMore).toBe(true);

    act(() => {
      result.current.loadMoreForUser("user1");
    });

    expect(result.current.getRepoState("user1").isLoadingMore).toBe(true);

    await waitFor(() => {
      expect(result.current.getRepoState("user1").repos.length).toBe(REPOS_PER_PAGE * 2);
    });

    expect(result.current.getRepoState("user1").page).toBe(2);
  });

  it("should not load more if already loading", async () => {
    const fullPageRepos = Array(REPOS_PER_PAGE)
      .fill(null)
      .map((_, i) => ({ ...mockRepos[0], id: i }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(fullPageRepos)
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(fullPageRepos), 100))
      );

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").isLoading).toBe(false);
    });

    act(() => {
      result.current.loadMoreForUser("user1");
    });

    act(() => {
      result.current.loadMoreForUser("user1");
    });

    await waitFor(() => {
      expect(githubApi.getUserRepos).toHaveBeenCalledTimes(2);
    });
  });

  it("should not load more if no more pages", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue([mockRepos[0]]);

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").hasMore).toBe(false);
    });

    act(() => {
      result.current.loadMoreForUser("user1");
    });

    expect(githubApi.getUserRepos).toHaveBeenCalledTimes(1);
  });

  it("should handle loadMore error", async () => {
    const firstPageRepos = Array(REPOS_PER_PAGE)
      .fill(null)
      .map((_, i) => ({ ...mockRepos[0], id: i }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(firstPageRepos)
      .mockRejectedValueOnce(new Error("Load more failed"));

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").repos.length).toBe(REPOS_PER_PAGE);
    });

    act(() => {
      result.current.loadMoreForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").error).toBe("Load more failed");
    });

    expect(result.current.getRepoState("user1").repos.length).toBe(REPOS_PER_PAGE);
  });

  it("should reset user state", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue(mockRepos);

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").repos.length).toBe(1);
    });

    act(() => {
      result.current.resetForUser("user1");
    });

    const state = result.current.getRepoState("user1");
    expect(state.repos).toEqual([]);
    expect(state.isLoading).toBe(false);
  });

  it("should clear stale entries when users change", async () => {
    vi.mocked(githubApi.getUserRepos).mockResolvedValue(mockRepos);

    const { result, rerender } = renderHook(({ users }) => useUserRepos(users), {
      initialProps: { users: mockUsers },
    });

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").repos.length).toBe(1);
    });

    const newUsers = [{ ...mockUsers[0], id: 2, login: "user2" }];
    rerender({ users: newUsers });

    const state = result.current.getRepoState("user1");
    expect(state.repos).toEqual([]);
  });

  it("should not load more for unknown user", () => {
    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadMoreForUser("unknown");
    });

    expect(githubApi.getUserRepos).not.toHaveBeenCalled();
  });

  it("should handle loadMore non-Error rejection", async () => {
    const firstPageRepos = Array(REPOS_PER_PAGE)
      .fill(null)
      .map((_, i) => ({ ...mockRepos[0], id: i }));

    vi.mocked(githubApi.getUserRepos)
      .mockResolvedValueOnce(firstPageRepos)
      .mockRejectedValueOnce("Unknown error");

    const { result } = renderHook(() => useUserRepos(mockUsers));

    act(() => {
      result.current.loadReposForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").repos.length).toBe(REPOS_PER_PAGE);
    });

    act(() => {
      result.current.loadMoreForUser("user1");
    });

    await waitFor(() => {
      expect(result.current.getRepoState("user1").error).toBe("Failed to load more repositories");
    });
  });
});
