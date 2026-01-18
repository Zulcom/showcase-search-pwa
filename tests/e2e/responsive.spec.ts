import { test, expect } from "@playwright/test";

test.describe("Responsive design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const searchForm = page.getByRole("search");
    await expect(searchForm).toBeVisible();

    const searchInput = page.getByRole("textbox", { name: "Search query" });
    await expect(searchInput).toBeVisible();
  });

  test("should work on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const searchForm = page.getByRole("search");
    await expect(searchForm).toBeVisible();
  });

  test("should work on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    const searchForm = page.getByRole("search");
    await expect(searchForm).toBeVisible();

    const keyboardHints = page.getByLabel("Keyboard shortcuts");
    await expect(keyboardHints).toBeVisible();
  });
});
