# Phase 5 — Reels (`components/ReelsPreview.tsx`)

## Overview

Fix bugs and add polish to the Reels grid + video modal. This is the highest-bug-density section in the QA-PLAN: missing iframe title, missing close button, no body scroll lock, raw `<img>` tags, accessibility gaps on the play button and modal. Also drops fabricated dates (per D7) and pulls forward `youtube-nocookie` and the optional eyebrow.

All work scoped to `components/ReelsPreview.tsx`, `tests/ReelsPreview.test.tsx`, and `next.config.ts` (for the YouTube `images.remotePatterns` entry).

**QA-PLAN IDs addressed:** R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-10, R-11, R-12, P-05, plus G-01 (entrance fade hookup) and **D7** (drop dates from tile data).

## Current state

- `ReelsPreview.tsx` (87 lines, `"use client"`) — `<section id="reels">` with a 4-tile grid (`First Responders Part 1/2`, `Being Charlie`, `Slate Shot LA`).
- Tile data includes `id`, `title`, `date` — **dates are all `4/21/24`** which is fabricated; per D7 we drop the date field entirely.
- Thumbnails use raw `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg">` — not Next.js `<Image>`, no responsive variants, `i.ytimg.com` is not whitelisted in `next.config.ts.images.remotePatterns` yet (R-04).
- Hover effect: thumbnail `group-hover:opacity-80` (R-07 wants `scale-[1.02]` zoom instead).
- Play button: white circle with SVG triangle. SVG has no `aria-hidden`, button has no `aria-label`. No hover ring/scale (R-06, R-10).
- Click → opens modal with iframe at `youtube.com/embed/{id}?autoplay=1`. **No `<title>` on iframe** (R-01). **No visible close button** (R-02). **No body scroll lock** — page behind the modal still scrolls (R-03). Modal has `aria-modal="true"` but no `aria-labelledby`. No focus management — focus stays on the tile (R-11).
- Esc key closes the modal (good — keep this).
- Click-outside closes modal via the backdrop click handler (good — keep this).
- Embed URL is `youtube.com`, not `youtube-nocookie.com` (P-05).
- No "Selected Work" eyebrow above the heading (R-12).
- No entrance fade.

## Slices

### 5.1 — Drop dates from tile data (D7)

**Type:** AFK
**Blocked by:** None
**QA IDs:** D7 (decision in QA-PLAN.md)

#### What to build

Remove the `date` field from the `videos` array and stop rendering the `<p className="text-sm text-gray-500 mt-0.5">{v.date}</p>` line under each title. The QA-PLAN explicitly drops fabricated dates rather than guessing.

#### Behaviors to test (TDD)

1. **No tile renders a date string** — assert `screen.queryByText("4/21/24")` is null. Tightly scope to `#reels` so other sections aren't affected.
2. **Existing tile titles still render** — `screen.getByText("First Responders Part 1")` etc. resolve.

#### ⚠️ Existing tests to update first

Look for any existing assertion in `tests/ReelsPreview.test.tsx` that pins `4/21/24` or any date format. Remove or invert those assertions before this slice ships.

#### Implementation notes

- Update the `videos` array type from `{ id, title, date }` to `{ id, title }`.
- Remove the date `<p>` from the JSX.

---

### 5.2 — Add `title` attribute to iframe (P0 bug)

**Type:** AFK
**Blocked by:** None
**QA IDs:** R-01

#### What to build

The YouTube iframe is missing a `title` — this fails axe-core / WAVE accessibility checks. Add `title={`${activeVideo.title} (YouTube video)`}` so screen reader users understand what the iframe contains.

This requires keeping a reference to the active video object (not just its id), so we can pull the title. Either:

- Find the video in `videos` by `activeId` at render time: `const active = videos.find(v => v.id === activeId);`
- Or change `activeId` state to `activeVideo` storing the whole object.

Default to **find at render time** — it's a 4-element array, the lookup is free, and it keeps the state shape simple.

#### Behaviors to test (TDD)

1. **iframe has a `title` attribute when modal is open** — open the modal (click a tile), query `document.querySelector("iframe")`, assert `iframe.title.length > 0`.
2. **iframe `title` includes the video's title** — assert `iframe.title.includes("First Responders Part 1")` after opening that tile's modal.

#### Implementation notes

- In the modal block, replace `const activeId = …` usage with:
  ```ts
  const activeVideo = activeId ? videos.find((v) => v.id === activeId) : null;
  ```
- Pass `title={`${activeVideo.title} (YouTube video)`}` on the iframe.

---

### 5.3 — Visible × close button on modal

**Type:** AFK
**Blocked by:** 5.2
**QA IDs:** R-02

#### What to build

Add a visible close button (×) in the top-right corner of the modal. The current implementation only closes via Escape or backdrop-click — neither is discoverable, especially on touch where there's no keyboard.

