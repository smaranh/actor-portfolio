# Phase 6 — Headshots (`components/Headshots.tsx`)

## Overview

Polish the headshot carousel: add a Framer Motion crossfade between images, tune image priority, fix a11y gaps (decorative arrows, keyboard navigation, live counter), and refine arrow buttons + counter typography. Per **D6**, the carousel is kept as-is structurally — the "glide-feel" redesign (peek of prev/next, swipe momentum) is deferred to **F-2 (Future)** and explicitly out of scope here.

All work scoped to `components/Headshots.tsx` and `tests/Headshots.test.tsx`.

**QA-PLAN IDs addressed:** HS-01, HS-03, HS-04, HS-05, HS-06, HS-08, HS-09, plus G-01 (entrance fade hookup).
**Out of scope (Future F-2):** HS-02 (glide redesign), HS-07 (swipe gestures, peek of prev/next).

## Current state

- `Headshots.tsx` (59 lines, `"use client"`) — `<section id="headshots">` with a 4-image carousel, prev/next buttons flanking a 3:4 aspect-ratio image, and a `1 / 4` counter below.
- Image swap is **instant** — no transition between headshots (HS-01).
- All four headshots use `priority` indirectly: only one renders at a time, but the active `<Image>` has `priority` always — meaning every nav click fires a fresh priority load (HS-03 wants only the first image priority, others lazy).
- Arrow glyphs `&#8592;` and `&#8594;` are bare HTML entities inside `<button>` text — no `aria-hidden` wrapping. Screen readers may read "left arrow" as part of the button's accessible name even though the button already has an `aria-label="Previous headshot"`, doubling the announcement (HS-04).
- No keyboard navigation: arrow keys (← / →) don't advance the carousel (HS-05). Only the button clicks work.
- No live region: when index changes, screen readers don't announce the new state (HS-06).
- Counter is small `text-sm text-gray-400` — QA-PLAN wants a larger Playfair `01 — 04` style (HS-08).
- Arrow buttons are square `w-10 h-10 border border-[#222222]` boxes — QA-PLAN wants round buttons with chevron SVGs and a hover lift (HS-09).
- No entrance fade.

## Slices

### 6.1 — Crossfade between images via `AnimatePresence`

**Type:** AFK
**Blocked by:** None
**QA IDs:** HS-01

#### What to build

Wrap the active `<Image>` in Framer Motion's `<AnimatePresence>` + `motion.div`, keyed on the current `index`, so swapping images crossfades over ~300ms. Honor `prefers-reduced-motion` — instant swap (no animation) when reduced motion is on.

```tsx
"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const reduce = useReducedMotion();

<AnimatePresence mode="wait">
  <motion.div
    key={index}
    initial={{ opacity: reduce ? 1 : 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: reduce ? 1 : 0 }}
    transition={{ duration: reduce ? 0 : 0.3 }}
    className="relative w-full max-w-2xl aspect-[3/4]"
  >
    <Image
      src={`${base}${headshots[index].src}`}
      alt={headshots[index].alt}
      fill
      sizes="(max-width: 1024px) 100vw, 672px"
      className="object-cover"
      priority={index === 0} /* slice 6.2 */
    />
  </motion.div>
</AnimatePresence>;
```

`mode="wait"` ensures the outgoing image fades out before the new one fades in — avoids a stacked-double-image flash.

#### Behaviors to test (TDD)

1. **A motion wrapper is rendered around the image** — query for the marker attribute set by the `framer-motion` mock.
2. **The wrapper is keyed by index** — different indices produce different keyed elements (this is hard to assert directly; instead verify by re-rendering with a changed index and confirming a fresh wrapper is in the tree).
3. **Reduced motion: opacity transitions are zero-duration** — when `useReducedMotion` returns true, the wrapper's `data-transition` includes `duration: 0`.

#### ⚠️ Test mock required

Same Framer Motion mock as Phase 2 / Phase 3, but extended to also mock `AnimatePresence`:

```ts
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: {
    div: ({ children, animate, transition, initial, exit, ...props }: any) => (
      <div
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-initial={JSON.stringify(initial)}
        data-exit={JSON.stringify(exit)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: vi.fn(() => false),
}));
```

If `tests/setup.ts` already provides a shared mock, extend it there instead of duplicating per file.

#### Implementation notes

