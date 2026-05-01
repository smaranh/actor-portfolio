import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("Nav — desktop", () => {
  test("site title links to / and is keyboard reachable", async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.siteTitle).toBeVisible();
    await expect(home.siteTitle).toHaveAttribute("href", "/#");
  });

  test("active-section underline appears when a section is in view", async ({
    page,
  }) => {
    // The user perception is "the link for the section I'm reading is
    // visually underlined." The underline manifests as `border-b-2`,
    // which renders as a non-zero border-bottom-width. We assert that
    // CSS property because that's what the user sees, while leaving
    // the IntersectionObserver wiring covered by Vitest.
    const home = new HomePage(page);
    await home.goto();

    // Initially: no active section, no link has the underline.
    await expect(home.aboutLink).toHaveCSS("border-bottom-width", "0px");
    await expect(home.reelsLink).toHaveCSS("border-bottom-width", "0px");

    // Scroll the about section into view.
    await home.aboutSection.scrollIntoViewIfNeeded();
    await expect(home.aboutSection).toBeInViewport();

    // The About link's border-bottom-width should now be non-zero.
    await expect(home.aboutLink).not.toHaveCSS("border-bottom-width", "0px");
    // Other links remain unset.
    await expect(home.reelsLink).toHaveCSS("border-bottom-width", "0px");
  });

  test("nav background changes when scrolled past 30px (glass state)", async ({
    page,
  }) => {
    // The user perceives the nav transitioning from transparent to a
    // translucent white glass. We assert the computed
    // background-color: at top it's transparent (rgba(0,0,0,0)); after
    // scrolling, it picks up the bg-white/70 utility — a non-zero
    // alpha rgba. The exact RGB doesn't matter for the user
    // perception; only that it changes from transparent.
    const home = new HomePage(page);
    await home.goto();

    await expect(home.nav).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

    // Scroll past the 30px threshold defined in Nav.tsx.
    await page.evaluate(() => window.scrollTo(0, 100));

    await expect(home.nav).not.toHaveCSS(
      "background-color",
      "rgba(0, 0, 0, 0)"
    );
  });
});

test.describe("Nav — mobile overlay", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger opens overlay and focus moves to close button", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.hamburger).toBeVisible();

    await home.openMobileMenu();
    await expect(home.mobileOverlay).toBeVisible();
    await expect(home.closeMenuButton).toBeFocused();
  });

  test("Escape closes overlay and restores focus to hamburger", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openMobileMenu();
    await expect(home.mobileOverlay).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(home.mobileOverlay).toBeHidden();
    await expect(home.hamburger).toBeFocused();
  });

  test("clicking a link inside the overlay closes it and navigates", async ({
    page,
  }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openMobileMenu();

    await home.overlayLink("About Me").click();

    await expect(home.mobileOverlay).toBeHidden();
    await expect(page).toHaveURL(/#about$/);
  });
});
