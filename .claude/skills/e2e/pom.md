# Page Object Model — Conventions

## When to use POM

POM is the default for any spec touching more than 2 locators. Trivial single-locator smoke tests can stay flat.

The reason: a page object is one place to update when copy, structure, or routing changes. Without it, locators duplicate across specs and start to drift — and when they drift, real regressions get masked because the spec's mental model no longer matches the page.

## Project layout

```
e2e/
  pages/
    HomePage.ts          ← one class per page/route
    NotFoundPage.ts
  specs/
    smoke.spec.ts
    nav.spec.ts
    hero.spec.ts
    contact.spec.ts
  quarantine/            ← see flake.md
  failures.md
```

A page object lives in `e2e/pages/` and is named after the route it represents. Don't make page objects per component — components don't have URLs. Components belong inside the page object that hosts them, exposed as locators.

## Anatomy of a page object

```ts
import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class HomePage {
  constructor(private readonly page: Page) {}

  // Locators as readonly getters — composable, lazy, always fresh.
  get nav(): Locator {
    return this.page.getByRole("navigation");
  }
  get aboutLink(): Locator {
    return this.nav.getByRole("link", { name: "About Me" });
  }
  get reelsLink(): Locator {
    return this.nav.getByRole("link", { name: "Reels" });
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

  // Sections — for in-viewport assertions.
  get aboutSection(): Locator {
    return this.page.locator("#about");
  }
  get reelsSection(): Locator {
    return this.page.locator("#reels");
  }

  // Navigation
  async goto() {
    await this.page.goto("/");
  }

  // User intents (verbs that read like a user's narration)
  async clickAbout() {
    await this.aboutLink.click();
  }
  async openMobileMenu() {
    await this.hamburger.click();
  }
  async closeMobileMenu() {
    await this.closeMenuButton.click();
  }

  // Higher-level expectations — only when reused in multiple specs.
  async expectAboutInView() {
    await expect(this.aboutSection).toBeInViewport();
  }
}
```

## Conventions

- **Locators are getters, not properties.** Lazy evaluation means each access returns a fresh `Locator` — no stale references after navigation or rerender.
- **Use user-facing locators.** Apply [selectors.md](selectors.md) priority order inside the page object.
- **Methods named for user intent.** `clickAbout()`, `openMobileMenu()` — not `onAboutLinkClick()`, `triggerHamburger()`.
- **Don't put assertions inside method bodies by default.** Methods do; specs assert. Exception: a high-level `expectAboutInView()` is fine when the same assertion appears in many specs and the page object is the natural owner.
- **Page objects don't share state.** Construct a new one per test (see fixture pattern below). No singletons, no module-level cache.
- **No private locator caching.** Don't write `private _aboutLink = this.nav.getByRole(...)` — caching defeats the lazy-getter benefit.

## Using the page object in a spec

```ts
// e2e/specs/nav.spec.ts
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test("clicking About scrolls to section without route change", async ({
  page,
}) => {
  const home = new HomePage(page);
  await home.goto();
  await home.clickAbout();
  await home.expectAboutInView();
  await expect(page).toHaveURL(/#about$/);
});
```

## Optional: fixture pattern

When most specs in a file use the same page object, factor it into a Playwright fixture so each test gets a fresh instance:

```ts
// e2e/specs/nav.spec.ts
import { test as base, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

const test = base.extend<{ home: HomePage }>({
  home: async ({ page }, use) => {
    const home = new HomePage(page);
    await home.goto();
    await use(home);
  },
});

test("hamburger opens overlay", async ({ home }) => {
  await home.openMobileMenu();
  await expect(home.mobileOverlay).toBeVisible();
});
```

Use the fixture when 3+ tests in a file would call `await home.goto()` on entry. For single-test files, keep it inline.

## Anti-patterns

- ❌ A page object that returns `Promise<boolean>` checks — that's hiding assertions inside methods. Specs should assert.
- ❌ A page object that calls `expect()` everywhere — same problem; specs lose visibility into what's being asserted.
- ❌ A "BasePage" with shared utilities — over-abstraction. Each page object stands on its own.
- ❌ A page object with hundreds of methods — split it. If `HomePage` has methods for the nav, hero, and contact form, the form deserves its own object: `HomePage.contactForm` returns a `ContactForm` page object scoped to that section.

## Skill rule

> **One page object per route. Locators as getters. Methods named for user intent. Specs do the asserting. Split when the file grows past ~150 lines.**
