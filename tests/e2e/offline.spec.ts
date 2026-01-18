import { test, expect } from "./fixtures";

test.describe("Offline functionality", () => {
  test("should detect offline state via navigator.onLine", async ({ page }) => {
    await page.goto("/");

    const initialOnline = await page.evaluate(() => navigator.onLine);
    expect(initialOnline).toBe(true);

    await page.evaluate(() => {
      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      window.dispatchEvent(new Event("offline"));
    });

    const offlineSpan = page.locator("span", { hasText: "Offline" });
    await expect(offlineSpan).toBeVisible({ timeout: 5000 });
  });
});
