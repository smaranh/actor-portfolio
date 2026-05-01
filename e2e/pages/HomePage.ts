import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class HomePage {
  constructor(private readonly page: Page) {}

  // --- Nav --------------------------------------------------------------
  get nav(): Locator {
    return this.page.getByRole("navigation");
  }
  get siteTitle(): Locator {
    return this.nav.getByRole("link", { name: /smaran harihar/i });
  }
  get aboutLink(): Locator {
    return this.nav.getByRole("link", { name: "About Me" });
  }
  get reelsLink(): Locator {
    return this.nav.getByRole("link", { name: "Reels" });
  }
  get headshotsLink(): Locator {
    return this.nav.getByRole("link", { name: "Headshots" });
  }
  get contactLink(): Locator {
    return this.nav.getByRole("link", { name: "Contact" });
  }
  get hamburger(): Locator {
    return this.page.getByRole("button", { name: /open menu/i });
  }
  get mobileOverlay(): Locator {
    return this.page.getByRole("dialog", { name: /navigation menu/i });
  }
  get closeMenuButton(): Locator {
    return this.page.getByRole("button", { name: /close menu/i });
  }
  /**
   * Locator for a link inside the open mobile overlay. Scoped to the
   * overlay so it doesn't collide with the desktop nav links.
   */
  overlayLink(name: string | RegExp): Locator {
    return this.mobileOverlay.getByRole("link", { name });
  }

  // --- Skip link --------------------------------------------------------
  get skipLink(): Locator {
    return this.page.getByRole("link", { name: /skip to content/i });
  }

  // --- Sections ---------------------------------------------------------
  get heroSection(): Locator {
    return this.page.locator("#hero");
  }
  get mainContent(): Locator {
    return this.page.locator("#main");
  }
  get aboutSection(): Locator {
    return this.page.locator("#about");
  }
  get reelsSection(): Locator {
    return this.page.locator("#reels");
  }
  get headshotsSection(): Locator {
    return this.page.locator("#headshots");
  }
  get contactSection(): Locator {
    return this.page.locator("#contact");
  }

  // --- About ------------------------------------------------------------
  get aboutImage(): Locator {
    return this.aboutSection.getByRole("img", { name: /smaran harihar/i });
  }

  // --- Reels ------------------------------------------------------------
  /** A reel card button identified by its visible title. */
  reelByTitle(title: string | RegExp): Locator {
    return this.reelsSection.getByRole("button", { name: title });
  }
  get reelCards(): Locator {
    return this.reelsSection.getByRole("button");
  }
  /** Reels lightbox dialog — distinct from the mobile-nav dialog by
   * having no aria-label of "Navigation menu" and containing an iframe. */
  get reelDialog(): Locator {
    return this.page.locator('div[role="dialog"]:has(iframe)');
  }

  // --- Headshots --------------------------------------------------------
  get headshotsPrev(): Locator {
    return this.headshotsSection.getByRole("button", {
      name: /previous headshot/i,
    });
  }
  get headshotsNext(): Locator {
    return this.headshotsSection.getByRole("button", {
      name: /next headshot/i,
    });
  }
  get headshotsImage(): Locator {
    return this.headshotsSection.getByRole("img");
  }
  /**
   * The "1 / 4" indicator text. Returned as the matching paragraph
   * locator so callers can assert text and visibility.
   */
  get headshotsIndicator(): Locator {
    return this.headshotsSection.getByText(/^\s*\d+\s*\/\s*\d+\s*$/);
  }

  // --- Contact ----------------------------------------------------------
  get contactEmailLink(): Locator {
    return this.contactSection.getByRole("link", {
      name: /trappedactor@gmail\.com/i,
    });
  }

  // --- Footer -----------------------------------------------------------
  get footer(): Locator {
    return this.page.getByRole("contentinfo");
  }
  get footerEmailLink(): Locator {
    return this.footer.getByRole("link", {
      name: /trappedactor@gmail\.com/i,
    });
  }
  footerSocialLink(name: string | RegExp): Locator {
    return this.footer.getByRole("link", { name });
  }
  get footerSocialLinks(): Locator {
    return this.footer.locator("ul").getByRole("link");
  }

  // --- Navigation -------------------------------------------------------
  async goto() {
    await this.page.goto("/");
  }

  // --- User intents -----------------------------------------------------
  async clickAbout() {
    await this.aboutLink.click();
  }
  async clickHeadshots() {
    await this.headshotsLink.click();
  }
  async openMobileMenu() {
    await this.hamburger.click();
  }
  async closeMobileMenu() {
    await this.closeMenuButton.click();
  }

  // --- Higher-level expectations (used in multiple specs) ---------------
  async expectAboutInView() {
    await expect(this.aboutSection).toBeInViewport();
  }
  async expectHeadshotsInView() {
    await expect(this.headshotsSection).toBeInViewport();
  }
}
