# Probe Primitives — v1

## Grounding principle

Testing Library's guiding principle: **"The more your tests resemble the way your software is used, the more confidence they can give you."**

A user doesn't query the DOM tree. They see, hear, and interact with rendered output. Probes must mirror that perception. Playwright's best practices reinforce this: prefer user-facing locators, web-first auto-retrying assertions, and avoid implementation-detail queries (CSS class checks, XPath, raw DOM tree traversal).

These two perspectives converge on the v1 rule: **every probe is a user-perceivable check, expressed through Playwright's user-facing locator and assertion APIs.**

## The six v1 primitives

### 1. Visibility — "I can see it / I can't see it"

```ts
await expect(page.getByRole("dialog")).toBeVisible();
await expect(page.getByText("Loading…")).toBeHidden();
```

When to reach for it: first probe for "doesn't appear" bugs — skip link, mobile overlay, hero text, conditionally rendered content.

### 2. In-viewport — "I scrolled to the right place"

```ts
await page.getByRole("link", { name: "About Me" }).click();
await expect(page.locator("#about")).toBeInViewport();
```

When to reach for it: scroll behavior, anchor-link bugs (Issue 1 — `/#` route jump), reveal-on-scroll components.

### 3. Interactivity — "I can click / hover / tab to it"

```ts
// Hit-target: hover lands on the link, not surrounding chrome
await aboutLink.hover({ position: { x: 10, y: 2 } });
await expect(aboutLink).toBeFocused(); // or aria/visual assertion

// Focus order
await page.keyboard.press("Tab");
await expect(skipLink).toBeFocused();

// Disabled vs enabled
await expect(submitButton).toBeEnabled();
```

When to reach for it: hit-target bugs (Issue 2 — "About Me" hover dead zone), focus order, keyboard navigation, disabled/enabled state.

> **Note on hover-position probing:** Issue 2's dead zone showed up because the inline `<a>` was shorter than its `<li>`. To reproduce that with v1 primitives, hover at a position near the top edge of the link's bounding box (`{ x: small, y: 2 }`) and assert the link is still focused/active. If a future bug genuinely can't be expressed this way, that's the trigger to reconsider — not speculation now.

### 4. Visible text & accessible name — "I see the right words / a screen reader announces it correctly"

```ts
await expect(heading).toHaveText("Smaran Harihar");
await expect(submitButton).toHaveAccessibleName("Submit form");
await expect(heroImage).toHaveAccessibleDescription(/headshot of Smaran/);
```

When to reach for it: copy regressions, ARIA labelling, alt text, dynamic text content.

### 5. Visual snapshot of a region — "It looks right"

```ts
await expect(page.locator("#hero")).toHaveScreenshot("hero-desktop.png");
```

When to reach for it: layout/rendering bugs that are visual but hard to assert numerically — Issue 3 (hero face cropping), responsive layout changes, theme regressions.

**Caveats:** screenshots are sensitive to font rendering, animation frames, and timing. Lock the viewport size, disable animations where possible, and check in baseline images deliberately. Don't use screenshots when a semantic assertion would do — they're a last-resort visual probe, not a default.

### 6. Console & page errors — "Nothing broke under the hood that the user would notice"

```ts
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => pageErrors.push(err.message));

await page.goto("/");
await expect(page.getByRole("navigation")).toBeVisible(); // wait for settle

expect(consoleErrors).toEqual([]);
expect(pageErrors).toEqual([]);
```

When to reach for it: hydration warnings, runtime errors, deprecation warnings. Caught on every spec for free if you wire the listeners up in a fixture.

## What we deliberately DO NOT include in v1

These primitives existed in earlier drafts but violate the "test the way users use the software" principle. They're DOM-tree queries dressed up as probes. Avoid unless a v1 primitive can't express the check.

- ❌ **`elementFromPoint` grid scan** — pixel-level DOM-tree query. Users don't probe pixels; they hover and observe. Replace with `locator.hover()` then a visibility/interactivity assertion.
- ❌ **Raw `getComputedStyle` extraction** — a user doesn't read the CSS cascade. They see the result. If a computed style matters (`cursor: pointer`), prefer a visibility/interactivity assertion plus a visual snapshot of the hover state.
- ❌ **Raw `getBoundingClientRect` math** — a user doesn't measure pixels. They see whether a thing is in view (`toBeInViewport`) or aligned (visual snapshot).
- ❌ **Network-failure capture** — defer to v2. This is a static portfolio; missing assets surface as `pageerror`.
- ❌ **Accessibility-tree dump (axe-playwright)** — defer to v2 unless an a11y initiative starts; existing Vitest tests cover ARIA basics.

## Skill rule

> **Probe in user-perception order.** Start with the highest-level assertion that captures the symptom — visibility, in-viewport, interactivity, accessible name. Drop to a visual snapshot only if no semantic assertion fits. Drop to a raw DOM/style/rect query _only_ as a last resort, and document in `e2e/failures.md` why no user-perception primitive was sufficient.

## Phase 2 issues re-cast as v1 probes

Each historical UI bug expressed through a v1 primitive — proof the list is sufficient:

| Issue                                | v1 probe                                                                                                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue 1 — `/#` route jump            | `expect(page).toHaveURL(/#about$/)` + `expect(page.locator("#about")).toBeInViewport()` after click                                                                              |
| Issue 2 — "About Me" hover dead zone | `await aboutLink.hover({ position: { x: 10, y: 2 } })` then `expect(aboutLink).toBeFocused()` (or hover-state visual snapshot) — captures the dead zone without elementFromPoint |
| Issue 3 — Hero face cropping         | `expect(page.locator("#hero")).toHaveScreenshot("hero-desktop.png")` at 1440×900; visual diff catches the crop                                                                   |

If a future bug genuinely cannot be expressed this way, that's the trigger to consider a new primitive — not speculative additions now.
