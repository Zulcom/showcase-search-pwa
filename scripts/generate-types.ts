import openapiTS, { astToString } from "openapi-typescript";
import fs from "node:fs/promises";
import path from "node:path";

const GITHUB_OPENAPI_URL =
  "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json";

const CUSTOM_TYPE_ALIASES = `
export type GitHubUser = components["schemas"]["simple-user"];
export type GitHubRepository = components["schemas"]["repository"];
export type GitHubError = { message: string; documentation_url?: string };
export type GitHubUserSearchResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
};
`;

async function generateTypes() {
  console.log("Fetching GitHub OpenAPI schema...");

  try {
    const ast = await openapiTS(new URL(GITHUB_OPENAPI_URL));
    const contents = astToString(ast);

    const finalContents = contents + CUSTOM_TYPE_ALIASES;

    const outputPath = path.join(process.cwd(), "src/types/github.generated.ts");
    await fs.writeFile(outputPath, finalContents, "utf-8");

    console.log(`Types generated successfully at ${outputPath}`);
  } catch (error) {
    console.error("Failed to generate types:", error);
    process.exit(1);
  }
}

generateTypes();
