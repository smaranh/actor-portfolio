import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Reels", () => {
  test("lists all four reels with their titles", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.reelsSection.scrollIntoViewIfNeeded();

    await expect(home.reelCards).toHaveCount(4);
    await expect(home.reelByTitle("First Responders Part 1")).toBeVisible();
    await expect(home.reelByTitle("First Responders Part 2")).toBeVisible();
    await expect(home.reelByTitle("Being Charlie")).toBeVisible();
    await expect(home.reelByTitle("Slate Shot LA")).toBeVisible();
  });

  test("clicking a reel opens the embed dialog", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.reelsSection.scrollIntoViewIfNeeded();

    await expect(home.reelDialog).toBeHidden();
    await home.reelByTitle("Being Charlie").click();
    await expect(home.reelDialog).toBeVisible();
    // The dialog should contain a YouTube embed iframe.
    await expect(home.reelDialog.locator("iframe")).toBeVisible();
  });

  test("Escape closes the embed dialog", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.reelsSection.scrollIntoViewIfNeeded();

    await home.reelByTitle("Being Charlie").click();
    await expect(home.reelDialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(home.reelDialog).toBeHidden();
  });

  test("clicking the dialog backdrop closes the embed", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.reelsSection.scrollIntoViewIfNeeded();

    await home.reelByTitle("Being Charlie").click();
    await expect(home.reelDialog).toBeVisible();

    // Click the dialog container itself (the backdrop) at a corner away
    // from the iframe, which has stopPropagation on its wrapper.
    await home.reelDialog.click({ position: { x: 5, y: 5 } });
    await expect(home.reelDialog).toBeHidden();
  });
});
