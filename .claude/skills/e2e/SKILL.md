---
name: e2e
description: End-to-end testing with Playwright in a real browser. Use for real-browser behavior — layout, scroll, animation, hover, focus, computed CSS — that jsdom can't honestly simulate. Two modes: author user-journey tests for a feature, or diagnose a UI bug by probing the live page. Complements /tdd; does not replace it.
---

# /e2e — End-to-End Testing with Playwright

## When to use this skill

The skill operates in two modes:

- **Author mode** — given a feature or page, write Playwright user-journey tests that exercise it through the real browser.
- **Diagnostic mode** — given a UI bug ("hover doesn't work", "the section doesn't scroll into view"), probe the live page until the cause is found, then commit the probe as a regression test.

`/e2e` complements `/tdd`. `/tdd` covers component logic via Vitest with mocks. `/e2e` covers what the user actually perceives in a real browser. **Run both** for any new or existing UI feature — they're not alternatives.

For component logic, mocks, ARIA wiring, and pure behavior, see [`/tdd`](../tdd/SKILL.md).

## Layer-selection rule

> If a test mocks `next/link`, `framer-motion`, `IntersectionObserver`, or `matchMedia` to assert behavior that depends on real layout, scroll, animation, or CSS — the test is in the wrong layer. Move it to Playwright, or split it: keep the Vitest test for the wiring, add a Playwright test for the rendered behavior.

### Diagnostic-mode trigger

> If a bug report mentions cursor, hover, layout, scroll position, "doesn't show," "wrong size," "covered by," or "stops working when scrolled" — go to Playwright first. Don't debug in jsdom.

### Same-behavior overlap

A single behavior is verified at exactly one layer — not both.

- ✅ **Keep both (different behaviors):** Vitest tests `aria-expanded=true` (state); Playwright tests the rotation animation in a real browser (rendered effect).
- ❌ **Delete the Vitest test (same behavior):** Vitest mocks `framer-motion` and asserts `data-animate` equals `{rotate: 45}`. The real-browser test now checks the actual transformed bounding box. The Vitest version is testing the mock, not the behavior.
- ❌ **Delete the Vitest test (Playwright is authoritative):** Vitest tests `href="/#about"`. The Playwright test "click About → #about scrolls into view" already proves the link works end-to-end. Drop the redundant scaffolding.

When the layers test the same observable behavior, the real-browser test wins.

## Workflow

### Author mode — feature-first, test-after

1. **Read the diff.** Run `git diff main...HEAD --name-only`. Identify UI components and pages touched.
2. **Propose journeys.** List candidate user journeys covering the changes — present them to the user for confirmation.
3. **Implement (if not already done).** Build the feature.
4. **Write the test.** Add a spec under `e2e/specs/<name>.spec.ts`. Use the page object pattern (see [pom.md](pom.md)).
5. **Run it.** `npm run test:e2e`. Confirm green. Iterate until it captures the journey.
6. **Refactor with confidence.** The test is the safety net.

### Diagnostic mode — probe to root cause, then lock it in

1. **Reproduce.** Confirm the bug manifests against the live dev server (`npm run dev`).
2. **Pick a v1 primitive.** See [probes.md](probes.md) for the six user-perception primitives. Start with the highest-level one that captures the symptom.
3. **Write a failing assertion.** Express the bug as a Playwright `expect()` that fails on the broken code. The probe IS the regression test from the start.
4. **Fix the bug.** Apply the fix in the component.
5. **Confirm the probe goes green.**
6. **Commit the probe** to `e2e/specs/<name>.spec.ts` (or `e2e/probes/` if it doesn't fit a journey). Every probe earns its keep by living on as a regression test.

## Skill rules

- **Probe in user-perception order.** Start with the highest-level Playwright assertion that captures the symptom. Drop to a visual snapshot only if no semantic assertion fits. Drop to raw DOM/style/rect queries _only_ as a last resort, and document in `failures.md` why no user-perception primitive was sufficient.
- **No retries, no waitForTimeout.** Use Playwright's auto-waiting (`expect(locator).toBeVisible()` retries internally up to a 5s timeout). If a test is flaky, fix the race or quarantine — don't paper over with `retries: 3` or sleeps. See [flake.md](flake.md).
- **Default to POM.** For any test touching more than 2 locators, use the page object model. See [pom.md](pom.md).
- **Never run `/e2e` automatically.** It's invoked manually. `/implement-plan` and `/setup-pre-commit` do NOT run e2e tests — they're slow and would hurt commit velocity.

## Project setup (already configured for this repo)

- `playwright.config.ts` — Chromium only, 1440×900, auto-starts `npm run dev` via `webServer`, `retries: 0`, headless.
- `e2e/` — test directory at repo root.
  - `e2e/pages/` — page objects.
  - `e2e/specs/` — user journey + diagnostic specs.
  - `e2e/quarantine/` — flaky tests under investigation (separate runner).
  - `e2e/failures.md` — failure & flake log.
- `npm run test:e2e` — runs the full Playwright suite. Headless. Run manually before pushing UI changes. Not in CI for v1.

## Companion docs

- [journeys.md](journeys.md) — user-journey patterns + the smoke-test template every page must pass.
- [probes.md](probes.md) — the six v1 user-perception primitives with code recipes; rejected primitives and why.
- [selectors.md](selectors.md) — locator priority order and when to break the rule.
- [pom.md](pom.md) — page object conventions.
- [flake.md](flake.md) — auto-waiting, no-retries posture, quarantine pattern.
- [failures.md](failures.md) — the failure & flake log structure (lives in the project at `e2e/failures.md`).
