# Phase 3 — Hero (`components/Hero.tsx`)

## Overview

Polish and harden the hero section. All work scoped to `components/Hero.tsx` and its test file `tests/Hero.test.tsx`, plus a new build-time image-optimization script (`scripts/optimize-images.ts`) and a small `next.config.ts` tweak for hero asset variants. Uses Framer Motion (installed in Phase 1) for the Ken-Burns effect and the Phase 1 `<FadeInOnScroll>` wrapper for entrance.

**QA-PLAN IDs addressed:** H-01, H-02, H-03, H-04, H-05, H-07, H-08, P-01, plus G-01 (entrance fade hookup).

## Current state

- `Hero.tsx` (27 lines) — `<section id="hero">` with `h-screen` and an inline `style={{ backgroundImage: url(...) }}` pointing at `/images/hero.jpg`.
- Background renders via raw CSS `background-image` on the section, not Next.js `<Image>` — no responsive sizing, no AVIF/WebP, no `priority` hint, no LCP optimization (H-02, H-08).
- Overlay is a flat `bg-black/20` `<div>` — no gradient, text contrast on bright skies is borderline (H-03).
- `h-screen` on iOS Safari uses the large viewport (URL bar visible), so the hero overflows when the URL bar collapses (H-01).
- Heading uses straight ASCII apostrophes in `&apos;` entities — should be real Unicode `’` (H-07).
- Type rhythm is a single Playfair `<h1>` + Inter `<p>` — no italic greeting, no bold name split, no eyebrow (H-04).
- No motion at all — Ken-Burns zoom missing (H-05). No entrance fade hooked up (G-01).
- `public/images/hero.jpg` is 550KB JPEG — not catastrophic but worth shipping AVIF/WebP responsive variants (P-01).
- `tests/Hero.test.tsx` covers: section id, heading text, subheading text, background-image string contains `hero.jpg`, text container has `bottom`/`left` classes. **Three of these break** when we migrate to `<Image>` (the inline `style.backgroundImage` assertion no longer applies; the `bottom-12 left-8` container may move).

## Slices

### 3.1 — Fix iOS viewport overflow (`h-screen` → `min-h-[100svh]`)

**Type:** AFK
**Blocked by:** None
**QA IDs:** H-01

#### What to build

Replace `h-screen` with `min-h-[100svh]` so the hero uses the _small_ viewport height on iOS Safari (URL bar collapsed) and stops overflowing when the bar hides. Keep `w-full`. `min-h-` (rather than `h-`) lets the hero grow if its content is ever taller than the viewport, which avoids clipping the heading on very short landscape phones.

#### Behaviors to test (TDD)

1. **Hero section uses `min-h-[100svh]` instead of `h-screen`** — the section's className matches `/min-h-\[100svh\]/` and does NOT match `/\bh-screen\b/`.
2. **Hero section retains full width** — className still contains `w-full`.

#### Implementation notes

- In `Hero.tsx`, change `h-screen w-full` → `min-h-[100svh] w-full`.
- No CSS changes needed; `svh` is a standard Tailwind arbitrary value.

---

### 3.2 — Migrate background to `<Image fill priority>` + overlay sibling

**Type:** AFK
**Blocked by:** 3.1
**QA IDs:** H-02, H-08

#### What to build

Replace the inline `style={{ backgroundImage: url(...) }}` with a Next.js `<Image fill priority sizes="100vw" />` rendered as the first child of the section, and keep the overlay `<div>` as a sibling layered above it. This lets Next emit responsive `srcSet`, AVIF/WebP, and a proper `priority` hint for LCP. Text content stays in a third sibling `<div>` positioned via absolute classes.

Structure:

```tsx
<section id="hero" className="relative min-h-[100svh] w-full overflow-hidden">
  <Image
    src={`${basePath}/images/hero.jpg`}
    alt=""
    fill
    priority
    sizes="100vw"
    className="object-cover object-center md:object-top"
  />
  <div className="absolute inset-0 ..." /> {/* overlay (slice 3.3) */}
  <div className="absolute bottom-12 left-8 md:left-16 text-white">
    {/* heading + subheading */}
  </div>
</section>
```

The previous `bg-cover bg-center md:bg-top` classes move onto `<Image className="object-cover object-center md:object-top">`. Add `overflow-hidden` to the section so the future Ken-Burns zoom (slice 3.5) doesn't bleed past the edges.

#### ⚠️ Existing tests to update first

Before writing new tests, update `tests/Hero.test.tsx`:

