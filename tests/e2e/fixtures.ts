import { test as base, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const coverageDir = path.join(process.cwd(), "coverage-e2e");

const mockUserSearchResponse = {
  total_count: 5,
  incomplete_results: false,
  items: [
    {
      login: "octocat",
      id: 583231,
      node_id: "MDQ6VXNlcjU4MzIzMQ==",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/octocat",
      html_url: "https://github.com/octocat",
      followers_url: "https://api.github.com/users/octocat/followers",
      following_url: "https://api.github.com/users/octocat/following{/other_user}",
      gists_url: "https://api.github.com/users/octocat/gists{/gist_id}",
      starred_url: "https://api.github.com/users/octocat/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/octocat/subscriptions",
      organizations_url: "https://api.github.com/users/octocat/orgs",
      repos_url: "https://api.github.com/users/octocat/repos",
      events_url: "https://api.github.com/users/octocat/events{/privacy}",
      received_events_url: "https://api.github.com/users/octocat/received_events",
      type: "User",
      site_admin: false,
    },
    {
      login: "google",
      id: 1342004,
      node_id: "MDEyOk9yZ2FuaXphdGlvbjEzNDIwMDQ=",
      avatar_url: "https://avatars.githubusercontent.com/u/1342004?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/google",
      html_url: "https://github.com/google",
      followers_url: "https://api.github.com/users/google/followers",
      following_url: "https://api.github.com/users/google/following{/other_user}",
      gists_url: "https://api.github.com/users/google/gists{/gist_id}",
      starred_url: "https://api.github.com/users/google/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/google/subscriptions",
      organizations_url: "https://api.github.com/users/google/orgs",
      repos_url: "https://api.github.com/users/google/repos",
      events_url: "https://api.github.com/users/google/events{/privacy}",
      received_events_url: "https://api.github.com/users/google/received_events",
      type: "Organization",
      site_admin: false,
    },
    {
      login: "facebook",
      id: 69631,
      node_id: "MDEyOk9yZ2FuaXphdGlvbjY5NjMx",
      avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/facebook",
      html_url: "https://github.com/facebook",
      followers_url: "https://api.github.com/users/facebook/followers",
      following_url: "https://api.github.com/users/facebook/following{/other_user}",
      gists_url: "https://api.github.com/users/facebook/gists{/gist_id}",
      starred_url: "https://api.github.com/users/facebook/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/facebook/subscriptions",
      organizations_url: "https://api.github.com/users/facebook/orgs",
      repos_url: "https://api.github.com/users/facebook/repos",
      events_url: "https://api.github.com/users/facebook/events{/privacy}",
      received_events_url: "https://api.github.com/users/facebook/received_events",
      type: "Organization",
      site_admin: false,
    },
    {
      login: "microsoft",
      id: 6154722,
      node_id: "MDEyOk9yZ2FuaXphdGlvbjYxNTQ3MjI=",
      avatar_url: "https://avatars.githubusercontent.com/u/6154722?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/microsoft",
      html_url: "https://github.com/microsoft",
      followers_url: "https://api.github.com/users/microsoft/followers",
      following_url: "https://api.github.com/users/microsoft/following{/other_user}",
      gists_url: "https://api.github.com/users/microsoft/gists{/gist_id}",
      starred_url: "https://api.github.com/users/microsoft/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/microsoft/subscriptions",
      organizations_url: "https://api.github.com/users/microsoft/orgs",
      repos_url: "https://api.github.com/users/microsoft/repos",
      events_url: "https://api.github.com/users/microsoft/events{/privacy}",
      received_events_url: "https://api.github.com/users/microsoft/received_events",
      type: "Organization",
      site_admin: false,
    },
    {
      login: "vuejs",
      id: 6128107,
      node_id: "MDEyOk9yZ2FuaXphdGlvbjYxMjgxMDc=",
      avatar_url: "https://avatars.githubusercontent.com/u/6128107?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/vuejs",
      html_url: "https://github.com/vuejs",
      followers_url: "https://api.github.com/users/vuejs/followers",
      following_url: "https://api.github.com/users/vuejs/following{/other_user}",
      gists_url: "https://api.github.com/users/vuejs/gists{/gist_id}",
      starred_url: "https://api.github.com/users/vuejs/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/vuejs/subscriptions",
      organizations_url: "https://api.github.com/users/vuejs/orgs",
      repos_url: "https://api.github.com/users/vuejs/repos",
      events_url: "https://api.github.com/users/vuejs/events{/privacy}",
      received_events_url: "https://api.github.com/users/vuejs/received_events",
      type: "Organization",
      site_admin: false,
    },
  ],
};

const mockReposResponse = [
  {
    id: 1296269,
    node_id: "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
    name: "Hello-World",
    full_name: "octocat/Hello-World",
    private: false,
    owner: mockUserSearchResponse.items[0],
    html_url: "https://github.com/octocat/Hello-World",
    description: "This is your first repo!",
    fork: false,
    url: "https://api.github.com/repos/octocat/Hello-World",
    stargazers_count: 2500,
    watchers_count: 2500,
    language: "JavaScript",
    forks_count: 1000,
    archived: false,
    disabled: false,
    open_issues_count: 10,
    topics: ["octocat", "atom", "electron", "api"],
    visibility: "public",
    default_branch: "main",
    created_at: "2011-01-26T19:01:12Z",
    updated_at: "2024-01-01T00:00:00Z",
    pushed_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 1296270,
    node_id: "MDEwOlJlcG9zaXRvcnkxMjk2Mjcw",
    name: "Spoon-Knife",
    full_name: "octocat/Spoon-Knife",
    private: false,
    owner: mockUserSearchResponse.items[0],
    html_url: "https://github.com/octocat/Spoon-Knife",
    description: "This repo is for demonstration purposes only.",
    fork: false,
    url: "https://api.github.com/repos/octocat/Spoon-Knife",
    stargazers_count: 12000,
    watchers_count: 12000,
    language: "HTML",
    forks_count: 140000,
    archived: false,
    disabled: false,
    open_issues_count: 5000,
    topics: ["demo"],
    visibility: "public",
    default_branch: "main",
    created_at: "2011-01-27T19:01:12Z",
    updated_at: "2024-01-01T00:00:00Z",
    pushed_at: "2024-01-01T00:00:00Z",
  },
];

export const test = base.extend({
  page: async ({ page, browserName }, use) => {
    await page.route("**/api.github.com/search/users**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUserSearchResponse),
      });
    });

    await page.route("**/api.github.com/users/*/repos**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockReposResponse),
      });
    });

    if (browserName === "chromium") {
      await page.coverage.startJSCoverage();
    }

    await use(page);

    if (browserName === "chromium") {
      const coverage = await page.coverage.stopJSCoverage();

      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = path.join(coverageDir, `coverage-${timestamp}-${random}.json`);

      const filteredCoverage = coverage.filter(
        (entry) => entry.url.includes("localhost:5173") && !entry.url.includes("node_modules")
      );

      fs.writeFileSync(filename, JSON.stringify(filteredCoverage, null, 2));
    }
  },
});

export { expect };