- Add `"use client"` is already present.
- Wrap only the inner image div, not the outer carousel row (so prev/next buttons don't fade).
- Keep `position: relative` and `aspect-[3/4]` on the motion wrapper so the image's `fill` sizing keeps working.

---

### 6.2 — Priority loading: only first image priority

**Type:** AFK
**Blocked by:** None
**QA IDs:** HS-03

#### What to build

Change `priority` on the carousel `<Image>` from always-true to `priority={index === 0}`. The first headshot is the LCP candidate when the page loads; subsequent images can lazy-load (next.js will preload neighbors automatically when reasonable).

For even better perceived performance, preload the next image in the array when `index` changes so navigating ahead is instant. This is optional — the simple `index === 0` form is enough for HS-03.

#### Behaviors to test (TDD)

1. **First image has `priority`** — render with `index = 0`, assert the rendered `<Image>` has the `priority`/`data-priority` marker.
2. **Subsequent images do NOT have `priority`** — advance to `index = 1`, assert `data-priority` is absent or `false`.

(These tests rely on the existing `next/image` mock surfacing `priority` as a data attribute, same as Phase 3.)

#### Implementation notes

- One-line change in the `<Image>` props.

---

### 6.3 — Wrap arrow glyphs in `aria-hidden` spans

**Type:** AFK
**Blocked by:** None
**QA IDs:** HS-04

#### What to build

Wrap the `&#8592;` / `&#8594;` glyphs in `<span aria-hidden="true">` so screen readers don't read them. The button's existing `aria-label` ("Previous headshot" / "Next headshot") is the only thing that should be announced.

```tsx
<button aria-label="Previous headshot" onClick={prev} className="…">
  <span aria-hidden="true">&#8592;</span>
</button>
```

#### Behaviors to test (TDD)

1. **Arrow glyph is wrapped in `<span aria-hidden="true">`** — query the prev button, assert it contains a span with `aria-hidden="true"`, and that span's text is the arrow character.
2. **Button's accessible name is unchanged** — `screen.getByRole("button", { name: /previous headshot/i })` still resolves.

#### Implementation notes

- Two-line change inside each button.

---

### 6.4 — Keyboard arrow navigation

**Type:** AFK
**Blocked by:** None
**QA IDs:** HS-05

#### What to build

Add a `keydown` listener (scoped to the carousel section, not global) that responds to `ArrowLeft` → `prev()` and `ArrowRight` → `next()`. Listener should only fire when the carousel section (or the image area) has focus, OR globally if focus is not in another interactive element. Default to **global keydown** for simplicity, with a check to avoid hijacking arrow keys inside text inputs (there are none on this page, but it's good defensive practice).

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;
    if (e.key === "ArrowLeft") prev();
    else if (e.key === "ArrowRight") next();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []); // prev/next are stable refs in this implementation
```

Wait — `prev` and `next` are defined inline in the component body and recreated on every render. Either:

- Wrap them in `useCallback`.
- Or move the index update logic into the listener itself: `setIndex(i => (i + 1) % headshots.length)`.

Default to **inline setter form inside the listener** — it sidesteps stale-closure issues without needing `useCallback`.

#### Behaviors to test (TDD)

1. **ArrowRight advances index** — render carousel, dispatch `keydown ArrowRight` on window, assert counter changed from `1 / 4` to `2 / 4`.
2. **ArrowLeft moves backward (with wraparound)** — at index 0, dispatch `ArrowLeft`, assert index wraps to 3 (`4 / 4`).
3. **Wraparound forward** — at index 3, dispatch `ArrowRight`, assert index wraps to 0 (`1 / 4`).
4. **Other keys do nothing** — dispatch `keydown Enter`, assert index unchanged.

#### Implementation notes

- `useEffect` with empty deps is fine if you use the function form of `setIndex`.
- Don't add the listener on every render.
- Cleanup on unmount.

---

### 6.5 — `aria-live="polite"` counter announcement

**Type:** AFK
**Blocked by:** None
**QA IDs:** HS-06

#### What to build

The existing counter `<p>{index + 1} / {headshots.length}</p>` is silent to screen readers. Add `aria-live="polite"` and `aria-atomic="true"` so the new value is announced when the index changes.

For better screen-reader copy, change the text content to "Image 2 of 4" — clearer than the bare numeric form. Visually keep the `01 — 04` style (slice 6.6) using a sibling visually-hidden element OR use `aria-label` on the visible counter:

```tsx
<p
  aria-live="polite"
  aria-atomic="true"
  className="text-center font-playfair text-2xl mt-4"
>
  <span className="sr-only">
    Image {index + 1} of {headshots.length}
  </span>
  <span aria-hidden="true">
    {String(index + 1).padStart(2, "0")} —{" "}
    {String(headshots.length).padStart(2, "0")}
  </span>
</p>
```

This combines slice 6.5 (live region) and the typography part of slice 6.6 (Playfair `01 — 04`).

#### Behaviors to test (TDD)

1. **Counter has `aria-live="polite"`** — query the counter, assert `getAttribute("aria-live") === "polite"`.
2. **Counter has `aria-atomic="true"`.**
3. **Counter announces "Image N of M"** — there's an `sr-only` span with text matching `/Image 1 of 4/`.
4. **Visible counter text is `01 — 04` style** — there's an `aria-hidden` span with text matching `/01 — 04/` (use the em-dash character).

#### Implementation notes

- Use the literal em-dash `—` (U+2014), not `--` or hyphen.
- `String(n).padStart(2, "0")` zero-pads to two digits.

---

### 6.6 — Counter typography polish

**Type:** AFK (pulled forward, P2 — combined with 6.5)
**Blocked by:** 6.5
**QA IDs:** HS-08

#### What to build

The visible counter classes change from `text-sm text-gray-400` to `font-playfair text-2xl text-[#222222]` (or similar — adjust opacity/weight in the browser). The text content change (to `01 — 04` form) is already covered by slice 6.5; this slice is just the styling.

Realistically, slices 6.5 and 6.6 are inseparable — combine them into a single PR. List separately here only because they map to different QA-IDs.

#### Behaviors to test (TDD)

1. **Counter has `font-playfair` class.**
2. **Counter has larger text size class** — `text-xl` or `text-2xl`.
3. **Counter color is the body color** — `text-[#222222]` (or whatever the chosen token is).

#### Implementation notes

- Single class-string change on the counter `<p>`. Already drafted in slice 6.5's example.

---

### 6.7 — Round arrow buttons + chevron SVGs + hover lift

**Type:** AFK (pulled forward, P3)
**Blocked by:** 6.3
**QA IDs:** HS-09

#### What to build

Replace the square bordered buttons with round buttons containing chevron SVGs:

```tsx
<button
  aria-label="Previous headshot"
  onClick={prev}
  className="flex-shrink-0 w-12 h-12 rounded-full border border-[#222222] flex items-center justify-center hover:bg-[#222222] hover:text-white hover:-translate-y-0.5 transition-all"
>
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
</button>
```

Right button mirrors the chevron (`<polyline points="9 18 15 12 9 6" />`).

`hover:-translate-y-0.5 transition-all` gives the "lift" effect on hover.

#### Behaviors to test (TDD)

1. **Prev button contains an SVG with `aria-hidden="true"`** — query inside the prev button.
2. **Both buttons are round** — className contains `rounded-full`.
3. **Hover translation class is present** — className contains `-translate-y-0.5` (or whatever lift token is chosen).
4. **Button's accessible name is preserved** — `aria-label` still resolves.

#### Implementation notes

- The chevron SVGs are decorative; `aria-label` on the button is the source of truth.
- This slice supersedes the `aria-hidden` span from slice 6.3 — once chevrons land, the arrow glyphs are gone entirely. Document in the PR that 6.3 → 6.7 is a two-step transition (6.3 ships first as a small fix, 6.7 replaces the glyph altogether). Or merge 6.3 into 6.7 and skip 6.3 as a standalone slice.

Default: **merge 6.3 into 6.7** — simpler, fewer PRs. Treat 6.3 as documentation-only here and ship its a11y intent inside 6.7.

---

### 6.8 — Entrance fade via `<FadeInOnScroll>`

**Type:** AFK
**Blocked by:** 6.6, 6.7
**QA IDs:** G-01

#### What to build

Wrap the inner `<div className="max-w-6xl mx-auto">` in `<FadeInOnScroll>`. Same pattern as previous phases.

#### Behaviors to test (TDD)

1. **Section content is wrapped in `<FadeInOnScroll>`** — assert the marker attribute is present on an ancestor of the heading.

---

## Suggested slice order for /to-issues

1. **6.2** — `priority` only on first image (no blockers, trivial)
2. **6.4** — Keyboard arrow nav (no blockers)
3. **6.5 + 6.6** — Live counter + typography (combine into one PR)
4. **6.1** — `AnimatePresence` crossfade (no blockers; touches the framer-motion mock)
5. **6.7** — Round chevron buttons (replaces 6.3's a11y fix; ship as one slice)
6. **6.8** — Entrance fade (blocked by 6.6, 6.7)

(Slice 6.3 absorbed into 6.7 per note above — don't open as a separate issue.)

## Files touched

| File                       | Changes                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `components/Headshots.tsx` | All slices modify this file                                     |
| `tests/Headshots.test.tsx` | New tests + minor existing-test updates                         |
| `tests/setup.ts`           | Possibly extended for `AnimatePresence` mock if not yet present |

## Verification gate

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` walkthrough:
   - Tab to the carousel, press → / ← arrows: image advances/retreats with smooth crossfade.
   - Counter text reads `01 — 04` in Playfair; VoiceOver/NVDA announces "Image 2 of 4" on each change.
   - Wraparound works at both ends (4 → 1 and 1 → 4).
   - Toggle Reduce Motion → image swap is instant (no fade).
   - Arrow buttons are round with chevron icons; hover lifts them slightly and inverts colors.
   - First image loads with `priority` (DevTools network tab shows `<link rel="preload">` or eager fetch); subsequent images load on demand.
   - axe-core: zero a11y violations on the carousel.
   - Section fades in on scroll.
3. `git diff` reviewed; conventional-commit subjects per slice.
4. Each slice opens its own PR.
