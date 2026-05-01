# Phase 10 — Perf, Deploy, Tests

## Overview

The infrastructure phase. Wires up build-time image optimization (extending Phase 3.8), env-gates the `basePath`, restores deploy plumbing (CNAME, robots.txt, sitemap, GitHub Actions workflow), broadens test coverage with interaction + Playwright + axe-core, sets up Lighthouse CI, and optionally adds analytics.

This phase has no UI changes. Everything ships as new files, config tweaks, or CI workflow additions.

**QA-PLAN IDs addressed:** P-02, D-01, D-02, D-03, D-04, T-01, T-02, T-03, T-04, G-13.

## Current state

- **Image optimization:** Phase 3.8 created `scripts/optimize-images.ts` and a `prebuild` hook for hero. P-02 extends this to all images (headshots, about, profile-main).
- **`basePath`:** `next.config.ts` likely sets `basePath` based on `NODE_ENV === "production"` (or similar). D-01 wants this gated on a dedicated `USE_BASE_PATH=true` env var so local prod builds don't pick up the GitHub Pages basePath unless intended.
- **`public/CNAME`:** May or may not exist. If present, contents must be `trappedactor.com` (the production domain).
- **`robots.txt`:** Not present. D-03 wants a basic one allowing all crawlers.
- **`app/sitemap.ts`:** Not present. D-03 wants a programmatic sitemap.
- **`.github/workflows/deploy.yml`:** Not present (or stale). D-04 wants the per-PRD workflow.
- **Tests:** Component-level Vitest tests exist (Nav, Hero, About, Stats, Headshots, Reels, Contact, Footer, SkipLink, FadeInOnScroll, NotFound). **No interaction tests** for the modal scroll-lock + focus-restore flows, the carousel keyboard nav, the nav scroll/hamburger Esc flows. **No Playwright suite** at the page level. **No axe-core** integration. **No Lighthouse CI.**
  - Note: a Playwright scaffold landed in commit `84a78b6` (`feat: add /e2e skill and Playwright scaffolding`) and a baseline batch in `8ce438c`. Verify what's already in place before adding more.
- **Analytics:** Not present. G-13 is opt-in.

## Slices

### 10.1 — Build-time image optimization (extend Phase 3.8 to all images)

**Type:** AFK
**Blocked by:** Phase 3.8 must have shipped (`scripts/optimize-images.ts` exists)
**QA IDs:** P-02

#### What to build

Phase 3.8 created the optimize-images script for hero. This slice generalizes it to handle every image in `public/images/` (about.jpg, headshot-1..4.jpg, profile-main.jpg). The script as drafted in Phase 3.8 already iterates `readdir(SRC)`, so this slice is mostly verification + emitting the missing variants.

If Phase 3.8 was scoped narrowly (hero only), expand it now. Wire the same `WIDTHS = [1280, 1920, 2560]` and `FORMATS = ["avif", "webp"]` over all input images. For headshots and the about portrait — which are smaller (10–25KB JPEGs) — narrower widths suffice (e.g., `[640, 1024, 1280]`).

```ts
// scripts/optimize-images.ts
const VARIANT_RULES: Record<string, number[]> = {
  default: [1280, 1920, 2560],
  "headshot-": [640, 1024, 1280],
  about: [800, 1280, 1920],
};

function widthsFor(filename: string): number[] {
  for (const [prefix, widths] of Object.entries(VARIANT_RULES)) {
    if (prefix !== "default" && filename.startsWith(prefix)) return widths;
  }
  return VARIANT_RULES.default;
}
```

Components that consume these images should pass the `sizes` prop matching the displayed dimensions so Next picks the right variant.

#### Behaviors to test (TDD)

Build-time script. Verify operationally:

1. `npm run optimize-images` produces AVIF + WebP variants for every image in `public/images/`.
2. Each variant is smaller than the source.
3. `next build && npx serve out` previews the static export and the network tab shows AVIF variants being served (or whichever is the smallest format the browser supports).

#### Implementation notes

