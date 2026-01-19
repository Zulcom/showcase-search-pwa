export type { SimpleUser as GitHubUser, Repository as GitHubRepository } from "./github.generated";

export interface GitHubUserSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: import("./github.generated").SimpleUser[];
}

export interface GitHubError {
  message: string;
  documentation_url?: string;
}
