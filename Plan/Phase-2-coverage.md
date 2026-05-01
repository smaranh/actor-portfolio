# Phase 2 Coverage & Iteration

This document tracks issues discovered during Phase 2 implementation and testing.

## Identified Issues

1. **Nav Link Jump:**
   - **Symptom:** Clicking a nav link (e.g., "Headshots") causes the page to jump to the top before scrolling down to the target section, even if already on that section.
   - **Cause (verified):** The `href` is currently set as `/#section`. In Next.js, using `/#` triggers a route change to the root path `/` (jumping to the top) before applying the hash. Bare `#section` is intercepted by Next.js as an in-page scroll instead.

2. **"About Me" Hover Issue:**
   - **Symptom:** Hovering over the "About Me" nav link does not change the cursor to a pointer in some areas of the link's visible region.
   - **Cause (verified via Playwright probe):** NOT a z-index or stacking issue — there is no overlapping element. The `<Link>` renders as `display: inline`, so its hit box equals the text glyph box (~17px tall). The parent `<li>` is ~24px tall, so a ~3.5px dead zone exists at the top and bottom of each `<li>` where `elementFromPoint` returns the `<li>` (cursor `auto`) instead of the `<a>` (cursor `pointer`). Probe at 1440×900 viewport: `<a>` rect 85×17, `<li>` rect 85×24.

3. **Hero Image Repositioning:**
   - **Symptom:** The Hero section's background image correctly repositions the face on mobile but fails to do so on desktop.
   - **Cause Hypothesis:** `bg-center` is identical at every breakpoint; what changes is the viewport aspect ratio. On mobile (portrait), the image is cropped on the sides, keeping the face centered vertically. On desktop (landscape), the image is cropped top/bottom, clipping the face if it isn't vertically centered in the source. Needs a breakpoint-specific `background-position`.

## Proposed Solutions

1. **Nav Link Jump:**
   - **Fix:** In `components/Nav.tsx`:
     - Update the `links` array to use bare hash fragments (e.g., `#about` instead of `/#about`).
     - Update the `sectionId` derivation (currently `href.replace("/#", "")`) to `href.replace("#", "")` to stay consistent with the new href format.
     - Change the site title's `href` from `/#` to `#hero` (the `<section id="hero">` already exists in `components/Hero.tsx`), so the home link scrolls to the top of the page rather than triggering a route load.

2. **"About Me" Hover Issue:**
   - **Fix:** In `components/Nav.tsx`, make each desktop nav `<Link>` fill its `<li>` so the entire visible row is hoverable/clickable. Add `block` (and small vertical padding such as `py-1`) to the link's `className`. Apply the same change to the mobile overlay links for consistency, even though the larger font size masks the bug there.
   - **Do NOT** add `relative z-10` to the `<ul>` — the probe confirms there is no overlapping element to escape from, so that change would have no effect.

3. **Hero Image Repositioning:**
   - **Fix:** In `components/Hero.tsx`, replace `bg-center` with a breakpoint-specific value. The exact direction depends on where the face sits in `public/images/hero.jpg`:
     - If the face is in the upper portion of the source image, use `bg-top md:bg-top` or `bg-[center_top]` on desktop.
     - If the face is centered, the current `bg-center` should already work — re-verify the symptom first.
   - Inspect `hero.jpg` before choosing the class. If migrating to `next/image`, use `objectPosition` instead.

## Verification Notes

- Issue 2 was investigated with a Playwright `elementFromPoint` probe against `npm run dev` at 1440×900. The probe gridded the `<li>` bounding box and recorded computed cursor at each point. Results showed `<A>` + `cursor: pointer` only in the middle 16px of the 24px-tall `<li>`, with `<LI>` + `cursor: auto` in the top and bottom ~4px. The site title's hit box ends at x≈160; "About Me" begins at x=1009 — no overlap.
