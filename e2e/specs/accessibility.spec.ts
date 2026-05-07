import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { HomePage } from "../pages/HomePage";

async function revealAllSections(page: import("@playwright/test").Page) {
  // Framer Motion's FadeInOnScroll keeps off-screen sections at opacity:0
  // until whileInView fires. Axe scans the full DOM and computes blended
  // colors for invisible text, producing false-positive color-contrast
  // violations. Scrolling through every section triggers whileInView for
  // each FadeInOnScroll wrapper before the axe analysis runs.
  for (const id of [
    "hero",
    "about",
    "reels",
    "headshots",
    "stats",
    "contact",
  ]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
  }
  // Wait for all Framer Motion wrappers to finish their fade-in (opacity:1).
  // scrollIntoViewIfNeeded triggers whileInView but doesn't wait for the
  // 0.55s transition to complete — without this wait, axe may still see
  // partially-transparent elements and compute blended text colors.
  await page.waitForFunction(() => {
    const els = document.querySelectorAll<HTMLElement>(
      "main [style*='opacity']"
    );
    return Array.from(els).every((el) => getComputedStyle(el).opacity === "1");
  });
  await page.locator("#hero").scrollIntoViewIfNeeded();
}

test.describe("Accessibility — axe-core", () => {
  test("home page initial load has zero violations", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await revealAllSections(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("reels modal open state has zero violations", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await revealAllSections(page);
    await home.reelsSection.scrollIntoViewIfNeeded();
    await home.reelCards.first().click();
    await expect(home.reelDialog).toBeVisible();
    // Exclude the YouTube iframe — its internal player DOM uses aria-label
    // on a div without a role, which is third-party markup we can't control.
    const results = await new AxeBuilder({ page }).exclude("iframe").analyze();
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
    await revealAllSections(page);
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
    await revealAllSections(page);
    await home.headshotsSection.scrollIntoViewIfNeeded();
    await home.headshotsNext.click();
    await expect(home.headshotsIndicator).toContainText("Image 2 of 4");
    await home.headshotsNext.click();
    await expect(home.headshotsIndicator).toContainText("Image 3 of 4");
    // Wait for AnimatePresence exit animation to finish — the old slide stays
    // in the DOM at opacity 0 during the 0.3s transition and can cause axe
    // flakes under parallel-worker CPU contention.
    await expect(home.headshotsSection.locator("img")).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
