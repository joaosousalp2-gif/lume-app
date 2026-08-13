import { test, expect } from "@playwright/test";

test.describe("Home accessibility smoke checks", () => {
  test("exposes semantic landmarks, named controls and alternative text", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const explorer = page.locator("#funcionalidades");
    await expect(explorer.getByRole("heading", { name: "Explore o Lume" })).toBeVisible();
    await expect(explorer.getByRole("tablist")).toBeVisible();
    await expect(explorer.getByRole("tab")).toHaveCount(5);
    await expect(explorer.getByRole("tab", { name: "Gestão Financeira" })).toHaveAttribute("aria-selected", "true");
    await expect(explorer.getByRole("tabpanel")).toBeVisible();

    const images = page.locator("img");
    for (let index = 0; index < await images.count(); index += 1) {
      await expect(images.nth(index)).toHaveAttribute("alt", /.+/);
    }

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Fechar tutorial" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: /Próximo|Concluir/ })).toBeVisible();
  });
});
