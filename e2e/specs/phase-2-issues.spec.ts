/**
 * Phase 2 issue probes — committed as regression tests per /e2e Q13.
 *
 * These tests are expected to FAIL on the current code (the bugs are
 * not yet fixed). When the fixes from Plan/Phase-2-coverage.md ship,
 * these tests should turn green and stay green.
 *
 * - Issue 1 — Nav route jump on `/#section`
 * - Issue 2 — "About Me" hover dead zone (inline link < li hit box)
 * - Issue 3 — Hero face cropping on desktop (visual snapshot)
 */
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Phase 2 — Issue 1: nav anchor scrolling", () => {
  test("clicking About scrolls #about into view without route flash", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.clickAbout();
    await expect(home.aboutSection).toBeInViewport();
    await expect(page).toHaveURL(/#about$/);
  });

  test("clicking Headshots scrolls #headshots into view", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.clickHeadshots();
    await expect(home.headshotsSection).toBeInViewport();
    await expect(page).toHaveURL(/#headshots$/);
  });
});

test.describe("Phase 2 — Issue 2: About Me hover dead zone", () => {
  test("clicking the top edge of the <li> still triggers the About link", async ({
    page,
  }) => {
    // User perception: "I clicked on the link area; the link should
    // activate." The dead zone exists because the inline <a> is shorter
    // than its <li>. A user hovering near the <li>'s top edge sees
    // their pointer over the link copy area, but the click lands on
    // the <li> instead of the <a>. After the fix (block display + py-1)
    // the <a> fills the <li>, and the same click activates the link.
    //
    // We use the <li> as the click target with a position near its top
    // edge. With the bug, this click hits the <li> (cursor: auto, no
    // navigation). With the fix, this click hits the now-block <a>
    // (cursor: pointer, navigation triggers).
    const home = new HomePage(page);
    await home.goto();

    const aboutLi = home.nav.locator("li", { hasText: "About Me" });
    await expect(aboutLi).toBeVisible();

    // Click at y=1 from the <li>'s top — the dead zone above the inline
    // <a>. Playwright's actionability check on the <li> won't retarget
    // to a child <a> the way it does for plain `link.click()`.
    await aboutLi.click({ position: { x: 20, y: 1 }, force: true });

    // After clicking, we should have navigated to #about. With the
    // bug, the click hits the non-interactive <li>; nothing happens.
    await expect(page).toHaveURL(/#about$/);
  });
});

test.describe("Phase 2 — Issue 3: hero face cropping on desktop", () => {
  test.skip("hero composition matches the desktop reference at 1440x900", async ({
    page,
  }) => {
    // Skipped until the Issue 3 fix ships and the post-fix layout
    // is approved. To unskip:
    //   1. Apply the fix from Plan/Phase-2-coverage.md (breakpoint-
    //      specific bg-position in components/Hero.tsx).
    //   2. Visually verify the hero looks correct at 1440x900.
    //   3. Remove `test.skip(`, restore `test(`.
    //   4. Run `npx playwright test --update-snapshots` once to
    //      baseline the approved image.
    //   5. Commit the baseline at e2e/specs/phase-2-issues.spec.ts-
    //      snapshots/hero-desktop-chromium-darwin.png.
    //
    // Without a baseline, this test would fail on first run with
    // "snapshot doesn't exist" — which doesn't capture the actual
    // regression we care about (a face-crop change vs. the approved
    // composition).
    await page.setViewportSize({ width: 1440, height: 900 });
    const home = new HomePage(page);
    await home.goto();
    await expect(home.heroSection).toHaveScreenshot("hero-desktop.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});
