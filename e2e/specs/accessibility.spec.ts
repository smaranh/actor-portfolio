import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { HomePage } from "../pages/HomePage";

test.describe("Accessibility — axe-core", () => {
  test("home page initial load has zero violations", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("reels modal open state has zero violations", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.reelsSection.scrollIntoViewIfNeeded();
    await home.reelCards.first().click();
    await expect(home.reelDialog).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(home.reelDialog).not.toBeVisible();
  });

  test("mobile nav overlay open state has zero violations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const home = new HomePage(page);
    await home.goto();
    await home.openMobileMenu();
    await expect(home.mobileOverlay).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await home.closeMobileMenu();
  });

  test("headshots carousel at index 2 has zero violations", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.headshotsSection.scrollIntoViewIfNeeded();
    await home.headshotsNext.click();
    await home.headshotsNext.click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