- `"uses hero.jpg as background image"` — currently asserts `section.style.backgroundImage` contains `hero.jpg`. After this slice the background lives in an `<img>`, not inline style. **Rewrite:** assert that the section contains an `<img>` whose `src` (or `srcset`) contains `hero.jpg`. Example:
  ```ts
  const img = document.querySelector("#hero img") as HTMLImageElement;
  expect(img).toBeInTheDocument();
  expect(img.src + (img.srcset ?? "")).toContain("hero.jpg");
  ```
- `"positions text at the bottom-left"` — still passes because the text container keeps `bottom-12 left-8 md:left-16`. **No change needed.**
- The other three (`#hero` id, heading text, subheading text) remain valid.

#### Behaviors to test (TDD)

1. **Hero renders a Next.js `<Image>` whose src contains `hero.jpg`** — see updated assertion above.
2. **Image has `fill`-style sizing** — element has `data-fill="true"` (the `next/image` mock from existing tests sets this) OR the rendered `<img>` has the `position: absolute; inset: 0` styles Next applies for fill. If a mock isn't already in place, add a minimal one (see below).
3. **Image has empty alt for decorative use** — `<img alt="">`. The hero is purely decorative; the `<h1>` carries the meaning.
4. **Image has `priority` hint** — for the existing `next/image` mocks in this repo, this is typically expressed as `loading="eager"` or a `data-priority` attribute. Match whatever the existing mock surfaces.
5. **Section has `overflow-hidden`** — so the future zoom doesn't leak.

#### ⚠️ `next/image` mock check

`tests/setup.ts` may or may not already mock `next/image`. If `Hero.test.tsx` starts failing with "Cannot find module 'next/image'" or unexpected DOM, add a local mock at the top of the test file (mirroring patterns used in `Headshots.test.tsx` / `About.test.tsx`):

```tsx
vi.mock("next/image", () => ({
  default: ({ src, alt, fill, priority, sizes, className, ...rest }: any) => (
    <img
      src={typeof src === "string" ? src : src.src}
      alt={alt}
      data-fill={fill ? "true" : undefined}
      data-priority={priority ? "true" : undefined}
      data-sizes={sizes}
      className={className}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  ),
}));
```

Reuse whatever mock shape the other component tests already use — the goal is consistency, not a new pattern.

#### Implementation notes

- Add `import Image from "next/image"` at the top of `Hero.tsx`.
- Read base path the same way as the current code: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/hero.jpg`.
- Move `bg-cover bg-center md:bg-top` from the section to the `<Image>` as `object-cover object-center md:object-top`.
- Add `overflow-hidden` and `relative` to the section (it's already `relative`).

---

### 3.3 — Vertical gradient overlay

**Type:** AFK
**Blocked by:** 3.2
**QA IDs:** H-03

#### What to build

Replace the flat `bg-black/20` overlay with a vertical gradient that's darkest at the bottom (where the text sits) and transparent at the top: `bg-gradient-to-b from-black/60 via-black/20 to-transparent`. This restores legibility against bright sky regions of the hero photo without darkening the whole frame.

Reading direction matters: the QA-PLAN spec is "darkest at bottom, fading to transparent at top," which Tailwind's `bg-gradient-to-b` does as `from-(top) → to-(bottom)`. So the actual class is `bg-gradient-to-t from-black/60 via-black/20 to-transparent` (gradient _toward the top_ makes "from" the bottom). Verify in the browser before committing — flipping the direction is the most common bug here.

#### Behaviors to test (TDD)

1. **Overlay is no longer a flat `bg-black/20`** — the overlay `<div>` className does NOT match `/bg-black\/20\b/`.
2. **Overlay uses a gradient utility** — className matches `/bg-gradient-to-/`.
3. **Overlay includes the dark stop** — className matches `/from-black\/60/`.
4. **Overlay is still positioned `absolute inset-0`** — the layering didn't break.

#### Implementation notes

- Find the `<div className="absolute inset-0 bg-black/20" />` and replace `bg-black/20` with `bg-gradient-to-t from-black/60 via-black/20 to-transparent`.
- No new dependencies.

---

### 3.4 — Type rhythm: italic greeting + bold name + uppercase eyebrow

**Type:** AFK
**Blocked by:** None (can ship before or after 3.2/3.3)
**QA IDs:** H-04

#### What to build

Restructure the hero copy from one flat heading into three typographic registers, matching the live trappedactor.com voice:

1. **Eyebrow** — small uppercase Inter, low opacity. Suggested copy: `WELCOME` or `INTRODUCING` (confirm with user; the QA-PLAN leaves the exact word open). Use `<p className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium text-white/80 mb-3">`.
2. **Greeting + name** — the existing `<h1>` becomes a two-part heading: an italic Playfair greeting (`Hey there, I'm`) followed by a bold non-italic Playfair name (`Smaran Harihar.`). Wrap each part in a `<span>` so they can carry different classes without breaking the single `<h1>`:
   ```tsx
   <h1 className="font-playfair text-4xl md:text-6xl leading-tight mb-3" style={...}>
     <span className="italic font-normal">Hey there, I&rsquo;m </span>
     <span className="font-bold">Smaran Harihar.</span>
   </h1>
   ```
