import { test, expect } from "./fixtures";

test.describe("Search functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have search form", async ({ page }) => {
    const searchForm = page.getByRole("search", { name: "Search GitHub users" });
    await expect(searchForm).toBeVisible();

    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search GitHub users...");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await expect(searchButton).toBeVisible();
  });

  test("should disable search button when less than 3 characters", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    const searchButton = page.locator('button[type="submit"]');

    await searchInput.fill("ab");
    await expect(searchButton).toBeDisabled();

    await searchInput.clear();
    await searchInput.fill("abc");
    await expect(searchButton).toBeEnabled();
  });

  test("should search and display results", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("facebook");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');
    const userList = page.getByRole("list", { name: "GitHub users" });
    await expect(userList).toBeVisible();
  });

  test("should clear search with clear button", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("test");

    const clearButton = page.getByRole("button", { name: "Clear search" });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    await expect(searchInput).toHaveValue("");
  });
});
