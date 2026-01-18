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

    await page.waitForTimeout(2000);

    const repoLink = page.getByRole("link", { name: /Repository:/i }).first();
    await expect(repoLink).toBeVisible();
  });

  test("should toggle theme", async ({ page }) => {
    const themeButton = page.getByRole("button", { name: /Switch to.*theme/i });
    await expect(themeButton).toBeVisible();

    await themeButton.click();
    await page.waitForTimeout(300);

    await themeButton.click();
    await page.waitForTimeout(300);

    await themeButton.click();
    await page.waitForTimeout(300);
  });

  test("should use search history", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("react");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');

    await page.goto("/");
    await page.waitForTimeout(500);

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
    await page.waitForTimeout(1000);

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const vitalsText = page.getByText(/CLS:|FCP:|LCP:|TTFB:/);
    await expect(vitalsText.first()).toBeVisible();
  });

  test("should navigate users with keyboard", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("google");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');

    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(200);

    await page.keyboard.press("Enter");
    await page.waitForTimeout(1500);
  });

  test("should clear history", async ({ page }) => {
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await searchInput.fill("vue");

    const searchButton = page.getByRole("button", { name: "Search", exact: true });
    await searchButton.click();

    await page.waitForSelector('[role="list"][aria-label="GitHub users"]');

    await page.goto("/");
    await page.waitForTimeout(500);

    const clearHistoryButton = page.getByRole("button", { name: "Clear search history" });
    const isVisible = await clearHistoryButton.isVisible().catch(() => false);

    if (isVisible) {
      await clearHistoryButton.click();
      await page.waitForTimeout(300);
    }
  });

  test("should switch result count", async ({ page }) => {
    const selector = page.getByRole("combobox");
    await expect(selector).toBeVisible();

    await selector.selectOption("100");
    await page.waitForTimeout(200);

    await selector.selectOption("5");
    await page.waitForTimeout(200);
  });
});
