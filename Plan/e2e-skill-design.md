# /e2e Skill — Design Discussion

This document captures the full grill-me discussion for designing a new
standalone `/e2e` skill that uses Playwright for end-to-end testing. It's
organized for leisurely review — read top-to-bottom or jump to a section.

> **Status:** discussion / design notes. No code changes made yet. The plan to
> implement the skill follows from these decisions.

---

## Context

During Phase 2 verification, we discovered that the existing Vitest +
Testing Library setup (jsdom) silently passed three real bugs:

1. **Nav route-jump on `/#section`** — Vitest verified the `href` attribute
   was correct; the actual click behavior was not tested.
2. **"About Me" hover dead zone** — caused by `display: inline` on the
   `<Link>` making its hit box smaller than the surrounding `<li>`. jsdom has
   no real layout, so no Vitest test could have caught it.
3. **Hero face cropping on desktop** — depends on viewport aspect ratio and
   `background-size: cover`, neither of which jsdom simulates.

The Issue 2 investigation used a one-off Playwright probe to find the cause
in minutes. Encoding that capability — both diagnostic probes and
user-journey tests — into a reusable skill is the goal.

---

## Branch 1 — Scope & purpose

### Q1 — Primary job

**Decision: (c) both — test-author AND diagnostic.**

The skill has two modes:

- **Author mode** — given a feature/page, write Playwright user-journey tests
  for it.
- **Diagnostic mode** — given a bug ("hover doesn't work"), probe the live
  page to find the cause.

Both live in one skill; the skill picks the mode based on intent (or the
user picks at invocation time).

### Q2 — Relationship to /tdd

**Decision: complement, not replace.**

`/tdd` and `/e2e` run together for any new or existing UI feature. `/tdd`
covers component logic via Vitest; `/e2e` covers real-browser behavior via
Playwright. The two skills cross-reference each other (see Q16).

---

## Branch 2 — Test layer boundaries

### Q3 — Where's the line between Vitest and Playwright?

**Decision: (b) Real-browser-when-it-matters.**

Vitest stays the default for component behavior with mocks. Playwright is
required when behavior depends on real layout, CSS, scroll, animation, or
the actual rendering pipeline.

#### Stays in Vitest (jsdom)

| Example from project                                              | Why jsdom is fine                      |
| ----------------------------------------------------------------- | -------------------------------------- |
| `Nav.test.tsx` — "renders About Me link with href=/#about"        | DOM presence + attribute               |
| `Nav.test.tsx` — "hamburger has aria-expanded=true when open"     | ARIA state, no layout dep              |
| `Nav.test.tsx` — "Escape key closes overlay"                      | Event handler logic                    |
| `Nav.test.tsx` — "focus moves to close button when overlay opens" | jsdom handles `document.activeElement` |
| `Hero.test.tsx` — "renders headline text"                         | Text content                           |
| `Headshots.test.tsx` — "renders 6 headshot images"                | List rendering                         |
| `Stats.test.tsx` — counter logic, formatting                      | Pure computation                       |

#### Escalates to Playwright

| Real bug or risk                        | Why jsdom can't catch it                                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Issue 2 — "About Me" hover dead zone    | jsdom has no computed cursor at point; `display: inline` vs `block` consequence is invisible |
| Issue 1 — `/#` route jump               | jsdom has no router, no scroll engine; `href` test passes while click breaks                 |
| Issue 3 — Hero face cropping on desktop | jsdom has no viewport, no `background-size: cover`                                           |
| Active-section underline timing         | `Nav.test.tsx` mocks `IntersectionObserver`; mock verifies wiring, not real scroll           |
| Mobile overlay z-index regression       | jsdom doesn't compute stacking contexts                                                      |
| Skip link visibility on focus           | `sr-only focus:not-sr-only` — jsdom can't verify focused state                               |
| Smooth scroll behavior                  | `scroll-behavior: smooth` ignored by jsdom                                                   |
| `scroll-margin-top: 4rem`               | jsdom doesn't apply CSS scroll margin                                                        |
| Framer Motion animations                | Mocked away in tests; could break in real browsers                                           |
| `prefers-reduced-motion` CSS rule       | `useReducedMotion` mocked; CSS `@media` rule untested                                        |
| Console errors / hydration warnings     | jsdom doesn't do React hydration                                                             |

#### The rule the skill enforces

