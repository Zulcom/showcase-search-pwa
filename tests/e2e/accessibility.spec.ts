import { test, expect } from "./fixtures";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have proper page structure", async ({ page }) => {
    const main = page.locator("main");
    await expect(main).toBeVisible();

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("should have proper ARIA labels", async ({ page }) => {
    const searchForm = page.getByRole("search", { name: "Search GitHub users" });
    await expect(searchForm).toBeVisible();

    const themeToggle = page.getByRole("button", { name: /Switch to .* theme/ });
    await expect(themeToggle).toBeVisible();
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("should focus search with / key", async ({ page }) => {
    await page.keyboard.press("/");
    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await expect(searchInput).toBeFocused();
  });

  test("should show keyboard hints", async ({ page }) => {
    const hints = page.getByLabel("Keyboard shortcuts");
    await expect(hints).toBeVisible();
    await expect(hints).toContainText("Focus search");
    await expect(hints).toContainText("Navigate");
  });
});
