import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Home page — smoke", () => {
  test("loads with no console or page errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const home = new HomePage(page);
    await expect(home.nav).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("hero section is visible on load", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.heroSection).toBeVisible();
    await expect(home.heroSection).toBeInViewport();
  });

  test("nav exposes all expected links by role", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.aboutLink).toBeVisible();
    await expect(home.reelsLink).toBeVisible();
    await expect(home.headshotsLink).toBeVisible();
    await expect(home.contactLink).toBeVisible();
  });

  test("skip link becomes visible on focus and lands on #main", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await page.keyboard.press("Tab");
    await expect(home.skipLink).toBeFocused();
    await expect(home.skipLink).toBeVisible();
    await home.skipLink.press("Enter");
    await expect(home.mainContent).toBeFocused();
  });
});
