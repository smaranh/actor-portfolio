# Selectors — Locator Priority Order

A user finds elements by looking, listening, and interacting. Tests should mirror that path. The priority order below is the same one Testing Library and Playwright both recommend, for the same reason: the higher in the list, the more closely the test resembles a real user.

## The priority order

```
1. getByRole          — semantic role + accessible name
2. getByLabel         — form input by label text
3. getByPlaceholder   — input by placeholder text (worse than label, fine if label absent)
4. getByText          — visible text content
5. getByAltText       — image alt text
6. getByTitle         — element title attribute
7. getByTestId        — last resort: explicit data-testid
8. CSS / XPath        — never; if you reach for these, something is wrong
```

## Examples

```ts
// 1. Role-based — best
page.getByRole("button", { name: "Submit" });
page.getByRole("link", { name: "About Me" });
page.getByRole("navigation");
page.getByRole("dialog");
page.getByRole("heading", { level: 1 });

// 2. Label
page.getByLabel("Email address");

// 3. Placeholder (only if no label)
page.getByPlaceholder("you@example.com");

// 4. Visible text
page.getByText("Smaran Harihar");
page.getByText(/^Smaran/);

// 5. Alt text
page.getByAltText("Headshot of Smaran Harihar");

// 6. Title
page.getByTitle("Close");

// 7. Test id — explicit escape hatch
page.getByTestId("hero-cta");

// 8. CSS — avoid
page.locator(".hero-cta"); // ❌ couples to implementation
```

## When to break the rule

You may drop down a level when:

- **Multiple elements share the same role + name** and need disambiguation (e.g., two "Submit" buttons in different sections) — chain a higher-up locator with a lower-level one.
- **The element has no semantic role** (e.g., a styled `<div>`) — first see if you can fix the markup. If not, use `getByTestId`.
- **Text is dynamic** and a stable role isn't available — use `getByTestId`.

What you should NOT do:

- ❌ Use CSS classes — they couple your test to styling.
- ❌ Use XPath — fragile, hard to read, and rarely necessary.
- ❌ Use `nth-child` or positional CSS — DOM order changes break tests silently.

## Chaining and filtering

When the same locator appears in multiple regions, chain to disambiguate:

```ts
// Two "About Me" links: one in <nav>, one in mobile <dialog>
const navAbout = page
  .getByRole("navigation")
  .getByRole("link", { name: "About Me" });
const dialogAbout = page
  .getByRole("dialog")
  .getByRole("link", { name: "About Me" });
```

Filter when role + name isn't enough:

```ts
const submitInForm = page
  .getByRole("form", { name: "Contact" })
  .getByRole("button", { name: "Submit" });

const headshotsCount = await page
  .locator("section#headshots")
  .getByRole("img")
  .count();
```

## Locator generation

Playwright's codegen suggests locators in the right priority order:

```bash
npx playwright codegen http://localhost:3000
```

Use codegen when you're unsure what locator to write. Don't use codegen as a substitute for thinking — review what it generates and confirm it's at the highest priority level that fits the user's perception.

## Skill rule

> **Default to `getByRole`. Drop down the list one step at a time, and only when the previous level genuinely can't disambiguate. If you reach `locator()` with a CSS selector, stop and ask whether the markup needs a semantic upgrade instead.**