Suggested placement: `absolute top-4 right-4` within the modal dialog (NOT inside the iframe wrapper, so it floats over the dark backdrop, easy to spot).

```tsx
<button
  type="button"
  aria-label="Close video"
  onClick={() => setActiveId(null)}
  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center text-xl"
>
  ×
</button>
```

Use the literal `×` character (U+00D7) or an SVG cross — either works. Keep it as a text character for simplicity.

#### Behaviors to test (TDD)

1. **Close button is rendered when modal is open** — `screen.getByRole("button", { name: /close video/i })` resolves after opening a tile.
2. **Close button is NOT in the DOM when modal is closed** — same query returns null on initial render.
3. **Clicking close button dismisses the modal** — click the close button, then assert the iframe is no longer in the DOM.
4. **Close button has a visible label** — `aria-label="Close video"`.

#### Implementation notes

- Place the button as a direct child of the dialog div (the one with `role="dialog"`), not inside the iframe wrapper, so backdrop-click logic doesn't accidentally treat clicks on the close button as inside-modal clicks. The button's `onClick` handler is the same as backdrop click — it sets `activeId` to null.
- Use `e.stopPropagation()` on the button if needed to prevent double-firing with the backdrop click.

---

### 5.4 — Body scroll lock while modal is open

**Type:** AFK
**Blocked by:** None
**QA IDs:** R-03

#### What to build

When the modal opens, set `document.body.style.overflow = "hidden"` so the underlying page can't be scrolled with the wheel/keyboard/touch. Restore on close.

Implement via a `useEffect` that runs when `activeId` changes:

```tsx
useEffect(() => {
  if (!activeId) return;
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = prev;
  };
}, [activeId]);
```

#### Behaviors to test (TDD)

1. **Body has `overflow: hidden` when modal is open** — open modal, assert `document.body.style.overflow === "hidden"`.
2. **Body overflow is restored when modal closes** — open modal then close, assert `document.body.style.overflow === ""` (or whatever the prev value was).
3. **Cleanup runs on unmount** — render component with modal open, unmount, assert overflow restored.

#### Implementation notes

- The existing Esc-key `useEffect` is separate; don't combine. Two effects with different dependencies is cleaner than one with merged logic.
- JSDOM supports `document.body.style.overflow`, so these tests run cleanly.

---

### 5.5 — Migrate thumbnails to `<Image>` + remotePatterns config

**Type:** AFK
**Blocked by:** None
**QA IDs:** R-04, R-05

#### What to build

Replace the raw `<img>` thumbnail with Next.js `<Image>`. Add `i.ytimg.com` to `next.config.ts.images.remotePatterns`. Try `maxresdefault.jpg` first, fall back to `hqdefault.jpg` on error (R-05). YouTube's `maxresdefault` exists for most videos but 404s on some — handle the failure with an `onError` swap.

`next.config.ts` addition:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "i.ytimg.com" },
  ],
}
```

Component change:

```tsx
const [thumbSrc, setThumbSrc] = useState(
  `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`
);
// …
<Image
  src={thumbSrc}
  alt={v.title}
  fill
  sizes="(max-width: 640px) 100vw, 50vw"
  className="object-cover group-hover:opacity-80 transition-opacity"
  onError={() => setThumbSrc(`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`)}