3. **Subheading** — unchanged copy, unchanged classes (Inter light).

#### Behaviors to test (TDD)

1. **Eyebrow renders above the heading** — there is an element with class containing `uppercase` and `tracking-[0.2em]` whose text appears in the document.
2. **Heading is split into italic and bold spans** — within the `<h1>`, query for two `<span>` children; the first matches `/italic/` and contains `Hey there`; the second matches `/font-bold/` and contains `Smaran Harihar`.
3. **Heading text content is preserved** — `screen.getByRole("heading", { level: 1 })` still has the textContent `"Hey there, I'm Smaran Harihar."` (apostrophe handled in slice 3.6).
4. **Subheading is unchanged** — `screen.getByText("I'm an Actor, Software Engineer and a Dad.")` still resolves.

#### ⚠️ Existing test to update first

- `"renders the heading"` — currently uses `screen.getByText("Hey there, I'm Smaran Harihar.")`. After the split into two spans, `getByText` may not match because the text spans multiple elements. Switch to:
  ```ts
  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveTextContent("Hey there, I'm Smaran Harihar.");
  ```
  `toHaveTextContent` flattens descendant text nodes.

#### Implementation notes

- Eyebrow copy: default to `WELCOME` for now; flag in PR description for user to override.
- Keep the `textShadow` style on the `<h1>` (and add it to the eyebrow if it lands on bright sky).
- Apostrophe lands in slice 3.6.

---

### 3.5 — Ken-Burns zoom via Framer Motion (reduced-motion gated)

**Type:** AFK
**Blocked by:** 3.2
**QA IDs:** H-05

#### What to build

