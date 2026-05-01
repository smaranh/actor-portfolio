# User Journeys + Smoke Test Template

A user journey is a sequence of perceptions and actions a real user has on the site. Each spec in `e2e/specs/` should map to one journey or one diagnostic probe.

## Smoke-test template (every page must pass)

Every page in the site has a smoke spec asserting these baseline expectations. The template is the lowest bar; per-feature specs go beyond it.

```ts
// e2e/specs/smoke.spec.ts (sketch — adapt per page)
import { test, expect } from "@playwright/test";

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

    // Allow the page to settle so any deferred errors surface.
    await expect(page.getByRole("navigation")).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("skip link is reachable and lands on #main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab"); // first focusable
    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("each in-page anchor scrolls its section into view", async ({
    page,
  }) => {
    await page.goto("/");
    const anchors = ["about", "reels", "headshots", "contact"];
    for (const id of anchors) {
      await page
        .getByRole("link", { name: new RegExp(id, "i") })
        .first()
        .click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });
});
```

The template enforces:

- Page returns 200, no console errors, no `pageerror`.
- Skip link is focusable, visible on focus, lands on `#main`.
- Every in-page anchor scrolls its section into the viewport.
- (Implicit) No hydration warnings — they show up as console errors.

## Per-feature journeys

Per-feature journeys are bespoke. Decide them at planning time; one journey per spec, each spec captures a single user intent.

### Pattern: navigation journey

The user wants to reach a section.

```ts
test("user clicks About → About section scrolls into view, no route flash", async ({
  page,
}) => {
  const home = new HomePage(page);
  await home.goto();
  await home.clickAbout();
  await expect(home.aboutSection).toBeInViewport();
  await expect(page).toHaveURL(/#about$/);
});
```

### Pattern: interactive element journey

The user wants to invoke a control.

```ts
test("user opens mobile menu → overlay is visible and focus traps", async ({
  page,
}) => {
  const home = new HomePage(page);
  await home.goto();
  await home.openMobileMenu();
  await expect(home.mobileOverlay).toBeVisible();
  await expect(home.closeMenuButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(home.mobileOverlay).not.toBeVisible();
  await expect(home.hamburger).toBeFocused();
});
```

### Pattern: visual journey

The user perceives layout and rendering.

```ts
test("hero image keeps the face on screen at desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#hero")).toHaveScreenshot("hero-desktop.png");
});
```

### Pattern: error-state journey

The user encounters an error path.

```ts
test("404 page renders with a way back home", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
});
```

## Journey checklist (use when planning)

```
[ ] Maps to a single user intent, expressible in one sentence.
[ ] Uses user-facing locators (getByRole, getByLabel, getByText) — see selectors.md.
[ ] Uses web-first assertions (expect(locator).toBeVisible() etc) — see probes.md.
[ ] No mocked dependencies (Playwright runs the real app).
[ ] No `waitForTimeout`, no `retries`. If timing is needed, use auto-waiting assertions.
[ ] Lives in e2e/specs/<descriptive-name>.spec.ts.
[ ] If the spec uses more than 2 locators, page object usage is mandatory — see pom.md.
```
