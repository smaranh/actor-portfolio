# Flake Posture — Auto-Waiting, No Retries, Quarantine Deliberately

## Position

Auto-retry hides bugs. The Issue 2 dig succeeded _because_ we trusted the probe output. If retry had masked the inline-vs-block dead zone (the cursor briefly returns "auto" then "pointer" between frames), the skill would teach itself to ignore the very bug it should catch.

Therefore: **fail loud, no auto-retry, quarantine deliberately.**

## Rules

### 1. No auto-retry by default

```ts
// playwright.config.ts
export default defineConfig({
  retries: 0, // ← always
});
```

A flaky test is a wrong test — it has a race, a missing `await`, or it's testing the wrong thing.

### 2. Use Playwright's auto-waiting religiously

`expect(locator).toBeVisible()` retries internally up to a 5-second timeout. That's the right place for retry — at the assertion level, with a deterministic stop condition.

```ts
// ✅ Auto-waiting, deterministic stop condition
await expect(page.getByRole("dialog")).toBeVisible();

// ❌ Manual sleep
await page.waitForTimeout(2000);
await expect(page.getByRole("dialog")).toBeVisible();

// ❌ Imperative no-retry assertion
expect(await page.getByRole("dialog").isVisible()).toBe(true);
```

The first form waits up to 5s for the dialog and fails immediately if it never appears. The second adds 2s of dead time _and_ still races. The third doesn't wait at all — it asks "is it visible right now?" and returns the answer with no retry.

### 3. Fail loud, then triage

- **First failure:** assume real bug, investigate.
- **Second failure on the same code:** still real, unless a specific race/timing cause is identified.
- Only after diagnosing the actual cause: fix the test or quarantine.

Don't add `retries: 3` to "see if it goes away." A test that needs three runs to pass is broken — either the test or the system under test. Find which.

### 4. Quarantine pattern: separate file, not a flag

When a test must be temporarily removed from the main suite without losing it:

```bash
# Move the file
git mv e2e/specs/contact.spec.ts e2e/quarantine/contact.spec.ts
```

Add a header comment at the top of the quarantined file:

```ts
/**
 * Quarantined 2026-04-30 — fails ~1 in 5 runs locally.
 * Pattern: dialog opens but `toBeVisible()` times out before mount completes.
 * Suspected cause: race with framer-motion mount animation; needs investigation.
 * Unquarantine when: the race is identified and fixed (probably need to wait
 * on a settle signal before asserting visibility, or split the test).
 */
```

The quarantine directory runs in a **separate** script (not part of `test:e2e`):

```json
{
  "scripts": {
    "test:e2e": "playwright test --project=chromium --grep-invert quarantine",
    "test:e2e:quarantine": "playwright test e2e/quarantine"
  }
}
```

Quarantine is a holding pen, not a graveyard. Each entry in `quarantine/` should also have an entry in `e2e/failures.md` under `## Flakes` with the same `Action taken: quarantined ...` note. Periodically scan the directory — if a quarantined test has been there more than 30 days without progress, decide: fix it or delete it.

### 5. Log flakes in `e2e/failures.md`, separate section

`failures.md` has two top-level sections:

- `## Failures` — real bugs caught by e2e tests.
- `## Flakes` — tests that passed and failed on the same code without an identified bug.

Same file, separate scans. See [the failures.md structure](../../e2e/failures.md) (committed at `e2e/failures.md` in the project) for the full format.

A flake entry includes:

- Pattern (how the flake manifests)
- Suspected cause
- Action taken (fixed at line N / quarantined / under investigation)
- Issue candidate flag

## What to NEVER do

- ❌ `retries: 3` (or any number > 0) at the suite level.
- ❌ `await page.waitForTimeout(N)` to "let things settle." If timing matters, use auto-waiting on a deterministic locator.
- ❌ `test.fixme()` without an entry in `failures.md` explaining why.
- ❌ `test.skip()` to hide a flake. Use quarantine instead.
- ❌ Catching and swallowing `expect()` errors to keep a test "passing."

## What to do when stuck

If a test is genuinely flaky and you can't find the cause:

1. **Reproduce locally** with `--repeat-each=20 --workers=1` to get a deterministic flake rate.
2. **Trace the failure** with `--trace=retain-on-failure` and inspect with `npx playwright show-trace trace.zip`.
3. **Check the obvious races**: animation mount, image load, fonts, network. Each gets its own deterministic wait (a visibility assertion on the dependent element).
4. **If the test asserts something that can briefly flicker** (e.g., focus moving through multiple elements during transition), tighten the assertion to a stable post-transition state.
5. **Quarantine + log** if you can't fix it now. Don't paper over with retries.

## Skill rule

> **Never add `retries`. Never add `waitForTimeout`. If a test is flaky, write down _why_ in `e2e/failures.md` under `## Flakes` and either fix the race or quarantine — don't paper over it.**