/>;
```

But this requires per-tile state, which doesn't fit with `videos.map()` rendering inline. Refactor each tile into its own `<ReelTile video={v}>` component (a small file-internal subcomponent) so each tile owns its `thumbSrc` state.

#### Behaviors to test (TDD)

1. **Thumbnails render as Next.js `<Image>` (not raw `<img>`)** — assert the rendered element has the `next/image` mock's marker attribute (e.g., `data-fill="true"`).
2. **Default thumbnail src points at `maxresdefault.jpg`** — assert at least one image src contains `maxresdefault.jpg`.
3. **Image alt is the video title** — assert each thumbnail's alt matches its title.

Testing the fallback path (`onError` → `hqdefault.jpg`) is awkward in JSDOM — there's no real image network request to fail. Skip; rely on manual gate verification.

#### ⚠️ `next/image` mock + remotePatterns

Same mock pattern as Phase 3 slice 3.2. If the test file already inherits a `next/image` mock from `tests/setup.ts`, no test-file changes needed.

`next.config.ts` change is a one-line addition to the `images.remotePatterns` array. Verify no existing config conflicts.

#### Implementation notes

- Extract `ReelTile` as a file-local component at the bottom of `ReelsPreview.tsx` (no separate file unless it grows further).
- Pass `setActiveId` and the video object as props.
- Keep the existing button/play-overlay structure inside the new component.

---

### 5.6 — Polish play button: hover ring + scale-up

**Type:** AFK
**Blocked by:** 5.5
**QA IDs:** R-06, R-07

#### What to build

Two related polish moves:

- **R-06**: On hover of the tile, the play button's white circle scales up (`group-hover:scale-110`) and gains a subtle white ring (`group-hover:ring-2 group-hover:ring-white/40`). Smooth via `transition-all duration-200`.
- **R-07**: The thumbnail itself zooms slightly on hover (`group-hover:scale-[1.02]`). Replace the existing `group-hover:opacity-80` with the scale (or keep both — opacity dimming + scale gives a richer feel).

The existing `group` class on the button parent already exists, so `group-hover:` modifiers will fire correctly.

#### Behaviors to test (TDD)

1. **Play button has hover scale class** — query the play button's white-circle div, assert className matches `/group-hover:scale-/`.
2. **Play button has hover ring class** — className matches `/group-hover:ring-/`.
3. **Thumbnail has hover scale class** — query the thumbnail `<Image>`, assert className matches `/group-hover:scale-/`.
4. **Transitions are present** — `transition-all` or `transition-transform` is on both.

#### Implementation notes

- Keep the play button's base classes (`w-14 h-14 rounded-full bg-white/80 …`).
- Add `transition-all duration-200 group-hover:scale-110 group-hover:bg-white group-hover:ring-2 group-hover:ring-white/40` (replacing the existing `group-hover:bg-white transition-colors`).
- On the `<Image>`, change `group-hover:opacity-80 transition-opacity` to `group-hover:scale-[1.02] transition-transform duration-300`.
- Make sure the thumbnail wrapper (`<div className="relative overflow-hidden aspect-video bg-black">`) keeps `overflow-hidden` so the scale doesn't leak past the tile edges.

---

### 5.7 — Play button + SVG accessibility

**Type:** AFK
**Blocked by:** None
**QA IDs:** R-10

#### What to build

- Add `aria-hidden="true"` to the play SVG (it's decorative; the button has its own label).
- Add `aria-label={`Play ${v.title}`}` to the tile `<button>`.

The button currently uses the title text inside the tile as its accessible name (because the title `<p>` is inside the button), which is functional but verbose. An explicit `aria-label="Play First Responders Part 1"` is clearer for screen readers.

#### Behaviors to test (TDD)

1. **Play SVG has `aria-hidden="true"`** — query the SVG inside any tile button, assert `getAttribute("aria-hidden") === "true"`.
2. **Tile button has descriptive aria-label** — `screen.getByRole("button", { name: /play first responders part 1/i })` resolves.
3. **Tile button aria-label includes the video title** — for each video, the button's accessible name contains the title.

#### Implementation notes

- On `<svg>`: add `aria-hidden="true"` (use `aria-hidden` not `ariaHidden` in JSX).
- On `<button>`: add `aria-label={`Play ${v.title}`}`.
- The `<p>{v.title}</p>` and other text inside the button stay — they're visual labels for sighted users. The aria-label takes precedence for assistive tech.

---

### 5.8 — Modal aria-labelledby + focus management

**Type:** AFK
**Blocked by:** 5.2, 5.3
**QA IDs:** R-11

#### What to build

When the modal opens:

1. Move focus to the close button (added in 5.3).
2. Trap focus within the modal (Tab cycles between close button and… well, the only other focusable element is the iframe, which has its own internal focus management. Practical implementation: trap focus on the close button — pressing Tab keeps focus on close).
3. On close, restore focus to the tile button that opened it.
4. Add `aria-labelledby` pointing to a hidden `<h3>` with the video title (or set `aria-label` directly on the dialog with the title).

`aria-label` on the dialog is simpler than `aria-labelledby` + a hidden heading. Use `aria-label={`${activeVideo.title} video player`}`.

For focus restoration, store a ref to the tile that opened the modal:

```tsx
const lastTileRef = useRef<HTMLButtonElement | null>(null);

const open = (id: string, btn: HTMLButtonElement) => {
  lastTileRef.current = btn;
  setActiveId(id);
};

// On close:
useEffect(() => {
  if (!activeId && lastTileRef.current) {
    lastTileRef.current.focus();
  }
}, [activeId]);