> If a test mocks `next/link`, `framer-motion`, `IntersectionObserver`, or
> `matchMedia` to assert behavior that depends on real layout, scroll,
> animation, or CSS — the test is in the wrong layer. Move it to Playwright,
> or split it: keep the Vitest test for the wiring, add a Playwright test
> for the rendered behavior.

#### Diagnostic-mode trigger rule

> If a bug report mentions cursor, hover, layout, scroll position, "doesn't
> show," "wrong size," "covered by," or "stops working when scrolled" — go
> to Playwright first. Don't debug in jsdom.

### Q4 — Delete vs. keep existing Vitest tests?

**Decision: delete and update as needed when adding Playwright coverage.**

When `/e2e` adds a Playwright test that genuinely supersedes a Vitest test,
the Vitest test is removed. "No parallel coverage of the same behavior
across layers" means: a single behavior should be verified at exactly one
layer — not both. Concrete examples:

- ✅ **Keep both (different behaviors):** Vitest tests "hamburger sets
  `aria-expanded=true` on click" (state); Playwright tests "hamburger
  rotation animates correctly in a real browser" (rendered animation).
  Different behaviors, different layers — both stay.
- ❌ **Delete the Vitest test (same behavior, jsdom is lying):**
  `Nav.test.tsx` mocks `framer-motion` and asserts the `data-animate`
  attribute equals `{rotate: 45}`. The intended behavior — "the bar
  rotates when the menu opens" — is now better covered by a Playwright
  test that checks the actual transformed bounding box. The Vitest
  version is testing the mock, not the behavior. Delete it.
- ❌ **Delete the Vitest test (Playwright is now authoritative):**
  Vitest tests "clicking About link sets href to /#about" — but the
  Playwright test "clicking About scrolls #about into view" already
  proves the link works correctly end-to-end. The href assertion is
  redundant scaffolding. Delete it.

The rule: when both layers test the same observable behavior, the
real-browser test wins and the jsdom version goes. When the layers test
different behaviors (state vs. rendering, wiring vs. effect), both stay.

---

## Branch 3 — Test structure

### Q5 — Test organization style

**Decision: (a) Page Object Model.**

#### What POM looks like for this project

```
e2e/
  pages/
    HomePage.ts         <-- one class per page/route
  specs/
    nav.spec.ts
    hero.spec.ts
    contact.spec.ts
```

```ts
// e2e/pages/HomePage.ts
export class HomePage {
  constructor(private page: Page) {}

  get nav() {
    return this.page.getByRole("navigation");
  }
  get aboutLink() {
    return this.nav.getByRole("link", { name: "About Me" });
  }
  get reelsLink() {
    return this.nav.getByRole("link", { name: "Reels" });
  }
  get hamburger() {
    return this.page.getByLabel("Open menu");
  }
  get mobileOverlay() {
    return this.page.getByRole("dialog");
  }

  async goto() {
    await this.page.goto("/");
  }
  async clickAbout() {
    await this.aboutLink.click();
  }
  async openMobileMenu() {
    await this.hamburger.click();
  }
  async expectAboutInView() {
    await expect(this.page.locator("#about")).toBeInViewport();
  }
}
```

```ts
// e2e/specs/nav.spec.ts
test("clicking About scrolls to section without route change", async ({
  page,
}) => {
  const home = new HomePage(page);
  await home.goto();
  await home.clickAbout();
  await home.expectAboutInView();
  expect(page.url()).toBe("http://localhost:3000/#about");
});
```

#### Why POM is "heavier"

1. **Two files per feature** instead of one.
2. **Indirection cost** — read spec, then jump to page object to know what
   `clickAbout()` does.
3. **Premature-abstraction risk** with few tests.
4. **Refactor coupling** between page object semantics and spec assertions.
5. **Locator hiding** in failure messages.

#### Why POM is worth it for this project

1. **One source of truth for selectors** — copy change updates one file.
2. **Forces semantic naming** — `home.openMobileMenu()` reads as user
   intent.
3. **Scales** — keeps duplication out as the site grows.
4. **Teachable extension pattern** — "add a method to HomePage."
5. **Diagnostic mode benefits** — probes reuse the same locators, so probes
   and tests can't drift.

#### Skill rules

- Default to POM for any test touching more than 2 locators.
- Allow flat specs for trivial single-locator smoke tests.
- Create `pages/HomePage.ts` from day one — don't "extract later."

### Q6 — Required journeys per feature

**Decision: bespoke per feature + a smoke-test template every page must pass.**

