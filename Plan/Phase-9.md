# Phase 9 — Footer (`components/Footer.tsx`)

## Overview

Polish the footer: replace text social labels with icons (keeping accessible labels), confirm the Twitter/X URL, add a copyright line, add a "Back to top" link, and add a small ↗ glyph to external links.

All work scoped to `components/Footer.tsx` and `tests/ContactFooter.test.tsx` (shared with Contact).

**QA-PLAN IDs addressed:** F-01, F-02, F-03, F-04, F-06.

## Current state

- `Footer.tsx` (40 lines, server component) — `<footer>` with mailto on the left, 5 social links on the right (IMDB, YouTube, Facebook, Instagram, Twitter).
- Social links are uppercase text labels (`text-xs uppercase tracking-widest`). No icons (F-01).
- Twitter link points to `twitter.com/TrappedActor` — service has rebranded to X. URL `twitter.com` still redirects but is stale (F-02).
- No copyright notice (F-03).
- No "Back to top" affordance (F-04).
- External links open in new tabs with `rel="noopener noreferrer"` (good — keep) but have no visual indicator that they're external (F-06).

## Slices

### 9.1 — Replace text social labels with SVG icons

**Type:** AFK
**Blocked by:** None
**QA IDs:** F-01

#### What to build

Replace each text label with an icon, using `lucide-react` (or inline simple-icons SVGs for brand icons that lucide doesn't have, e.g., IMDB).

`lucide-react` covers: `Youtube`, `Facebook`, `Instagram`, and Twitter (`Twitter` icon — note this is the bird logo; for the X branding use a custom SVG or accept the bird).

IMDB is not in lucide. Use an inline SVG (the trademarked yellow IMDB pill, or a generic monochrome "IMDB" mark) — keep it monochrome `currentColor` so it inherits the footer's text color.

```tsx
import { Youtube, Facebook, Instagram, Twitter } from "lucide-react";

const socials = [
  { label: "IMDB", href: "https://imdb.me/trappedactor", Icon: ImdbIcon },
  { label: "YouTube", href: "…", Icon: Youtube },
  { label: "Facebook", href: "…", Icon: Facebook },
  { label: "Instagram", href: "…", Icon: Instagram },
  { label: "Twitter", href: "…", Icon: Twitter },
];

<ul className="flex flex-wrap items-center justify-center gap-5">
  {socials.map(({ label, href, Icon }) => (
    <li key={label}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="text-[#222222] hover:opacity-60 transition-opacity inline-flex"
      >
        <Icon size={20} aria-hidden="true" />
      </a>
    </li>
  ))}
</ul>;
```

The text label becomes the `aria-label` on the anchor; the icon is `aria-hidden`.

#### Behaviors to test (TDD)

1. **Each social link renders an SVG (not text)** — query each link, assert it contains an `<svg>` element.
2. **Each link has an aria-label matching the platform** — `screen.getByRole("link", { name: /imdb/i })`, etc.
3. **Hrefs are unchanged** — same set of URLs as before (Twitter URL update is slice 9.2).
4. **Icons are `aria-hidden`** — query the SVG, assert `aria-hidden="true"`.

#### ⚠️ Existing test to update first

`tests/ContactFooter.test.tsx` likely uses `screen.getByText("IMDB")` or `screen.getByRole("link", { name: "IMDB" })`. The text-based query stops working since the visible label is now an icon. The role+name query still works because `aria-label` provides the accessible name. **Update text-based queries to `getByRole("link", { name: /imdb/i })`.**

#### Implementation notes

- Add `lucide-react` as a dep: `npm install lucide-react`.
- For the IMDB icon, define a small inline SVG component at the top of the file:
  ```tsx
  const ImdbIcon = ({
    size = 20,
    ...props
  }: {
    size?: number;
    [k: string]: unknown;
  }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* simplified IMDB mark */}
      <text x="2" y="17" fontSize="10" fontWeight="700" fontFamily="Arial">
        IMDb
      </text>
    </svg>
  );
  ```
  Or paste the simple-icons IMDB SVG path. Keep it monochrome.

---

### 9.2 — Update Twitter URL to `x.com` (or remove)

**Type:** HITL
**Blocked by:** None
**QA IDs:** F-02

#### What to build

The QA-PLAN flags this as "confirm direction." Two options:

- **Option A:** Change the URL from `twitter.com/TrappedActor` to `x.com/TrappedActor`. Keep the icon (the bird is still recognizable, or swap to a custom X SVG).
- **Option B:** Remove the Twitter/X entry entirely if the user doesn't actively post there.

This decision belongs to the user. Default to **Option A** (URL update only) unless the user says to remove. Open the issue with a HITL flag asking which option.

#### Behaviors to test (TDD) — Option A

1. **Twitter link href contains `x.com`** — `screen.getByRole("link", { name: /twitter|x\.com/i }).getAttribute("href")` matches `/x\.com/`.

#### Behaviors to test (TDD) — Option B

1. **No Twitter/X link in the footer** — `screen.queryByRole("link", { name: /twitter|x/i })` is null.
2. **Other socials still render** — IMDB / YouTube / Facebook / Instagram all present.

#### Implementation notes

- Update the `socials` array entry.
- If Option B: remove the entry. Simple change.

---

### 9.3 — Add `© 2026 Smaran Harihar` line

**Type:** AFK
**Blocked by:** None
**QA IDs:** F-03

#### What to build

Add a copyright line below the existing flex row. Two-line footer: top row keeps mailto + socials; bottom row centers the copyright in small gray text.

```tsx
<footer className="py-12 px-8 md:px-16 border-t border-gray-100 bg-white">
  <div className="max-w-6xl mx-auto flex flex-col gap-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* mailto + socials */}
    </div>
    <p className="text-xs text-gray-400 text-center">
      © {new Date().getFullYear()} Smaran Harihar
    </p>
  </div>
</footer>
```

Use `new Date().getFullYear()` so the year auto-updates. (Don't hardcode `2026` — it'll silently rot.)

#### Behaviors to test (TDD)

1. **Copyright text is rendered** — `screen.getByText(/© \d{4} Smaran Harihar/)`.
2. **Year is dynamic** — assert the text matches the current year. (Vitest's date is the test runtime's clock; `new Date().getFullYear()` resolves correctly in JSDOM.)

#### Implementation notes

- The copyright character is `©` (U+00A9). Use the literal char or `&copy;` — both render the same.
- Server component: `new Date()` runs at build/render time. For a static export, the year is locked at build time, which is fine.

---

### 9.4 — "Back to top" link/button

**Type:** AFK
**Blocked by:** None
**QA IDs:** F-04

#### What to build

Add a "Back to top" link in the footer that scrolls smoothly to the top. Two implementations:

- **Anchor link:** `<a href="#hero">Back to top ↑</a>` — relies on `scroll-behavior: smooth` from Phase 1 slice 1.1.
- **Button with explicit scroll:** `<button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>` — works even if smooth scroll CSS is overridden.

Default to **anchor link** — simpler, keyboard-friendly, no JS, and Phase 1 already shipped the smooth-scroll CSS.

Place in the bottom row alongside the copyright, or as a third row. Suggested layout: copyright-row becomes a flex with copyright on the left and back-to-top on the right:

```tsx
<div className="flex items-center justify-between text-xs text-gray-400">
  <p>© {new Date().getFullYear()} Smaran Harihar</p>
  <a href="#hero" className="hover:text-[#222222] transition-colors">
    Back to top ↑
  </a>
</div>
```

#### Behaviors to test (TDD)

1. **Back-to-top link is rendered with href `#hero`** — `screen.getByRole("link", { name: /back to top/i }).getAttribute("href") === "#hero"`.
2. **Link includes an up-arrow indicator** — text content matches `/↑|↗|⬆/` or contains the literal U+2191.

#### Implementation notes

- Use `↑` (U+2191) directly in JSX.
- Combine with slice 9.3 in the same PR for cohesion.

---

### 9.5 — External link ↗ indicator

**Type:** AFK (pulled forward, P3)
**Blocked by:** 9.1
**QA IDs:** F-06

#### What to build

Add a small ↗ glyph (or a `<ExternalLink>` lucide icon) beside each social link to indicate it opens in a new tab. After slice 9.1, social labels are icons — adding the ↗ would clutter, so apply this differently:

**Option A:** Add ↗ only to non-icon external links — but the only other link in the footer is the mailto, which isn't external. So this slice has no obvious place to apply in the footer alone.

**Option B:** Apply the convention site-wide via a shared `<ExternalLink>` component used in any text-based external link across the site. In Phase 9, create the component but only consume it where it's needed (which may be zero places in the footer post-9.1).

Default to **defer this slice** — it doesn't apply to icon-based footer socials. If site-wide external links exist (in About, Reels modal, etc.), pull this into the appropriate phase. Track as a no-op here unless the user says otherwise.

If the user wants the ↗ on social _icons_ (atypical but possible): add a small `↗` `<sup>` after each icon, with `aria-hidden`. Most users won't want this — it visually clutters the icon row.

#### Behaviors to test (TDD)

If implemented (Option A or B), assert the ↗ glyph is in the DOM and `aria-hidden`. Otherwise, skip — close the issue as "no applicable surface in footer."

#### Implementation notes

- Most likely outcome: this slice closes as no-op for the footer. Open the GitHub issue with a comment proposing to either: (a) skip in this phase, (b) ship a shared `<ExternalLink>` helper for future use.

---

## Suggested slice order for /to-issues

1. **9.2** — Twitter/X URL (HITL — open issue, ask user; trivial once decided)
2. **9.1** — Icon-based socials (no blockers; biggest test rewrite)
3. **9.3 + 9.4** — Copyright + back-to-top (combine into one PR; both trivial, no blockers)
4. **9.5** — External link ↗ (likely no-op; close issue with rationale)

## Files touched

| File                           | Changes                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| `components/Footer.tsx`        | All slices modify this file                                         |
| `tests/ContactFooter.test.tsx` | Update label-based queries to role+name; new tests for new elements |
| `package.json`                 | Add `lucide-react` dep (slice 9.1)                                  |

## Verification gate

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` walkthrough:
   - Each social icon opens the correct profile in a new tab. Verify by clicking each.
   - Hover each icon → opacity dims; cursor is pointer.
   - VoiceOver/NVDA announces each link by platform name (IMDB, YouTube, Facebook, Instagram, Twitter/X).
   - Twitter (or X) icon either redirects to `x.com` (Option A) or is absent (Option B).
   - Copyright line shows `© [current year] Smaran Harihar`.
   - "Back to top" link scrolls to hero smoothly.
   - axe-core: zero violations on the footer.
3. `git diff` reviewed; conventional-commit subjects per slice (`feat(footer): replace text labels with icons`, `feat(footer): copyright + back-to-top`).
4. Each slice opens its own PR (or merge 9.3+9.4 if preferred).
