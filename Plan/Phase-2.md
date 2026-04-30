# Phase 2 — Nav (`components/Nav.tsx`)

## Overview

Polish and harden the fixed navigation bar. All work scoped to `components/Nav.tsx` and its test file `tests/Nav.test.tsx`. Uses Framer Motion (installed in Phase 1) for hamburger animation. Adds IntersectionObserver-driven active-section indicator.

**QA-PLAN IDs addressed:** N-01, N-02, N-03, N-04, N-05, N-06, N-07, N-08.

## Current state

- `Nav.tsx` (110 lines) — fixed nav with transparent → white scroll state, hamburger, mobile overlay.
- Scroll threshold is `> 0` (triggers immediately — bug N-01).
- Scrolled state applies `bg-white shadow-sm` — no glass/blur effect (N-03).
- Hamburger is three `<span>` bars — no animation to X (N-04).
- Hamburger has `aria-label="Open menu"` but no `aria-expanded` (N-05).
- Overlay has `aria-modal`, body scroll lock, close button, Esc-via-link-click dismiss — but no focus trap, no Esc keyboard handler, no focus restoration (N-06).
- Links and site title rely on Phase 1 global `:focus-visible` — no nav-specific ring (N-07).
- No active-section indicator (N-08).
- No "Home" link — matches PRD intentionally (N-02).
- **Section IDs available:** `#hero`, `#about`, `#reels`, `#headshots`, `#contact` (no `#stats` yet — that lands in Phase 7).

## Slices

### 2.1 — Fix scroll threshold + glass nav state

**Type:** AFK
**Blocked by:** None
**QA IDs:** N-01, N-03

#### What to build

Raise the scroll threshold from `> 0` to `> 30` so the transparent-to-scrolled transition doesn't fire on sub-pixel scrolls. Replace the opaque `bg-white shadow-sm` scrolled state with a glass effect: `backdrop-blur-md bg-white/70` + `border-b border-black/5`.

#### Behaviors to test (TDD)

1. **Nav remains transparent when scrollY ≤ 30** — scroll to 10px, 20px, 30px → nav class should NOT contain `bg-white` or `backdrop-blur`.
2. **Nav shows glass state when scrollY > 30** — scroll to 31px → nav class should contain `backdrop-blur` and `bg-white/70` and `border-b`.
3. **Glass state includes hairline bottom border** — when scrolled, nav has `border-black/5` class.
4. **Nav returns to transparent when scrolled back to ≤ 30** — scroll to 50px then back to 0 → transparent again.

#### ⚠️ Existing test to update first

Before writing new tests, update `tests/Nav.test.tsx`:

- `"is transparent at top of page"` — currently asserts `.not.toMatch(/bg-white/)`. After this slice the scrolled class becomes `bg-white/70`, so this assertion still passes (transparent nav has no `bg-white` at all). **No change needed.**
- `"gets white background after scrolling"` — currently asserts `.toMatch(/bg-white/)`. This will still match `bg-white/70` literally, but the intent is wrong; rename and tighten it: assert `.toMatch(/backdrop-blur/)` instead so it tracks the glass state rather than a partial string coincidence.
- `"returns to transparent when scrolled back to top"` — currently asserts `.not.toMatch(/bg-white/)`. Still passes. **No change needed.**

#### Implementation notes

- In `Nav.tsx`, change `window.scrollY > 0` → `window.scrollY > 30`.
- Replace scrolled class string:
  - **Before:** `"bg-white shadow-sm"`
  - **After:** `"backdrop-blur-md bg-white/70 border-b border-black/5 shadow-sm"`
- Existing tests that use `value: 50` will still pass since 50 > 30.

---

### 2.2 — Hamburger `aria-expanded` + label flip

**Type:** AFK
**Blocked by:** None
**QA IDs:** N-05

#### What to build

Add `aria-expanded` to the hamburger button that reflects menu state. When overlay is open, the hamburger should be hidden (since the overlay has its own close button), but if it were reachable its label would read "Close menu".

Since the hamburger is only visible when the overlay is closed, the main change is adding `aria-expanded="false"` to the hamburger button. When the menu opens, it's replaced by the overlay anyway, so `aria-expanded` will always be `false` on the visible hamburger.

However, to properly communicate state to assistive technology: when the overlay opens, we need to signal that the hamburger controls it. Add `aria-controls` pointing to the overlay's ID, and `aria-expanded={menuOpen}`.

#### Behaviors to test (TDD)

1. **Hamburger has `aria-expanded="false"` by default.**
2. **Hamburger has `aria-expanded="true"` when menu is open** — this requires the hamburger to remain in the DOM even when overlay is shown (or test the attribute right before the overlay mounts).
3. **Hamburger has `aria-controls` pointing to the overlay ID.**
4. **Overlay has an `id` attribute** matching the `aria-controls` value.

#### Implementation notes

