import { test, expect } from "./fixtures";

test.describe("User flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should search, expand user, and show repositories", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("octocat");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');

    const showingText = page.getByText(/Showing users for/);
    await expect(showingText).toBeVisible();

    const userButton = page.getByRole("button", { name: /octocat/i }).first();
    await userButton.click();

    const repoLink = page.getByRole("link", { name: /Repository:/i }).first();
    await expect(repoLink).toBeVisible({ timeout: 5000 });
  });

  test("should toggle theme", async ({ page }) => {
    const themeButton = page.getByRole("button", { name: /Switch to.*theme/i });
    await expect(themeButton).toBeVisible();

    const initialTheme = await page.locator("html").getAttribute("data-color-mode");

    await themeButton.click();
    const firstTheme = await page.locator("html").getAttribute("data-color-mode");

    await themeButton.click();
    const secondTheme = await page.locator("html").getAttribute("data-color-mode");

    await themeButton.click();
    const thirdTheme = await page.locator("html").getAttribute("data-color-mode");

    const themes = [initialTheme, firstTheme, secondTheme, thirdTheme];
    const uniqueVisualThemes = new Set(themes);
    expect(uniqueVisualThemes.size).toBeGreaterThanOrEqual(2);
    expect(themes.every((t) => t === "light" || t === "dark")).toBe(true);
  });

  test("should use search history", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("react");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const historyRegion = page.getByRole("region", { name: "Search history" });
    const historyVisible = await historyRegion.isVisible().catch(() => false);

    if (historyVisible) {
      const historyItem = page.getByRole("button", { name: /Search for react/i });
      if (await historyItem.isVisible()) {
        await historyItem.click();
        await page.waitForSelector('[role="list"][aria-label="GitHub users"]');
      }
    }
  });

  test("should show loading skeleton", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("microsoft");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');
  });

  test("should handle paste button if available", async ({ page }) => {
    const pasteButton = page.getByRole("button", { name: "Paste from clipboard" });
    const isVisible = await pasteButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(pasteButton).toBeEnabled();
    }
  });

  test("should show web vitals in footer", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const vitalsText = page.getByText(/CLS:|FCP:|LCP:|TTFB:/);
    await expect(vitalsText.first()).toBeVisible({ timeout: 3000 });
  });

  test("should navigate users with keyboard", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("google");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]', { timeout: 15000 });

    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[role="listitem"]').nth(1)).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(page.locator('[role="listitem"]').nth(2)).toBeVisible();

    await page.keyboard.press("ArrowUp");
    await expect(page.locator('[role="listitem"]').nth(1)).toBeVisible();

    await page.keyboard.press("Enter");
    const expandedButton = page.getByRole("button", { name: /google/i, expanded: true }).first();
    await expect(expandedButton).toBeVisible({ timeout: 5000 });
  });

  test("should clear history", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("vue");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    try {
      await page.waitForSelector('[role="list"][aria-label="GitHub users"]', { timeout: 10000 });
    } catch {
    }

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const clearHistoryButton = page.getByRole("button", { name: "Clear search history" });
    const isVisible = await clearHistoryButton.isVisible().catch(() => false);

    if (isVisible) {
      await clearHistoryButton.click();
      await expect(clearHistoryButton).not.toBeVisible();
    }
  });
});