Add a slow Ken-Burns effect: the hero image scales from `1.0` to `1.05` over ~20s and never reverses (it just sits at 1.05 once done). Use Framer Motion `motion.div` wrapping the `<Image>` (or apply `motion` directly to a wrapper since `next/image` doesn't accept Framer props). Gate on `useReducedMotion()` — if reduced motion is on, skip the animation entirely (image stays at scale 1.0).

Implementation outline:

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";

const reduce = useReducedMotion();

<motion.div
  className="absolute inset-0"
  initial={{ scale: 1 }}
  animate={{ scale: reduce ? 1 : 1.05 }}
  transition={{ duration: reduce ? 0 : 20, ease: "easeOut" }}
>
  <Image fill priority sizes="100vw" alt="" src={...} className="object-cover object-center md:object-top" />
</motion.div>
```

Add `"use client"` to `Hero.tsx` (it's currently a server component).

#### Behaviors to test (TDD)

1. **Hero is wrapped in a motion element with scale animation** — query for the wrapper and assert it has the expected `data-animate` JSON (mirrors the Phase 2 framer-motion mock pattern).
2. **Reduced motion: scale stays at 1** — when `useReducedMotion` returns `true`, the wrapper's `animate` prop encodes `scale: 1` and `transition.duration: 0`.
3. **Default motion: scale animates to 1.05 over 20s** — when `useReducedMotion` returns `false`, the animate prop encodes `scale: 1.05` and `transition.duration: 20`.

#### ⚠️ Test file mock required

Same as Phase 2 slice 2.3 — `tests/Hero.test.tsx` needs the `framer-motion` mock if it isn't already inherited from `tests/setup.ts`. Reuse the exact mock shape:

```ts
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, animate, transition, initial, ...props }: any) => (
      <div
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-initial={JSON.stringify(initial)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: vi.fn(() => false),
}));
```

If Phase 2 already added an equivalent mock to `tests/setup.ts`, extend it to also export `motion.div` (Phase 2 only mocked `motion.span`).

#### Implementation notes

- Add `"use client"` directive at top of `Hero.tsx`.
- Wrap `<Image>` in `<motion.div className="absolute inset-0">`.
- The overlay and text containers stay as siblings of `motion.div` (not inside it), so they don't zoom with the image.

---

### 3.6 — Real Unicode apostrophes

**Type:** AFK
**Blocked by:** None
**QA IDs:** H-07

#### What to build

Swap the HTML entity `&apos;` (which renders as the straight `'`) for the curly Unicode right-single-quote `’` (`'`) in both the greeting and subheading. Use the JSX text form `’` or paste the literal character — either works. This affects the rendered DOM and tests that match the literal string.

#### Behaviors to test (TDD)

1. **Heading uses curly apostrophe** — `screen.getByRole("heading", { level: 1 })` text content matches `/Hey there, I’m Smaran Harihar\./`.
2. **Subheading uses curly apostrophe** — `screen.getByText(/I’m an Actor/)` resolves.

#### ⚠️ Existing tests to update first

- `"renders the heading"` (already updated in slice 3.4): change the expected text from `"Hey there, I'm Smaran Harihar."` to `"Hey there, I’m Smaran Harihar."`. (After slice 3.4 it uses `toHaveTextContent`, which still works with the curly char — just update the literal.)
- `"renders the subheading"`: change `screen.getByText("I'm an Actor, Software Engineer and a Dad.")` to `screen.getByText("I’m an Actor, Software Engineer and a Dad.")`.

#### Implementation notes

- Replace `I&apos;m` with `I’m` (or paste the char) in both the heading and subheading JSX.
- No CSS or font changes needed — Playfair and Inter both render the curly form correctly.

---

### 3.7 — Hero entrance fade via `<FadeInOnScroll>`

**Type:** AFK
**Blocked by:** 3.4
**QA IDs:** G-01 (Phase 1 wrapper hookup)

#### What to build

Wrap the hero text block (eyebrow + heading + subheading) in the Phase 1 `<FadeInOnScroll>` so the copy fades in on initial paint. Don't wrap the whole section (the image and overlay should be there immediately to anchor the LCP). Don't wrap the image itself (it's the LCP candidate).

Note that the hero is at the top of the page, so `whileInView` fires immediately on mount — the fade is essentially an entrance animation, not a scroll-driven one. That's intentional.

#### Behaviors to test (TDD)

1. **Text block is wrapped in `<FadeInOnScroll>`** — the text container is a descendant of an element with the data-attribute or class that the `FadeInOnScroll` mock from Phase 1 sets. (Reuse whichever assertion `Phase 1`'s tests use — likely a `data-fade-in-on-scroll` marker or a specific class.)
2. **Heading and subheading still render** — existing assertions from slices 3.4 and 3.6 keep passing inside the wrapper.

#### Implementation notes

- Import `<FadeInOnScroll>` from `components/FadeInOnScroll`.
- Wrap only the inner `<div className="absolute bottom-12 left-8 md:left-16 text-white">` content (or wrap the div itself — pick the form that doesn't break the absolute positioning; if `FadeInOnScroll` renders a `motion.div`, you may need to put the absolute classes on the wrapper itself rather than a child).
- Keep the wrapper outside the `motion.div` that runs Ken-Burns (slice 3.5).

---

### 3.8 — Compress `hero.jpg` → AVIF/WebP via `scripts/optimize-images.ts`

**Type:** AFK
**Blocked by:** None (independent of the component changes; can land first or last)
**QA IDs:** P-01

#### What to build

Create `scripts/optimize-images.ts` (Node script, run via `tsx` or `node --import tsx`) that uses `sharp` to read `public/images/*.jpg` and emit responsive variants alongside them: `hero.avif`, `hero.webp`, plus widths `1280`, `1920`, `2560` for each. Wire the script into `package.json`'s `build` step (`"build": "npm run optimize-images && next build"` — or as a `prebuild` hook).

This slice is **infrastructure only** — it does NOT change `Hero.tsx`. Next.js's `<Image>` (post slice 3.2) will automatically pick the optimized variant when the `next.config.ts` `images` config knows about them. If `next/image` is already serving AVIF via its own pipeline (the default in Next 13+), this script is mostly insurance for the static-export build (`output: "export"`) where the runtime optimizer is disabled.

Target: `hero.jpg` 550KB → `hero.avif` ~120KB at 1920w, ~50KB at 1280w.

#### Behaviors to test (TDD)

This is a build-time script with no runtime behavior to assert in unit tests. Verification is operational:

1. `npm run optimize-images` produces `public/images/hero.avif`, `public/images/hero.webp`, and width-suffixed variants (`hero-1280.avif`, etc.).
2. Each variant is smaller than the source.
3. `next build` still succeeds with the new prebuild step.

If TDD discipline is required, write a single integration test that imports the script's main function and runs it against a fixture directory, asserting output files exist. Otherwise rely on the manual verification in the gate below.

#### Implementation notes

- Add dev dependency: `npm install --save-dev sharp tsx`.
- Script outline:

  ```ts
  import sharp from "sharp";
  import { readdir } from "node:fs/promises";
  import path from "node:path";

  const SRC = "public/images";
  const WIDTHS = [1280, 1920, 2560];
  const FORMATS = ["avif", "webp"] as const;

  for (const file of await readdir(SRC)) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const base = path.parse(file).name;
    const input = path.join(SRC, file);
    for (const fmt of FORMATS) {
      for (const w of WIDTHS) {
        await sharp(input)
          .resize({ width: w, withoutEnlargement: true })
          .toFormat(fmt, { quality: fmt === "avif" ? 60 : 80 })
          .toFile(path.join(SRC, `${base}-${w}.${fmt}`));
      }
      // also full-res variant
      await sharp(input)
        .toFormat(fmt, { quality: fmt === "avif" ? 60 : 80 })
        .toFile(path.join(SRC, `${base}.${fmt}`));
    }
  }
  ```

- Add `"optimize-images": "tsx scripts/optimize-images.ts"` and `"prebuild": "npm run optimize-images"` to `package.json`.
- Generated files should be committed (since the static export runs in CI without runtime image optimization). Add a header comment to the script noting that.
- Consider adding a `.gitattributes` rule or a `.gitignore` decision: commit the variants for predictable static builds, OR ignore them and rely on CI. Default: **commit them** — keeps deploys deterministic.

---

## Suggested slice order for /to-issues

Create issues in this order so blockers land first and existing tests are touched as few times as possible:

1. **3.1** — `min-h-[100svh]` (no blockers, trivial)
2. **3.6** — Curly apostrophes (no blockers, trivial; do before 3.4 so the test-text update happens once)
3. **3.4** — Type rhythm split (no blockers; before 3.2 because it doesn't depend on Image migration)
4. **3.2** — Migrate to `<Image fill priority>` (blocked by 3.1; biggest test rewrite)
5. **3.3** — Gradient overlay (blocked by 3.2)
6. **3.5** — Ken-Burns zoom (blocked by 3.2)
7. **3.7** — `<FadeInOnScroll>` wrapper (blocked by 3.4)
8. **3.8** — `scripts/optimize-images.ts` (no blockers; can run in parallel — independent file)

## Files touched

| File                                                        | Changes                                                                       |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `components/Hero.tsx`                                       | All component slices (3.1–3.7) modify this file                               |
| `tests/Hero.test.tsx`                                       | Updated assertions for slices 3.2, 3.4, 3.6; new tests for 3.1, 3.3, 3.5, 3.7 |
| `tests/setup.ts`                                            | Possibly extended to mock `motion.div` if Phase 2 only mocked `motion.span`   |
| `scripts/optimize-images.ts`                                | New file (slice 3.8)                                                          |
| `package.json`                                              | New `optimize-images` and `prebuild` scripts; `sharp`, `tsx` devDependencies  |
| `public/images/hero.{avif,webp,*-1280.*,*-1920.*,*-2560.*}` | Generated by the script (committed)                                           |
| `next.config.ts`                                            | No changes expected (static export already configured in earlier phases)      |

## Verification gate

From QA-PLAN.md:

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run optimize-images` runs cleanly and produces AVIF/WebP variants for `hero.jpg` (and any other image in `public/images/`).
3. `npm run dev` manual walkthrough:
   - Open hero on iOS Safari (or Chrome devtools "iPhone 14 Pro" with the URL bar simulation): hero fits the small viewport, no overflow when the URL bar collapses.
   - DOM inspector confirms the hero background is an `<img>` (not inline CSS), with `srcset`/`sizes` attributes and `loading="eager"` (or the priority equivalent).
   - Bottom of hero is darker than top — heading legible against any sky color.
   - Eyebrow renders above heading; greeting is italic; "Smaran Harihar." is bold.
   - Apostrophes look curly, not straight (zoom in if unsure).
   - Ken-Burns: image visibly zooms over ~20s on first load. Toggle System Settings → Accessibility → Reduce Motion → reload: zoom is gone.
   - Heading + subheading fade in on initial paint (entrance animation).
4. Lighthouse mobile run: hero LCP < 2.5s; CLS = 0; no layout shift on the hero.
5. `git diff` reviewed; conventional-commit subject per slice (e.g., `feat(hero): migrate background to next/image with priority`, `fix(hero): use min-h-[100svh] to avoid iOS overflow`, `perf(hero): add build-time AVIF/WebP optimization`).
6. Each slice opens its own PR for review (per `/implement-plan` skill).
