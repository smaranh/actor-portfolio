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
   - **Symptom:** The Hero section's background image correctly repositions the face on mobile but fails to do so on desktop — at 1440×900 the face is cropped out the top of the viewport.
   - **Cause (verified):** `Hero.tsx` uses `bg-cover bg-center` with `public/images/hero.jpg` (2500×3750, portrait, eyes at y≈600 ≈ 16% from top). At desktop 1440×900 (landscape, aspect 1.6), `bg-cover` scales the source so width 2500 → 1440 (factor 0.576), giving scaled height ~2160px. With `bg-center`, ~630px is clipped from each of the top and bottom — the face (originally at scaled y≈346) ends up at viewport y ≈ 346 − 630 = −284, off-screen above the viewport. On mobile (portrait viewport), aspect ratios match and `bg-center` keeps the face visible.

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
   - **Fix:** In `components/Hero.tsx:5`, change the section's className from:

     ```tsx
     className = "relative h-screen w-full bg-cover bg-center";
     ```

     to:

     ```tsx
     className = "relative h-screen w-full bg-cover bg-center md:bg-top";
     ```

     - Mobile (default) keeps `bg-center` — already correct there.
     - Desktop (`md:` and up, ≥768px) switches to `bg-top`, anchoring the head at the viewport's top edge so the face lands in the upper portion of the visible area. Matches the reference at `public/images/hero-reference.jpg`.

   - **Optional right-bias variant:** if visual review shows the face should sit slightly right of center (closer to the reference's center-right composition), use:

     ```tsx
     className =
       "relative h-screen w-full bg-cover bg-center md:bg-[position:60%_top]";
     ```

     Start with the simpler `md:bg-top` and dial in only if needed.

   - **Existing headline kept.** The "Hey there, I'm Smaran Harihar..." overlay at bottom-left stays unchanged. The reference screenshot was cropped to the upper portion only; the headline is not removed.

   - **E2e regression test follow-up.** Once the visual fix is approved by stakeholder review:
     1. Unskip the Issue 3 test in `e2e/specs/phase-2-issues.spec.ts` (change `test.skip(` back to `test(` at line 68).
     2. Run `npx playwright test e2e/specs/phase-2-issues.spec.ts --update-snapshots` once to baseline the approved hero composition at `e2e/specs/phase-2-issues.spec.ts-snapshots/hero-desktop-chromium-darwin.png`.
     3. Commit the baseline image so future runs catch any regression against the approved look.

   - **Reference image housekeeping (optional).** Move `public/images/hero-reference.jpg` to `Plan/hero-reference.jpg` so the comparison artifact lives alongside this plan rather than shipping in the production `public/` bundle.

   - **Why not crop a desktop-specific asset?** The user chose the approximate path. Cropping a separate landscape `hero-desktop.jpg` and swapping via media query (or migrating to `next/image` with `objectPosition` and responsive `sizes`) would be pixel-accurate but is out of scope for this fix. Escalate only if `md:bg-top` (and the right-bias variant) can't get close enough to the reference for stakeholder approval.

## Verification Notes

- Issue 2 was investigated with a Playwright `elementFromPoint` probe against `npm run dev` at 1440×900. The probe gridded the `<li>` bounding box and recorded computed cursor at each point. Results showed `<A>` + `cursor: pointer` only in the middle 16px of the 24px-tall `<li>`, with `<LI>` + `cursor: auto` in the top and bottom ~4px. The site title's hit box ends at x≈160; "About Me" begins at x=1009 — no overlap.
- Issue 3 was diagnosed against the reference at `public/images/hero-reference.jpg` (3834×1992 landscape). Source dimensions confirmed via `sips`: `hero.jpg` is 2500×3750 portrait. The 16% face-from-top position in the source plus the 0.576 cover scale at 1440×900 desktop produce the −284px off-screen offset. `bg-top` (0% top) eliminates the top-clip and lands the face at viewport y≈346 (~38% from top), matching the reference's "head at top, eyes near center" composition.