The smoke template (run on every page in the smoke suite):

- Page returns 200, no console errors, no `pageerror`
- Tab order reaches all interactive elements without dead-ends
- Skip link is visible on focus and lands on `#main`
- All `<a href="#section">` links scroll the matching section into view
- No hydration warnings from React/Next

Per-feature journeys are defined at planning time inside the spec file.

---

## Branch 4 — Project setup

### Q7 — `playwright.config.ts` defaults

**Decisions:**

- **Browsers:** Chromium only (saves ~150MB install per browser, ~20s per
  run; covers the common case for a portfolio site).
- **Viewports:** Desktop only at 1440×900. Mobile breakpoint testing
  deferred until needed.
- **webServer:** auto-starts `npm run dev` per run (Playwright `webServer`
  config with `reuseExistingServer: true` so local dev isn't disrupted).
- **Headless:** yes by default. `--headed` opt-in for debugging.

### Q8 — Test directory

**Decision: `e2e/` at repo root.**

Standard Playwright convention, clean separation from `tests/` (Vitest), no
glob conflicts (`*.test.tsx` vs `*.spec.ts`).

### Q9 — npm scripts

**Decision: single `npm run test:e2e` script.**

`npm run test` stays Vitest-only. `test:e2e` runs the full Playwright
suite. Additional scripts (`:headed`, `:ui`, `:debug`) can be added later
if needed but aren't part of v1.

### Q10 — CI integration

**Decision: local-dev only.**

No CI integration in v1. The skill explicitly documents this so users know
the suite must be run locally before pushing UI changes.

---

## Branch 5 — Workflow shape

### Q11 — Cycle rhythm

**Decision: (b) feature-first, test-after.**

Build the feature, then write the e2e to lock in the behavior. Strict
red-green-refactor is painful for slow e2e tests; pragmatic for UI.

The skill workflow:

1. Confirm the feature/journey scope with user
2. Implement the feature (or have it already implemented)
3. Write the e2e test that captures the expected user journey
4. Run it, confirm green
5. Refactor with the test as a safety net

### Q12 — Skill entry point

**Decision: reads current diff/branch and proposes journeys.**

When invoked, the skill:

1. Runs `git diff main...HEAD --name-only` to see what changed
2. Identifies UI components and pages touched
3. Proposes a list of e2e journeys covering the changes
4. Asks the user to confirm/adjust the list
5. Writes the tests in `e2e/specs/`

---

## Branch 6 — Diagnostic mode

### Q13 — Probe permanence

**Decision: regression test.**

Diagnostic probes are committed to `e2e/probes/` (or `e2e/specs/<name>.probe.spec.ts`)
and run as part of the e2e suite. Once a probe finds a bug, the probe
becomes the regression test that prevents the bug from coming back. The
throwaway pattern is rejected — every probe earns its keep by living on as
a test.

### Q14 — Probe primitives in v1

#### Grounding principle

Testing Library's guiding principle: **"The more your tests resemble the
way your software is used, the more confidence they can give you."** A
user doesn't query the DOM tree — they see, hear, and interact with
rendered output. Probes must mirror that perception.

Playwright's best practices reinforce the same direction: prefer
user-facing locators (`getByRole`, `getByLabel`, `getByText`), web-first
auto-retrying assertions (`expect(locator).toBeVisible()`), and avoid
implementation-detail queries (CSS class checks, XPath, raw DOM tree
traversal).

These two perspectives converge on the rule for v1: **every probe is a
user-perceivable check, expressed through Playwright's user-facing
locator and assertion APIs**.

#### v1 primitives (mapped to user perceptions)

| Primitive                          | What the user perceives                                          | Playwright API                                                                               | When to reach for it                                                                                |
| ---------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Visibility**                     | "I can see it / I can't see it"                                  | `expect(locator).toBeVisible()` / `.toBeHidden()`                                            | First probe for "doesn't appear" bugs (Skip Link, mobile overlay, hero text)                        |
| **In-viewport**                    | "I scrolled to the right place"                                  | `expect(locator).toBeInViewport()`                                                           | Scroll behavior, anchor links (Issue 1), reveal-on-scroll components                                |
| **Interactivity**                  | "I can click / hover / tab to it"                                | `expect(locator).toBeEnabled()`, `toBeFocused()`, hover via `locator.hover()` then re-assert | Hit-target bugs (Issue 2), focus order, keyboard navigation                                         |
| **Visible text & accessible name** | "I see the right words / a screen reader announces it correctly" | `expect(locator).toHaveText()`, `toHaveAccessibleName()`, `toHaveAccessibleDescription()`    | Copy regressions, ARIA labelling, alt text                                                          |
| **Visual snapshot of a region**    | "It looks right"                                                 | `expect(locator).toHaveScreenshot()`                                                         | Layout/rendering bugs that are visual but hard to assert numerically (Issue 3 — hero face cropping) |
| **Console & page errors**          | "Nothing broke under the hood that the user would notice"        | `page.on('console', ...)` + `page.on('pageerror', ...)` collected per spec                   | Hydration warnings, runtime errors, deprecation warnings — caught on every spec for free            |

#### What we deliberately do NOT include in v1

The following primitives existed in earlier drafts but violate the "test
the way users use the software" principle. They're DOM-tree queries
dressed up as probes. Avoid unless a v1 primitive can't express the
check.

- ❌ `elementFromPoint` grid scan — pixel-level DOM-tree query. Users
  don't probe pixels; they hover and observe. Replace with
  `locator.hover()` then `expect(other).not.toBeFocused()` or a
  visibility/interactivity check.
- ❌ Raw `getComputedStyle` extraction — a user doesn't read the CSS
  cascade. They see the result. If a computed style matters
  (`cursor: pointer`), prefer `expect(locator).toBeVisible()` plus a
  visual snapshot of the hover state.
- ❌ Raw `getBoundingClientRect` math — a user doesn't measure pixels.
  They see whether a thing is in view (`toBeInViewport`) or aligned
  (visual snapshot).
- ❌ Network-failure capture — defer to v2 (this is a static portfolio;
  missing assets surface as `pageerror`).
- ❌ Accessibility-tree dump (axe-playwright) — defer to v2 unless an
  a11y initiative starts; existing Vitest tests cover ARIA basics.

#### Skill rule

> **Probe in user-perception order.** Start with the highest-level
> assertion that captures the symptom — visibility, in-viewport,
> interactivity, accessible name. Drop to a visual snapshot only if no
> semantic assertion fits. Drop to a raw DOM/style/rect query _only_ as
> a last resort, and document in `failures.md` why no user-perception
> primitive was sufficient.

#### Re-examining the Phase 2 issues with v1 primitives

To prove the v1 list is sufficient, re-cast each Phase 2 bug as a v1
probe:

| Issue                                | v1 probe                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue 1 — `/#` route jump            | `expect(page).toHaveURL(/#about$/)` + `expect(page.locator("#about")).toBeInViewport()` after click                                                                                   |
| Issue 2 — "About Me" hover dead zone | `await aboutLink.hover({ position: { x: 10, y: 2 } })` then `expect(aboutLink).toBeFocused()` (or hover-state visual snapshot) — captures the same dead zone without elementFromPoint |
| Issue 3 — Hero face cropping         | `expect(page.locator("#hero")).toHaveScreenshot("hero-desktop.png")` at 1440×900; visual diff catches the crop                                                                        |

Each Phase 2 bug is reachable through a user-perception primitive. If a
future bug genuinely cannot be expressed this way, _that_ is the trigger
to consider a new primitive — not speculative additions now.

---

## Branch 7 — Companion docs

### Q15 — Companion files

**Decision: generate companion files separately from `SKILL.md`.**

Mirroring the `/tdd` pattern (`tests.md`, `mocking.md`, `deep-modules.md`,
etc.), `/e2e` ships with:

- **`SKILL.md`** — the main entry point: workflow, layer rules,
  cross-reference to `/tdd`
- **`journeys.md`** — user-journey patterns and the smoke-test template
- **`probes.md`** — the four diagnostic primitives with code recipes
- **`selectors.md`** — locator priority order: `getByRole` >
  `getByLabel` > `getByText` > `getByTestId` > CSS. When to break the
  rule.
- **`flake.md`** — auto-waiting, why we don't use `retries`, quarantine
  pattern (see Q20)
- **`pom.md`** — when to add a page object, when to keep flat, naming
  conventions

### Q16 — /e2e ↔ /tdd cross-reference

**Decision: cross-reference, don't duplicate.**

`SKILL.md` for `/e2e` opens with the layer-selection rule and says:
"For component logic, mocks, and pure behavior, see `/tdd`." `/tdd`
gets a small addition pointing the other way: "For real-browser
behavior, see `/e2e`." Neither skill duplicates the other's
philosophy.

---

## Branch 8 — Integration with existing skills

### Q17 — `/implement-plan` integration

**Decision: no — `/e2e` runs only when invoked manually.**

`/implement-plan` continues to invoke `/tdd`, `/setup-pre-commit`, and
`/typo-check`. The user runs `/e2e` separately when they want
real-browser coverage. Keeps automated workflows fast; e2e is opt-in.

### Q18 — Pre-commit integration

**Decision: no.**

`/setup-pre-commit` doesn't run e2e tests. They're too slow and would
hurt commit velocity. Run them manually before pushing UI changes.

---

## Branch 9 — Failure mode & flake posture

### Q19 — Failure reporting

**Decision: suggest a fix AND track failures in a markdown log for issue creation.**

When an e2e test fails, the skill produces:

1. **The Playwright report** (HTML, trace.zip) — generated by Playwright,
   left in `playwright-report/` (gitignored).
2. **A written-up analysis** — appended to `e2e/failures.md` in this
   format:

   ```markdown
   ## YYYY-MM-DD — <spec name>: <one-line summary>

   **Test:** `e2e/specs/nav.spec.ts > clicking About scrolls to section`
   **Branch:** `<git branch>`
   **Commit:** `<short SHA>`

   **Symptom:**
   <what failed, e.g. "expected #about in viewport, got off-screen by 240px">

   **Probe output:**
   <verbatim numbers from the relevant primitive — bounding rect, computed
   style, elementFromPoint result>

   **Suggested fix:**
   <one or two sentences pointing to the file/line and the change>

   **Issue candidate:** Yes / No
   ```

3. **Fix suggestion** — based on the probe output, the skill points to a
   file and a likely change. The user evaluates and decides whether to
   apply.

The `failures.md` log is reviewed periodically; entries marked
`Issue candidate: Yes` get filed as GitHub issues. Failures and flakes
share the same file but live in **separate top-level sections** (see
structure below) so a reviewer can scan all real failures without flake
noise, and vice versa.

#### `failures.md` structure

```markdown
# E2E Failure & Flake Log

## Failures

<!-- Real bugs caught by e2e tests. Reviewed for issue creation. -->

### YYYY-MM-DD — <spec name>: <one-line summary>

**Test:** `e2e/specs/nav.spec.ts > clicking About scrolls to section`
**Branch:** `<git branch>`
**Commit:** `<short SHA>`

**Symptom:**
<what failed, e.g. "expected #about in viewport, got off-screen by 240px">

**Probe output:**
<verbatim output from the v1 primitive that caught it — visibility,
in-viewport result, accessible name, screenshot diff, etc.>

**Suggested fix:**
<one or two sentences pointing to the file/line and the change>

**Issue candidate:** Yes / No

---

## Flakes

<!-- Tests that passed and failed on the same code without an
identified bug. Investigated for races, missing awaits, or wrong test
layer. -->

### YYYY-MM-DD — <spec name>: <one-line summary>

**Test:** `e2e/specs/nav.spec.ts > clicking About scrolls to section`
**Branch:** `<git branch>`
**Commit:** `<short SHA>`

**Pattern:**
<how the flake manifests: passes locally, fails in CI; passes 4/5 runs;
fails only with cold cache; etc.>

**Suspected cause:**
<missing await, race with animation, wrong locator, network timing,
etc.>

**Action taken:**
<fixed at line N / quarantined to e2e/quarantine/<name>.spec.ts / under
investigation>

**Issue candidate:** Yes / No
```

Both sections use the same `Issue candidate: Yes/No` flag so the review
pass is uniform: grep `Issue candidate: Yes`, file the matching GitHub
issues, mark them filed.

### Q20 — Flake posture

#### Recommendation: fail loud, no auto-retry, quarantine deliberately.

Auto-retry hides bugs. The Issue 2 dig succeeded _because_ we trusted the
probe output. If retry had masked the inline-vs-block dead zone (the
cursor briefly returns "auto" then "pointer" between frames), the skill
would teach itself to ignore the very bug it should catch.

**Specifically:**

1. **No auto-retry by default.** `retries: 0` in `playwright.config.ts`.
   A flaky test is a wrong test — it has a race, a missing `await`, or
   it's testing the wrong thing.
2. **Use Playwright's auto-waiting religiously.**
   `expect(locator).toBeVisible()` retries internally up to a timeout
   (5s default). That's the right place for retry — at the assertion
   level, with a deterministic stop condition. Don't add `setTimeout`,
   `waitForTimeout`, or `retries: 3`.
3. **Fail loud, then triage.**
   - First failure: assume real bug, investigate.
   - Second failure on the same code: still real, unless a specific
     race/timing cause is identified.
   - Only after diagnosing the actual cause: fix the test or quarantine.
4. **Quarantine pattern: separate file, not a flag.**
   - Move the test to `e2e/quarantine/<name>.spec.ts`.
   - Add a header comment: date, failure mode, what would unquarantine
     it.
   - Quarantine dir runs in a separate `npm run test:e2e:quarantine`
     script (not part of `test:e2e`).
5. **Log flakes in the same `failures.md`, separate section.**
   `failures.md` has two top-level sections — `## Failures` (real bugs)
   and `## Flakes` (tests that passed and failed on the same code
   without an identified bug). Same file, separate scans. See Q19 for
   the full structure.

**Skill rule:** Never add `retries`. Never add `waitForTimeout`. If a
test is flaky, write down _why_ in `failures.md` and either fix the
race or quarantine — don't paper over it.

---

## Decision Summary

| #   | Question                              | Decision                                                                                                                       |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Skill primary job                     | (c) test-author + diagnostic                                                                                                   |
| 2   | Relationship to /tdd                  | Complement; both run for UI work                                                                                               |
| 3   | Vitest vs Playwright line             | Real-browser-when-it-matters                                                                                                   |
| 4   | Delete vs keep duplicate Vitest tests | Delete & update                                                                                                                |
| 5   | Test structure                        | (a) Page Object Model                                                                                                          |
| 6   | Required journeys                     | Bespoke + smoke-test template                                                                                                  |
| 7   | Playwright config                     | Chromium only, 1440×900, auto webServer, headless                                                                              |
| 8   | Test directory                        | `e2e/` at repo root                                                                                                            |
| 9   | npm scripts                           | `npm run test:e2e` only                                                                                                        |
| 10  | CI                                    | Local-dev only                                                                                                                 |
| 11  | Cycle rhythm                          | (b) feature-first, test-after                                                                                                  |
| 12  | Skill entry point                     | Read diff/branch, propose journeys                                                                                             |
| 13  | Probe permanence                      | Regression test (committed)                                                                                                    |
| 14  | Probe primitives v1                   | User-perception primitives: visibility, in-viewport, interactivity, accessible name/text, visual snapshot, console/page errors |
| 15  | Companion files                       | Yes, separate from SKILL.md                                                                                                    |
| 16  | /tdd cross-reference                  | Yes, no duplication                                                                                                            |
| 17  | /implement-plan integration           | No — manual only                                                                                                               |
| 18  | Pre-commit integration                | No                                                                                                                             |
| 19  | Failure reporting                     | Suggest fix + log in `e2e/failures.md` under `## Failures` section                                                             |
| 20  | Flake posture                         | Fail loud, no retry, quarantine deliberately; log under `## Flakes` section in same file                                       |

---

## Implementation Outline (preview only — for the next plan)

When you're ready to build this, the implementation will include:

**Skill files** (`.claude/skills/e2e/`):

- `SKILL.md` — entry point, workflow, layer rules
- `journeys.md` — user-journey patterns + smoke-test template
- `probes.md` — diagnostic primitives + recipes
- `selectors.md` — locator priority order
- `flake.md` — auto-waiting + quarantine pattern
- `pom.md` — page object conventions

**Project scaffolding** (created when skill first runs in a project):

- `playwright.config.ts` — Chromium only, 1440×900, webServer auto-start, `retries: 0`
- `e2e/pages/HomePage.ts` — page object scaffold
- `e2e/specs/smoke.spec.ts` — smoke test template
- `e2e/failures.md` — failure log (initially empty)
- `package.json` — `test:e2e` script
- `.gitignore` — `playwright-report/`, `test-results/`

**Existing skill update:**

- `.claude/skills/tdd/SKILL.md` — add cross-reference to `/e2e`

**Verification:**

- Run `/e2e` on the existing Phase 2 issues and confirm it produces the
  same diagnostic output the manual probe did.
- Run `npm run test:e2e` and confirm the smoke suite passes against the
  current site.

---

_End of design discussion. Reply with go-ahead and I'll write the
implementation plan._
