import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class HomePage {
  constructor(private readonly page: Page) {}

  // --- Nav --------------------------------------------------------------
  get nav(): Locator {
    return this.page.getByRole("navigation");
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
    return this.page.getByRole("dialog");
  }
  get closeMenuButton(): Locator {
    return this.page.getByRole("button", { name: /close menu/i });
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
