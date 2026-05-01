# Failure & Flake Log Format

The skill maintains a single log per project at `e2e/failures.md` with two top-level sections: `## Failures` (real bugs caught by e2e tests) and `## Flakes` (tests that passed and failed on the same code without an identified bug). Same file, separate scans.

Both sections use a shared `Issue candidate: Yes/No` flag so the review pass is uniform: grep `Issue candidate: Yes`, file the matching GitHub issues, mark them filed.

## When to write to it

- **A failure** — write when an e2e test fails in a way that points to a real product bug. Usually accompanied by a suggested fix and a commit/branch reference.
- **A flake** — write when a test passes and fails inconsistently on the same code. Investigate first; if the cause isn't immediately fixable, log + quarantine.

The skill writes entries automatically when invoked in diagnostic mode and a probe finds a failure. The user reviews entries and decides whether each becomes a GitHub issue.

## Full structure

The contents of `e2e/failures.md` should match this template:

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

## Field guidance

- **Date:** the day the entry was written (UTC or local — pick one and stick to it).
- **Test:** the path and the test name from `test("...")`. Specific enough to find it again.
- **Branch / Commit:** lets the reader rebuild the failing state.
- **Symptom (failures only):** what the test asserted vs. what happened. Quote the assertion verbatim if helpful.
- **Probe output (failures only):** raw output from the v1 primitive (see [probes.md](probes.md)). Don't paraphrase numbers — verbatim values support investigation later.
- **Suggested fix (failures only):** one or two sentences. Not the diff itself; just enough that a reviewer knows where to start.
- **Pattern (flakes only):** describe the manifest behavior (frequency, environment, conditions).
- **Suspected cause (flakes only):** your best guess. Wrong-but-recorded is better than blank — it gives the next investigator a hypothesis to confirm or refute.
- **Action taken (flakes only):** what you did about it (fix / quarantine / leave for later).
- **Issue candidate:** Yes if this should become a tracked issue. No if it's already fixed inline or known not to need one.

## Anti-patterns

- ❌ A free-text "test failed" note. Use the structure.
- ❌ Mixing failures and flakes in the same section.
- ❌ Pasting a 500-line trace into "Probe output." Paste the relevant lines verbatim, link to the trace artifact if needed.
- ❌ Marking everything `Issue candidate: Yes`. Only mark Yes if the entry meets your project's bar for filing — otherwise the review pass becomes meaningless.
