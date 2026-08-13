import { test, expect } from "@playwright/test";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

test.describe("Home responsive visual checks", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Snapshots are generated once in Chromium");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("banner")).toBeVisible();
  });

  for (const viewport of viewports) {
    test(`${viewport.name} layout keeps the essential content visible`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(page.getByRole("heading", { name: /Ilumine suas finanças com segurança/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /Baixar Grátis/i })).toBeVisible();
      const screenshot = await page.screenshot({ animations: "disabled", fullPage: false });
      expect(screenshot).toMatchSnapshot(
        `home-${viewport.name}.png`,
        { maxDiffPixelRatio: 0.02 },
      );
    });
  }
});