- Add `id="mobile-nav-overlay"` to the overlay `<div>`.
- Add `aria-expanded={menuOpen}` and `aria-controls="mobile-nav-overlay"` to the hamburger `<button>`.
- The hamburger remains in the DOM behind the overlay (it's in the `<nav>` which is z-50, overlay is also z-50 but positioned over it).

---

### 2.3 — Animated hamburger bars → X (Framer Motion)

**Type:** AFK
**Blocked by:** 2.2
**QA IDs:** N-04

#### What to build

Replace the three static `<span>` bars with Framer Motion `motion.span` elements that animate into an X when `menuOpen` is true. The three bars morph: top bar rotates 45°, middle bar fades out, bottom bar rotates -45°. Honors `prefers-reduced-motion` (instant state change, no animation).

#### Behaviors to test (TDD)

1. **Hamburger renders 3 bars when menu is closed** — the button contains 3 child `<span>` elements.
2. **Bars transform into X shape when menu opens** — verify the presence of rotation styles or animate props. Since Framer Motion is mocked in tests, verify the mock receives the expected `animate` props (or test the rendered data attributes).
3. **Reduced-motion: bars switch state without animation** — when `useReducedMotion()` returns true, the transition duration is 0 (or `initial` is used instead of `animate`).

#### ⚠️ Test file mock required

`Nav.test.tsx` does not currently mock `framer-motion`. When slice 2.3 ships, any test that renders `Nav` will fail at import time with `motion is not defined` unless the mock is added. Add this block at the top of the test file (alongside the existing `next/link` mock):

```ts
vi.mock("framer-motion", () => ({
  motion: {
    span: ({ children, animate, ...props }: {
      children?: React.ReactNode;
      animate?: Record<string, unknown>;
      [key: string]: unknown;
    }) => <span data-animate={JSON.stringify(animate)} {...props}>{children}</span>,
  },
  useReducedMotion: vi.fn(() => false),
}));
```

This lets tests assert on the `data-animate` attribute to verify bar rotation/opacity values without running actual Framer Motion.

#### Implementation notes

- Import `motion, useReducedMotion` from `framer-motion`.
- `"use client"` is already present.
- Replace `<span>` with `<motion.span>` for the three bars.
- Animate based on `menuOpen`:
  - Bar 1: `rotate: menuOpen ? 45 : 0`, `translateY: menuOpen ? 8 : 0`
  - Bar 2: `opacity: menuOpen ? 0 : 1`
  - Bar 3: `rotate: menuOpen ? -45 : 0`, `translateY: menuOpen ? -8 : 0`
- Set `transition: { duration: reduced ? 0 : 0.3 }`.
- The hamburger button must stay in the DOM when menu is open (don't conditionally remove it); it just sits behind the overlay.

---

### 2.4 — Focus trap + Esc handler + focus restoration on mobile overlay

**Type:** AFK
**Blocked by:** None
**QA IDs:** N-06

#### What to build

When the mobile overlay opens:

1. Move focus to the first focusable element (the close button).
2. Trap Tab/Shift+Tab within the overlay (wrap around from last link → close button and vice versa).
3. Pressing Escape closes the overlay.
4. On close, restore focus to the hamburger button.

#### Behaviors to test (TDD)

1. **Focus moves to close button when overlay opens** — after clicking hamburger, `document.activeElement` should be the close button.
2. **Escape key closes overlay** — keyDown Escape on overlay → overlay removed from DOM.
3. **Focus returns to hamburger after closing overlay** — after closing via Esc or close button, `document.activeElement` should be the hamburger button.
4. **Tab from last link wraps to close button** — focus the last link ("Contact"), press Tab → focus lands on close button.
5. **Shift+Tab from close button wraps to last link** — focus the close button, press Shift+Tab → focus lands on last link.

#### Implementation notes

- Give the hamburger button a `ref` so focus can be restored: `const hamburgerRef = useRef<HTMLButtonElement>(null)`.
- Give the close button a `ref` and call `closeRef.current?.focus()` in a `useEffect` that runs when `menuOpen` becomes true.
- Add a `useEffect` for the Escape keydown listener when `menuOpen` is true.
- Implement focus trap: on `keydown` of Tab within the overlay, check if focus is on the last focusable element and wrap to first (and vice versa for Shift+Tab).
- On close, call `hamburgerRef.current?.focus()`.

---

### 2.5 — Nav link focus-visible rings

**Type:** AFK
**Blocked by:** None
**QA IDs:** N-07

#### What to build

Ensure all nav links and the site title have visible, well-contrasted `:focus-visible` outlines. On the hero (transparent nav), rings should be white; on scrolled nav, rings should be dark. The Phase 1 global `.focus-ring-invert` class handles inversion, but nav needs to apply it correctly based on scroll state.

#### Behaviors to test (TDD)

1. **Nav bar applies `focus-ring-invert` class when transparent (not scrolled)** — at the top of page, nav should have the `focus-ring-invert` class so focus rings appear white on the dark hero.
2. **Nav bar removes `focus-ring-invert` class when scrolled** — after scrolling past threshold, the class is removed so focus rings appear dark on white background.

#### Implementation notes

- Add `focus-ring-invert` to the nav's className when `!scrolled`.
- Remove it when `scrolled`.
- The global CSS already defines `.focus-ring-invert :focus-visible { outline-color: #ffffff }`, so no CSS changes needed.

---

### 2.6 — IntersectionObserver active-section underline

**Type:** AFK
**Blocked by:** 2.1
**QA IDs:** N-08

#### What to build

As the user scrolls, the desktop nav link corresponding to the currently visible section gets a subtle underline indicator. Uses `IntersectionObserver` to detect which section (`#about`, `#reels`, `#headshots`, `#contact`) is in view.

#### ⚠️ IntersectionObserver stub required

JSDOM does not implement `IntersectionObserver`. Any test that renders `Nav` after this slice ships will throw `IntersectionObserver is not defined` unless stubbed. Add the following to `tests/setup.ts` (runs globally before every test file):

```ts
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: IntersectionObserverCallback;

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn((cb: IntersectionObserverCallback) => {
    intersectionCallback = cb;
    return { observe: mockObserve, disconnect: mockDisconnect };
  })
);

// Expose helper for tests that need to simulate intersection
export const triggerIntersection = (id: string, isIntersecting = true) => {
  intersectionCallback(
    [
      {
        target: { id },
        isIntersecting,
      } as unknown as IntersectionObserverEntry,
    ],
    {} as IntersectionObserver
  );
};
```

Tests that verify active-section behavior import `triggerIntersection` from `setup.ts` and call it to simulate a section entering the viewport. Tests that only render `Nav` for other assertions (links, scroll state, overlay) need no changes — the stub silently provides the interface without triggering callbacks.

#### Behaviors to test (TDD)

1. **No link is active on initial render** — no link has the active underline class.
2. **Link becomes active when its section is in view** — call `triggerIntersection("about")` → the "About Me" link gets the active class (e.g., `border-b-2 border-current`).
3. **Previously active link deactivates when another section enters view** — call `triggerIntersection("reels")` after "about" was active → "About Me" loses active class, "Reels" gains it.
4. **Active underline is hidden on mobile** — the underline only applies to `hidden md:flex` desktop links (the `<ul>` list), not to overlay links.

#### Implementation notes

- Add state: `const [activeSection, setActiveSection] = useState("")`.
- Add a `useEffect` that creates an `IntersectionObserver` observing all section elements (`document.querySelectorAll("section[id]")`), with `threshold: 0.4` and `rootMargin: "-64px 0px 0px 0px"` (nav height offset).
- On intersection, set `activeSection` to the `id` of the intersecting entry.
- In the desktop link render, conditionally add a bottom border class when `link.href` contains the active section:
  ```
  const isActive = activeSection && href.includes(activeSection);
  className += isActive ? " border-b-2 border-current" : "";
  ```
- Disconnect observer on unmount.

---

### 2.7 — Document "Home" link omission

**Type:** AFK
**Blocked by:** None
**QA IDs:** N-02

#### What to build

Add a code comment in `Nav.tsx` confirming that the "Home" link is intentionally omitted per the PRD. The site title "Smaran Harihar" links to `/#`, which serves as the home navigation.

#### Behaviors to test (TDD)

No tests needed — this is a documentation-only change.

#### Implementation notes

- Add a comment above the `links` array:
  ```ts
  // "Home" link intentionally omitted per PRD — the site title
  // ("Smaran Harihar") links to /# and serves as the home nav.
  ```

## Suggested slice order for /to-issues

Create issues in this order so blockers land first:

1. **2.1** — Scroll threshold + glass nav (no blockers)
2. **2.2** — Hamburger aria-expanded + label flip (no blockers)
3. **2.4** — Focus trap + Esc + focus restoration (no blockers)
4. **2.5** — Focus-visible rings (no blockers)
5. **2.7** — Document Home link omission (no blockers)
6. **2.3** — Animated hamburger (blocked by 2.2)
7. **2.6** — Active-section underline (blocked by 2.1)

## Files touched

| File                 | Changes                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| `components/Nav.tsx` | All slices modify this file                                                 |
| `tests/Nav.test.tsx` | New and updated tests for slices 2.1–2.6                                    |
| `app/globals.css`    | No changes expected (Phase 1 already has focus-visible + focus-ring-invert) |

## Verification gate

From QA-PLAN.md:

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` manual walkthrough:
   - Scroll past 30px → glass nav appears with blur + hairline border.
   - Tab through links → focus rings visible (white on hero, dark on scrolled).
   - Mobile hamburger → animated X transition.
   - Mobile menu Esc closes + restores focus to hamburger.
   - Active-section underline updates as you scroll down the page.
3. `git diff` reviewed; conventional-commit subject: `feat(nav): glassy scroll state + a11y polish`.
4. Opens its own PR for review.
