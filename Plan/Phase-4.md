# Phase 4 — About (`components/About.tsx`)

## Overview

Polish the About section: add a screen-reader-only `<h2>`, refine the portrait image styling, constrain text width, refine the decorative "S" placement, verify italic rendering, and tighten alt text. Hook in the Phase 1 entrance fade.

All work scoped to `components/About.tsx` and `tests/About.test.tsx`.

**QA-PLAN IDs addressed:** A-01, A-02, A-03, A-04, A-06, A-07, plus G-01 (entrance fade hookup).

## Current state

- `About.tsx` (37 lines) — `<section id="about">` with a 2-column grid: portrait on the left (next/image with `aspect-[3/4]`), text + signature on the right.
- **No `<h2>`** anywhere — section relies on `id="about"` for the nav anchor but has no heading for SEO/screen readers (A-01).
- Portrait `<Image>` has only `object-cover`, no border, no shadow, no rounded corners (A-02).
- Text container is `flex flex-col gap-6` with no `max-w-` constraint — paragraphs stretch the full grid column on wide screens (A-04).
- Decorative "S" is a Playfair `text-7xl` block sitting under "Much love," — placement is OK but feels disconnected from the signature line; QA-PLAN suggests inline-with-signature OR enlarged-watermark (A-03).
- "Much love," uses `<em>` — needs visual confirmation that Inter italic renders correctly across browsers (A-06).
- Alt text is `"Smaran Harihar"` — generic; QA-PLAN wants more descriptive (e.g., scene/setting context) (A-07).
- Apostrophe in `life&apos;s motto` is a straight apostrophe — could swap to curly Unicode for consistency with Phase 3 (out of scope here unless we choose to include it; flag in PR).
- No entrance fade.

## Slices

### 4.1 — Visually-hidden `<h2>About</h2>` for nav/SEO

**Type:** AFK
**Blocked by:** None
**QA IDs:** A-01

#### What to build

Add an `<h2>About</h2>` that is visually hidden but available to screen readers and SEO crawlers. Use the standard `sr-only` Tailwind utility (already provided by Tailwind preflight). Place it as the first child of the section so document order matches reading order.

#### Behaviors to test (TDD)

1. **An `<h2>` with text "About" is present in the section.**
2. **The `<h2>` has the `sr-only` class** so it is visually hidden but still in the DOM.

#### Implementation notes

- Insert `<h2 className="sr-only">About</h2>` as the first child of `<section id="about">`, before the grid div.

---

### 4.2 — Image polish: drop shadow + warm border

**Type:** AFK
**Blocked by:** None
**QA IDs:** A-02

#### What to build

Add subtle visual treatment to the portrait image: a soft drop shadow and a 1px warm-toned border. Keep the existing `aspect-[3/4]` and `object-cover`. Goal is to lift the image off the white background without becoming heavy.

Suggested classes on the wrapper div (the one with `relative w-full aspect-[3/4]`):