- Generated variants should be committed (deterministic static builds).
- Add `.gitattributes` rules for the image variants if the diff noise becomes a problem (mark them as `binary` and `merge=ours` so git doesn't try to diff them).
- Consider running the script as a CI step before deploy if the dev decides not to commit the variants — flag in PR.

---

### 10.2 — Env-gated `basePath`

**Type:** AFK
**Blocked by:** None
**QA IDs:** D-01

#### What to build

Find the current `basePath` logic in `next.config.ts` and switch the gate from `NODE_ENV === "production"` (or whatever's there) to `process.env.USE_BASE_PATH === "true"`.

```ts
// next.config.ts
const useBasePath = process.env.USE_BASE_PATH === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: useBasePath ? "/actor-portfolio" : "",
  assetPrefix: useBasePath ? "/actor-portfolio" : "",
  // …
};
```

Update `.github/workflows/deploy.yml` (slice 10.5) to set `USE_BASE_PATH=true` only when deploying to GitHub Pages. Local prod builds (`npm run build`) without that env stay at `basePath: ""`.

If the site deploys to a custom domain (`trappedactor.com` per CNAME), `basePath` should always be `""` in production — the GitHub Pages subpath is only needed when serving from `username.github.io/actor-portfolio/`. **Confirm with user**: if the production target is the custom domain only, `useBasePath` may always be `false` and this slice becomes "remove the basePath gate entirely." Open the issue with a HITL flag.

#### Behaviors to test (TDD)

`next.config.ts` changes — no runtime tests. Verify:

1. `npm run build` (no env set) → `out/` HTML contains `src="/images/…"` paths.
2. `USE_BASE_PATH=true npm run build` → `out/` HTML contains `src="/actor-portfolio/images/…"` paths.

#### Implementation notes

- Audit any `process.env.NEXT_PUBLIC_BASE_PATH` consumers in components — those should already work since they read the env var directly.
- If the user confirms custom-domain-only, simplify by deleting the basePath logic entirely and remove `NEXT_PUBLIC_BASE_PATH` from all `<Image>` src concatenations.

---

### 10.3 — Verify `public/CNAME`

**Type:** AFK
**Blocked by:** None
**QA IDs:** D-02

#### What to build

If `public/CNAME` exists, confirm its contents are `trappedactor.com` (no trailing newline issues, no protocol prefix, no path). If absent, create it with that content.

```
trappedactor.com
```

The CNAME file is what tells GitHub Pages which custom domain to serve from.

#### Behaviors to test (TDD)

No runtime tests. Verify:

1. `cat public/CNAME` outputs `trappedactor.com`.
2. After `npm run build`, `out/CNAME` is present (Next copies `public/` into `out/` for static exports).

#### Implementation notes

- If the user is deploying somewhere other than the apex `trappedactor.com`, update accordingly.
- Open as HITL initially to confirm the production domain.

---

### 10.4 — `robots.txt` + `app/sitemap.ts`

**Type:** AFK
**Blocked by:** Phase 1 metadata (slice 1.4 — for `metadataBase`)
**QA IDs:** D-03

#### What to build

**`public/robots.txt`:**

```
User-agent: *
Allow: /

Sitemap: https://trappedactor.com/sitemap.xml
```

**`app/sitemap.ts`** (Next.js 13+ programmatic sitemap):

```ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://trappedactor.com";
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

The single-page app has only one URL. If anchors get treated as separate sitemap entries (they shouldn't — sitemap is for pages, not sections), keep the array single-entry.

#### Behaviors to test (TDD)

1. `npm run build` → `out/robots.txt` and `out/sitemap.xml` are generated.
2. `out/sitemap.xml` contains `<loc>https://trappedactor.com</loc>`.

(Test by reading the generated files in a small `scripts/verify-build.ts` or just manually in the gate.)

#### Implementation notes

- `MetadataRoute.Sitemap` requires `next` types — already a dep.
- For static exports, Next 16 emits `out/sitemap.xml` automatically when `app/sitemap.ts` exists.

---

### 10.5 — `.github/workflows/deploy.yml`

**Type:** AFK
**Blocked by:** 10.1, 10.2, 10.3, 10.4
**QA IDs:** D-04

#### What to build

GitHub Actions workflow that:

1. Triggers on `push` to `main`.
2. Installs Node + dependencies.
3. Runs `npm run lint && npm run typecheck && npm run test`.
4. Runs `npm run build` (which includes the prebuild image optimization).
5. Deploys `out/` to GitHub Pages.

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
        env:
          USE_BASE_PATH: "false" # custom domain, no subpath
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Per the PRD — confirm specifics with `Plan/trappedactor-PRD.md` before committing.

#### Behaviors to test (TDD)

No automated tests. Verify operationally:

1. Open a draft PR with the workflow → CI runs and reports green.
2. Merge to `main` → workflow runs → site updates at `https://trappedactor.com`.

#### Implementation notes

- Use `actions/deploy-pages@v4` — the modern artifact-based flow.
- Confirm the GitHub Pages source is set to "GitHub Actions" in the repo settings (not branch deploys).
- If the user prefers a different deploy target (Vercel, Cloudflare Pages), swap the deploy steps.

---

### 10.6 — Interaction tests for Nav / Reels / Headshots

**Type:** AFK
**Blocked by:** Phases 2, 5, 6 must have shipped (the interactions exist before tests do)
**QA IDs:** T-01

#### What to build

Phases 2 / 5 / 6 each shipped per-slice TDD tests. This slice consolidates the cross-cutting integration tests — the workflows that span multiple slices:

- **Nav:** scroll past 30px → glass nav appears → click hamburger → overlay opens → press Esc → overlay closes → focus returns to hamburger.
- **Reels modal:** click tile → modal opens with focus on close → body scroll locked → press Esc → modal closes → focus returns to tile → body scroll restored.
- **Headshots:** focus carousel → press → → image advances → counter announces "Image 2 of 4" → press → repeatedly to wrap → press ← to wrap back.

These are mostly already covered at the slice level (slices 2.4, 5.4, 5.8, 6.4). This slice **audits** for gaps and fills them. Likely a small set of tests (~3–6) that verify the end-to-end story rather than individual hooks.

#### Behaviors to test (TDD)

The audit drives the test list. Run `npm run test` after Phase 6 ships and identify uncovered paths in:

- `tests/Nav.test.tsx`
- `tests/ReelsPreview.test.tsx`
- `tests/Headshots.test.tsx`

Common gaps:

1. **Nav: scroll-back-up after open-and-close-overlay** doesn't restore scroll behavior unexpectedly.
2. **Reels: Esc-then-click-another-tile** opens a fresh modal cleanly (no stale state).
3. **Headshots: rapid arrow presses** don't break the index modulus arithmetic.

#### Implementation notes

- This slice is a deliverable list, not new infrastructure. Treat it as housekeeping.

---

### 10.7 — Playwright + axe-core smoke run

**Type:** AFK
**Blocked by:** All UI phases (1–9)
**QA IDs:** T-02

#### What to build

The Playwright scaffold and baseline batch (`84a78b6`, `8ce438c`) are already in place — this slice verifies the suite covers the post-Phase-9 surface, then adds an axe-core scan to each Playwright test.

```ts
// e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home page has zero a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("reels modal has zero a11y violations", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /play first responders part 1/i })
    .click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");
});
```

Wire `npm run test:e2e` into the deploy workflow (slice 10.5) as a separate job so it runs in CI before deploy.

#### Behaviors to test (TDD)

The axe-core suite IS the test. Add coverage for:

1. Home page initial load.
2. Each major modal/overlay open state (reels modal, mobile nav).
3. After each carousel index change.

#### Implementation notes

- Add `@axe-core/playwright` as a dev dependency.
- Decide whether to run e2e in PR CI (recommended) or only on `main` (faster PRs but riskier).

---

### 10.8 — Lighthouse CI

**Type:** AFK
**Blocked by:** 10.5
**QA IDs:** T-03

#### What to build

Add Lighthouse CI to the deploy workflow. Either `@lhci/cli` (heavyweight, full LHCI server) or `unlighthouse` (lighter). Default to `@lhci/cli` with assertions on the four Lighthouse categories.

```yaml
# Add to .github/workflows/deploy.yml as a separate job
lighthouse:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "20"
    - run: npm ci
    - run: npm run build
      env:
        USE_BASE_PATH: "false"
    - run: npx serve out &
    - run: npx wait-on http://localhost:3000
    - run: npx @lhci/cli@0.13.x autorun --collect.url=http://localhost:3000 --assert.assertions.categories:performance=0.95 --assert.assertions.categories:accessibility=0.95 --assert.assertions.categories:best-practices=0.95 --assert.assertions.categories:seo=0.95
```

Threshold: 95+ across all four categories per QA-PLAN gate. Adjust if the initial run can't hit it — better to ship a passing CI and tighten over time than block on perfection.

#### Behaviors to test (TDD)

The CI check IS the test. PRs fail if any score drops below 95.

#### Implementation notes

- LHCI runs are slow (~2 min per page). Acceptable for one-page sites.
- Cache the Lighthouse binary in CI to speed up.

---

### 10.9 — Optional: lychee link-checker for socials

**Type:** AFK (low priority)
**Blocked by:** 10.5
**QA IDs:** T-04

#### What to build

Add a CI step that runs [`lychee`](https://github.com/lycheeverse/lychee) against the rendered HTML (or against the markdown plan files) to catch broken links — especially the social URLs in the footer.

```yaml
- uses: lycheeverse/lychee-action@v2
  with:
    args: --verbose --no-progress out/index.html public/CNAME
```

Run as a non-blocking warning-only step (`continue-on-error: true`) initially, then promote to blocking once stable.

#### Behaviors to test (TDD)

The action IS the test. Failures show in the PR's check list.

#### Implementation notes

- Skip if it produces too much noise (rate-limited social sites are a common false-positive source).

---

### 10.10 — Analytics (opt-in)

**Type:** HITL (user opts in)
**Blocked by:** Phase 1 layout.tsx must be stable
**QA IDs:** G-13

#### What to build

If the user opts in: add Plausible (privacy-friendly, lightweight) or Vercel Analytics (free if hosted on Vercel; doesn't apply here since deploy is GitHub Pages).

Plausible (default recommendation):

```tsx
// app/layout.tsx, inside <head>
{
  process.env.NEXT_PUBLIC_ANALYTICS === "plausible" && (
    <script
      defer
      data-domain="trappedactor.com"
      src="https://plausible.io/js/script.js"
    />
  );
}
```

Set `NEXT_PUBLIC_ANALYTICS=plausible` in the deploy workflow env. Local dev runs without analytics so the user's own visits aren't counted.

If the user prefers no analytics, close this slice as skipped.

#### Behaviors to test (TDD)

1. With env unset: `<script src="plausible">` is NOT in the rendered HTML.
2. With env set to "plausible": script is present.

#### Implementation notes

- Plausible requires a paid account at plausible.io OR a self-hosted instance. Confirm the user has one or wants to set one up.
- GA4 is the alternative (free, more invasive). Don't default to it.

---

## Suggested slice order for /to-issues

1. **10.2** — Env-gated basePath (HITL — confirm production target)
2. **10.3** — CNAME (HITL — confirm domain)
3. **10.4** — robots.txt + sitemap (no blockers; small)
4. **10.1** — Image optimization extension (blocked by Phase 3.8)
5. **10.5** — Deploy workflow (blocked by 10.1, 10.2, 10.3, 10.4)
6. **10.6** — Interaction-test audit (blocked by Phases 2/5/6)
7. **10.7** — Playwright + axe-core (blocked by Phases 1–9)
8. **10.8** — Lighthouse CI (blocked by 10.5)
9. **10.9** — lychee link-checker (blocked by 10.5; optional)
10. **10.10** — Analytics (HITL — user opts in)

## Files touched

| File                           | Changes                                                 |
| ------------------------------ | ------------------------------------------------------- |
| `scripts/optimize-images.ts`   | Extended in 10.1                                        |
| `next.config.ts`               | Env-gated basePath in 10.2                              |
| `public/CNAME`                 | Confirmed/created in 10.3                               |
| `public/robots.txt`            | New (10.4)                                              |
| `app/sitemap.ts`               | New (10.4)                                              |
| `.github/workflows/deploy.yml` | New (10.5); extended in 10.7, 10.8, 10.9                |
| `e2e/*.spec.ts`                | Extended (10.7)                                         |
| `tests/Nav.test.tsx`, etc.     | Audit + add gaps (10.6)                                 |
| `app/layout.tsx`               | Analytics snippet (10.10)                               |
| `package.json`                 | Add deps: `@axe-core/playwright`, `@lhci/cli` (devDeps) |

## Verification gate

1. All Phase 10 slices land green on a draft PR.
2. `npm run build && npx serve out` previews the static export with optimized images, CNAME, robots.txt, sitemap.xml all present in `out/`.
3. GitHub Actions workflow runs green on the draft PR (build + lighthouse + e2e all pass).
4. Lighthouse CI scores ≥ 95 on all four categories.
5. axe-core e2e suite reports zero violations.
6. `git diff` reviewed; conventional-commit subjects per slice (`ci: add lighthouse + axe-core`, `feat(deploy): env-gated basePath`, `chore: build-time image optimization for all images`).
7. Each slice opens its own PR.
8. **Final**: User reviews and merges the primary PR; site deploys to `trappedactor.com` with full QA-PLAN scope shipped.
