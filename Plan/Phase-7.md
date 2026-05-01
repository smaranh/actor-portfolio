# Phase 7 — Stats (`components/Stats.tsx`)

## Overview

Small but visible polish pass on the casting-stats row: add an `id` for nav anchoring, add an eyebrow label, upgrade typography, simplify the divider treatment, and hook in the entrance fade. Per **D8**, no new fields — the four PRD-mandated stats (Height, Weight, Hair, Eye) stay as-is.

All work scoped to `components/Stats.tsx` and `tests/Stats.test.tsx`.

**QA-PLAN IDs addressed:** S-01, S-02, S-03, S-05, plus G-01 (entrance fade hookup).
**Out of scope (per D8):** S-04 (expanding to more stat fields).

## Current state

- `Stats.tsx` (26 lines, server component) — `<section>` with `border-t border-b border-gray-100` and a 2-col / 4-col grid of label+value pairs.
- **No `id` on the section** — nothing in the nav points here, but anchors like `/#stats` won't scroll (S-01). Phase 2 slice 2.6 (active-section underline) is already designed to work without `#stats` (notes "no `#stats` yet"), but adding it now lets the underline fire here too.
- No eyebrow heading above the row (S-02). The four cards stand alone with no labeling.
- Stat values are `font-playfair text-2xl font-semibold` — adequate but small for a "display" feel; QA-PLAN suggests larger Playfair (S-03).
- No dividers between cards — just grid gap. QA-PLAN suggests hairline vertical dividers between fields (S-03).
- Both top + bottom borders on the section (`border-t border-b border-gray-100`). QA-PLAN wants single hairline rule on top, no bottom rule, so the section reads as a transition rather than a contained box (S-05).
- No entrance fade.

## Slices

### 7.1 — Add `id="stats"` to the section

**Type:** AFK
**Blocked by:** None
**QA IDs:** S-01

#### What to build

One-line change: `<section id="stats" className="…">`. Enables `/#stats` anchoring and lets the Phase 2 IntersectionObserver pick up this section (though no nav link points here yet — that's a separate decision for future).

#### Behaviors to test (TDD)

1. **Section has `id="stats"`** — `document.querySelector("#stats")` resolves.

#### Implementation notes

- Trivial. Pair with slice 7.2 in a single PR if preferred.

---

### 7.2 — Eyebrow heading above the row

**Type:** AFK
**Blocked by:** None
**QA IDs:** S-02

#### What to build

Add an eyebrow heading "Casting" (or "Stats" — pick one and stay consistent with the rest of the site's eyebrow voice; "Casting" is more on-brand for an actor's portfolio).

```tsx
<div className="max-w-6xl mx-auto">
  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-8 text-center">
    Casting
  </p>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
    {stats.map(…)}
  </div>
</div>
```

This wraps the existing grid in an outer div so the eyebrow centers above the row.

#### Behaviors to test (TDD)

1. **Eyebrow text "Casting" is rendered above the stats grid.**
2. **Eyebrow has uppercase + tracking class.**
3. **Existing stats still render** — all four labels and values still resolve.

#### ⚠️ Existing tests to update first

`tests/Stats.test.tsx` likely queries by exact label/value text. The eyebrow adds a new node but doesn't change any existing text. **No existing assertion breaks.**

#### Implementation notes

- If using `<h2>` instead of `<p>` for the eyebrow, make it `<h2 className="sr-only">Casting</h2>` followed by a visible `<p>` — gives screen readers a heading without making the visual heavy. Default: just a `<p>` for simplicity.

---

### 7.3 — Typography polish + hairline dividers

**Type:** AFK (pulled forward, P2)
**Blocked by:** 7.2
**QA IDs:** S-03

#### What to build

Two changes:

- **Larger Playfair display values:** `text-2xl` → `text-3xl md:text-4xl` (or `text-4xl md:text-5xl` if it doesn't break the 2-col mobile layout). Keep `font-semibold`.
- **Hairline vertical dividers between cards** (visible on `md:` and up only — vertical dividers on a 2-col mobile layout get awkward). Use `divide-x divide-gray-100` on the grid container, or per-card `md:border-l border-gray-100` with the first card overriding. The `divide-x` utility on a grid only divides between _direct grid items_, which works here:

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-gray-100 gap-y-8 md:gap-x-0 text-center">
  {stats.map(({ label, value }) => (
    <div key={label} className="md:px-4">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </p>
      <p className="font-playfair text-3xl md:text-4xl font-semibold text-[#222222]">
        {value}
      </p>
    </div>
  ))}
</div>
```

`md:divide-x md:divide-gray-100` adds 1px borders between cards on desktop only; `md:gap-x-0` removes the grid column gap so the dividers sit flush; `md:px-4` pads each card's content away from the dividers.

#### Behaviors to test (TDD)

1. **Stat values use larger Playfair size** — query a value `<p>`, assert className matches `/text-3xl|text-4xl/`.
2. **Grid has `divide-x` class** — the grid container className matches `/divide-x/`.

#### Implementation notes

- Verify in the browser that the dividers don't extend below the content (Tailwind's `divide-` only draws between siblings, so this is fine).
- On mobile (`grid-cols-2`), dividers should NOT show — `md:divide-x` only enables on `md:` breakpoint.

---

### 7.4 — Single top hairline, no bottom border

**Type:** AFK (pulled forward, P3)
**Blocked by:** None
**QA IDs:** S-05

#### What to build

Remove `border-b` from the section. Keep `border-t`. The bottom border was creating a "boxed" feel; removing it lets the section flow into the next.

```tsx
<section id="stats" className="py-16 px-8 md:px-16 border-t border-gray-100">
```

#### Behaviors to test (TDD)

1. **Section has `border-t` but NOT `border-b`** — query the section, assert className matches `/border-t\b/` and does NOT match `/border-b\b/`.

#### Implementation notes

- One-character class string change.

---

### 7.5 — Entrance fade via `<FadeInOnScroll>`

**Type:** AFK
**Blocked by:** 7.2, 7.3
**QA IDs:** G-01

#### What to build

Wrap the inner `<div className="max-w-6xl mx-auto">` in `<FadeInOnScroll>`. Same pattern as previous phases.

#### Behaviors to test (TDD)

1. **Stats grid is wrapped in `<FadeInOnScroll>`** — assert the marker attribute is present on an ancestor.

---

## Suggested slice order for /to-issues

1. **7.1 + 7.2** — `id="stats"` + eyebrow (combine into one PR; both trivial, no blockers)
2. **7.4** — Remove bottom border (no blockers, trivial)
3. **7.3** — Typography + dividers (blocked by 7.2 — need the wrapper div from 7.2)
4. **7.5** — Entrance fade (blocked by 7.2, 7.3)

## Files touched

| File                   | Changes                                            |
| ---------------------- | -------------------------------------------------- |
| `components/Stats.tsx` | All slices modify this file                        |
| `tests/Stats.test.tsx` | New tests for eyebrow + id; minor existing updates |

## Verification gate

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` walkthrough:
   - Navigate to `/#stats` → page scrolls to the stats row, anchored under the nav.
   - "Casting" eyebrow visible above the row, uppercase + tracking matches other eyebrows.
   - Stat values feel larger / more display-y in Playfair.
   - On desktop (md+), hairline dividers separate the four cards. On mobile, no dividers (just grid gap).
   - Section has only a top hairline rule, no bottom rule.
   - Section fades in on scroll.
3. `git diff` reviewed; conventional-commit subject e.g. `feat(stats): add eyebrow + display typography + dividers`.
4. Each slice opens its own PR (or merge 7.1+7.2 if preferred).