- `shadow-[0_8px_30px_rgba(0,0,0,0.08)]` (soft, low-opacity shadow)
- `ring-1 ring-[#e8e0d4]` (1px warm-cream border via Tailwind ring utility — doesn't shift layout)

Or, if a literal CSS border is preferred, use `border border-[#e8e0d4]` on the wrapper.

#### Behaviors to test (TDD)

1. **Image wrapper has a shadow utility class** — wrapper className matches `/shadow-/`.
2. **Image wrapper has a 1px border (ring or border)** — className matches `/ring-1|border\b/`.
3. **Border color is in the warm palette** — className matches `/ring-\[#e8e0d4\]|border-\[#e8e0d4\]/` (or whichever warm token is chosen).
4. **`aspect-[3/4]` is preserved** — wrapper still has `aspect-[3/4]`.

#### Implementation notes

- Apply classes to the wrapper `<div>`, NOT to the `<Image>` itself (Next's `<Image>` with `fill` doesn't reliably accept arbitrary border styling).
- Confirm in the browser that the warm tone reads as warm, not gray, against the white background. Adjust the hex if needed.

---

### 4.3 — Constrain body text to `max-w-prose`

**Type:** AFK
**Blocked by:** None
**QA IDs:** A-04

#### What to build

Wrap the two `<p>` paragraphs (or apply directly to the text column) with `max-w-prose` so line length stays in the comfortable 60–75ch reading range on wide screens. Don't apply it to the signature block (the "Much love," + "S") — those are display elements, not body text.

#### Behaviors to test (TDD)

1. **Body paragraphs are constrained by `max-w-prose`** — at least one ancestor of the paragraphs has className matching `/max-w-prose/`.
2. **Signature block is NOT constrained** — the `<div className="mt-4">` containing "Much love," and "S" does not have `max-w-prose` (it inherits from the text column, but should sit outside the `prose` wrapper if both are placed). The simplest implementation: apply `max-w-prose` to the paragraph wrapper only.

#### Implementation notes

- Either:
  - Add a wrapper around the two body paragraphs: `<div className="max-w-prose flex flex-col gap-6">…</div>`, leaving the signature `<div className="mt-4">` as a sibling.
  - Or apply `max-w-prose` directly to the existing `flex flex-col gap-6 text-[#222222]` container — but this also constrains the signature, which is acceptable visually (signature is short anyway).
- Pick whichever the user prefers; default to wrapper-around-paragraphs to keep the signature un-constrained.

---

### 4.4 — Refine decorative "S" placement

**Type:** AFK (with explicit user choice in PR description)
**Blocked by:** None
**QA IDs:** A-03

#### What to build

Pick one of two treatments — the current "block of Playfair S under 'Much love,'" reads as orphaned. Two options:

**Option A — Inline with signature line:**
"Much love," and "S" sit on a single line, with the "S" smaller (e.g., `text-3xl` Playfair italic) acting like a handwritten signature flourish.

```tsx
<p className="text-lg flex items-baseline gap-2">
  <em>Much love,</em>
  <span className="font-playfair text-3xl font-semibold italic">S</span>
</p>
```

**Option B — Enlarged watermark behind text:**
"S" becomes a very large (e.g., `text-[12rem]`), low-opacity Playfair watermark positioned absolutely behind the text column, with `aria-hidden="true"`. The signature line ("Much love,") stays as plain text.

```tsx
<div className="relative">
  <span
    aria-hidden="true"
    className="absolute -right-4 -bottom-8 font-playfair text-[12rem] leading-none text-[#222222]/5 pointer-events-none select-none"
  >
    S
  </span>
  <p className="relative text-lg">
    <em>Much love,</em>
  </p>
</div>
```

Default to **Option A** (less risk of layout interference, easier to test). Flag Option B in the PR description as an alternative.

#### Behaviors to test (TDD) — Option A

1. **"Much love," and "S" share a parent element** — query for the element containing both texts.
2. **"S" has Playfair italic class** — the `<span>` containing "S" has className matching `/font-playfair/` and `/italic/`.
3. **"S" is no longer a `text-7xl` block-level element** — assert the previous `text-7xl` and `mt-1` are removed.

#### Implementation notes

- Replace the existing `<div className="mt-4">…</div>` with the inline form.
- Keep `text-[#222222]` color so it doesn't shift hue.
- If the user later asks for Option B, the watermark variant is a tiny refactor.

---

### 4.5 — Verify Inter italic renders for "Much love,"

**Type:** AFK
**Blocked by:** 4.4
**QA IDs:** A-06

#### What to build

This is a verification + safety-net slice: confirm the Inter font as configured in `app/layout.tsx` includes italic glyphs (Phase 1 slice 1.3 subsetted Inter to weights 300/400/500 — italic is a separate axis and may not be in the subset). If italic isn't shipped, swap `<em>` for an explicit Playfair italic span (which is guaranteed since Playfair is loaded with italic for the Phase 3 hero greeting).

#### Behaviors to test (TDD)

1. **"Much love," is wrapped in an italic-capable element** — either an `<em>` (default user-agent italic) OR a span with `italic` class.
2. **Computed style of "Much love," resolves to a font that supports italic** — this is hard to assert in JSDOM (no real font rendering). Skip the runtime assertion; rely on manual verification in the gate.

The TDD value here is small. Keep it as a single sanity test that "Much love," is in the document with italic intent.

#### Implementation notes

- Open `app/layout.tsx` and check the Inter font config:
  - If it loads `style: ["normal", "italic"]` (or omits `style` entirely, which defaults to `normal` only), confirm italic is included.
  - If italic is **not** in the subset, either:
    - Add `style: ["normal", "italic"]` to the Inter config (small bundle increase), OR
    - Switch the "Much love," element to `<em className="font-playfair">` so it uses Playfair italic instead.
- Decision recorded in PR description.

---

### 4.6 — Descriptive alt text for portrait

**Type:** AFK
**Blocked by:** None
**QA IDs:** A-07

#### What to build

Replace the generic `alt="Smaran Harihar"` with descriptive text that conveys the _content_ of the photo for screen-reader users — not just the subject's name. Per QA-PLAN, a good alt for a portrait describes setting, expression, or mood.

Suggested copy (placeholder — confirm with user): `"Smaran Harihar — portrait, looking off camera, soft natural light"`. The user is the source of truth on the actual visual content; flag in PR for them to override.

#### Behaviors to test (TDD)

1. **Portrait `<Image>` alt is non-empty and contains "Smaran Harihar"** — the test should NOT pin the exact string (since the user may revise it). Assert `alt.length > 20` and `alt.includes("Smaran")`.

#### Implementation notes

- Update the `alt` prop on the about-section `<Image>`.
- Don't lock the test to an exact string — use a length + substring check so the user can rewrite the alt without breaking tests.

---

### 4.7 — Entrance fade via `<FadeInOnScroll>`

**Type:** AFK
**Blocked by:** 4.1, 4.4
**QA IDs:** G-01

#### What to build

Wrap the inner grid (or each column) in `<FadeInOnScroll>` so the about section fades in as the user scrolls to it. Don't wrap the section itself — the section background should stay continuous with the rest of the page; only the contents animate.

#### Behaviors to test (TDD)

1. **Grid contents are wrapped in `<FadeInOnScroll>`** — assert the marker attribute/class set by the Phase 1 mock is present on an ancestor of the heading + image.

#### Implementation notes

- Import `FadeInOnScroll` from `components/FadeInOnScroll`.
- Wrap the `<div className="max-w-6xl mx-auto grid …">` in `<FadeInOnScroll>`.
- Reuse the Phase 1 mock convention from existing tests.

---

## Suggested slice order for /to-issues

1. **4.1** — sr-only h2 (no blockers, trivial)
2. **4.3** — max-w-prose (no blockers, trivial)
3. **4.6** — alt text (no blockers, trivial)
4. **4.2** — image shadow + border (no blockers)
5. **4.4** — decorative S placement (no blockers)
6. **4.5** — Inter italic verification (blocked by 4.4)
7. **4.7** — entrance fade (blocked by 4.1, 4.4)

## Files touched

| File                   | Changes                                       |
| ---------------------- | --------------------------------------------- |
| `components/About.tsx` | All slices modify this file                   |
| `tests/About.test.tsx` | New tests + minor existing-test updates       |
| `app/layout.tsx`       | Possibly extended in 4.5 (Inter italic style) |

## Verification gate

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` manual walkthrough:
   - Inspect DOM: `<h2>About</h2>` is present and `sr-only`. VoiceOver/NVDA reads "About, heading level 2" when entering the section.
   - Portrait image has subtle shadow + warm hairline border, no harsh edge.
   - On a 1920px viewport, body paragraphs wrap at ~70ch, not at the column edge.
   - "Much love," renders as italic in both Chrome and Safari. The "S" is inline beside it (or watermarked behind, per chosen option).
   - Hover the portrait → screen reader announces the descriptive alt.
   - Scroll the About section into view → contents fade in once.
3. `git diff` reviewed; conventional-commit subjects per slice (e.g., `feat(about): add visually-hidden h2`, `feat(about): polish portrait with shadow + warm border`).
4. Each slice opens its own PR.
