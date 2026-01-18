import { test as base, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const coverageDir = path.join(process.cwd(), "coverage-e2e");

export const test = base.extend({
  page: async ({ page, browserName }, use) => {
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