// On open: focus close button
useEffect(() => {
  if (activeId) closeRef.current?.focus();
}, [activeId]);
```

#### Behaviors to test (TDD)

1. **Dialog has `aria-label` containing the video title** — `screen.getByRole("dialog").getAttribute("aria-label")` includes the title.
2. **Focus moves to close button on open** — open modal, assert `document.activeElement` is the close button.
3. **Focus returns to the tile that opened the modal** — focus a specific tile, click to open, close via Esc, assert `document.activeElement` is the original tile button.

#### Implementation notes

- Use a `ref` on the close button (`closeRef`).
- Don't trap focus aggressively — a simple `closeRef.current?.focus()` on open is sufficient for this UI. The iframe handles its own keyboard interaction internally.
- The tile-button ref pattern requires changing the `onClick` from `() => setActiveId(v.id)` to `(e) => open(v.id, e.currentTarget)`.

---

### 5.9 — Switch embed URL to `youtube-nocookie.com`

**Type:** AFK (pulled forward, P3)
**Blocked by:** 5.2
**QA IDs:** P-05

#### What to build

Change the iframe src from `https://www.youtube.com/embed/${id}?autoplay=1` to `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`. This uses YouTube's privacy-enhanced mode, which doesn't set tracking cookies until the user actually plays the video.

#### Behaviors to test (TDD)

1. **iframe src uses `youtube-nocookie.com`** — open modal, assert `iframe.src.startsWith("https://www.youtube-nocookie.com/embed/")`.
2. **iframe src still includes the video id** — `iframe.src.includes(activeId)`.

#### Implementation notes

- Single string change. No config impact.
- Confirm the embed still autoplays on `nocookie` — it does, behavior is identical.

---

### 5.10 — Optional "Selected Work" eyebrow

**Type:** AFK (pulled forward, P3)
**Blocked by:** None
**QA IDs:** R-12

#### What to build

Above the existing `<h2>Reels</h2>`, add an eyebrow `<p>SELECTED WORK</p>` in small uppercase Inter, similar to the eyebrow added to the hero in Phase 3. Mirrors the typographic pattern used on the live trappedactor.com site.

```tsx
<p className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium text-gray-500 mb-3">
  Selected Work
</p>
<h2 className="font-playfair text-4xl font-semibold text-[#222222] mb-12">
  Reels
</h2>
```

#### Behaviors to test (TDD)

1. **Eyebrow text "Selected Work" is rendered above the heading.**
2. **Eyebrow has uppercase tracking class** — className matches `/uppercase/` and `/tracking-/`.

#### Implementation notes

- Place eyebrow as a sibling immediately before the existing `<h2>`.
- `mb-3` on the eyebrow + existing `mb-12` on h2 = `mb-3` then heading then `mb-12`. Adjust if vertical rhythm reads off.

---

### 5.11 — Entrance fade via `<FadeInOnScroll>`

**Type:** AFK
**Blocked by:** 5.10
**QA IDs:** G-01

#### What to build

Wrap the inner `<div className="max-w-6xl mx-auto">` in `<FadeInOnScroll>`. The grid + heading fade in once as the section scrolls into view.

#### Behaviors to test (TDD)

1. **Inner content is wrapped in `<FadeInOnScroll>`** — assert the marker attribute/class is present on an ancestor of the heading.

---

## Suggested slice order for /to-issues

1. **5.1** — Drop dates (no blockers, trivial)
2. **5.2** — iframe `title` (no blockers; first part of bug-cluster)
3. **5.4** — Body scroll lock (no blockers)
4. **5.7** — SVG/button a11y (no blockers)
5. **5.10** — "Selected Work" eyebrow (no blockers)
6. **5.3** — Close button (blocked by 5.2 — needs `activeVideo`)
7. **5.5** — `<Image>` + remotePatterns (no blockers; touches `next.config.ts`)
8. **5.9** — `youtube-nocookie` (blocked by 5.2)
9. **5.6** — Hover polish (blocked by 5.5)
10. **5.8** — Modal a11y + focus (blocked by 5.2, 5.3)
11. **5.11** — Entrance fade (blocked by 5.10)

## Files touched

| File                          | Changes                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| `components/ReelsPreview.tsx` | All slices modify this file                                   |
| `tests/ReelsPreview.test.tsx` | Major: drop date assertions, add modal/a11y/scroll-lock tests |
| `next.config.ts`              | Add `i.ytimg.com` to `images.remotePatterns` (slice 5.5)      |
| `tests/setup.ts`              | Possibly extended if `next/image` mock isn't already shared   |

## Verification gate

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` walkthrough:
   - Click each tile → modal opens, video autoplays.
   - Close button visible top-right; clicking closes modal.
   - Page behind modal does NOT scroll while modal is open.
   - Esc closes modal; backdrop click closes modal.
   - After close, focus returns to the tile that was opened.
   - axe-core (or DevTools "Issues" tab) shows no a11y violations on the modal.
   - Thumbnails are crisp (maxresdefault) on most videos; one fallback to hqdefault if any 404s.
   - Hover a tile → thumbnail subtly zooms, play circle scales up + gets a soft white ring.
   - Embed URL in DevTools network tab is `youtube-nocookie.com`.
   - "Selected Work" eyebrow visible above "Reels" heading.
   - Section fades in on scroll.
3. `git diff` reviewed; conventional-commit subjects per slice.
4. Each slice opens its own PR.
