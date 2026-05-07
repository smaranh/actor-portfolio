# phase-2-e2e — Fix 11 failing e2e tests (issue #156)

## Context

After the phase-10 merge, `npm run test:e2e` exits non-zero with 11 of 33 tests failing.
Two root causes are identified in the issue:

1. **4× console errors per page load** — reported as headshot image 404s caused by the
   phase-10 image optimisation changing variant widths (1920/2560 → 640/1024). The smoke
   test's "no console errors" guard catches these, which cascades failures into
   accessibility, headshots, nav, and not-found specs that all load the page.

2. **Hero desktop visual regression** — `phase-2-issues.spec.ts:68` diffs against a stale
   snapshot baseline. Either the snapshot needs to be re-baselined against the current
   (approved) layout, or there is a genuine hero regression to fix.

> **Note:** The `Headshots.tsx` component uses `next/image` with base `headshot-N.jpg` paths
> which still exist on disk. The 404 source most likely comes from a `<picture>`/`srcSet`
> attribute somewhere else, or from `next/image` generating an internal request for a
> variant that no longer exists. The first step of the plan is to run the suite and read
> the exact error messages before touching code.

---

## Slices

### Slice 1 — Diagnose the exact console errors

Run the e2e suite and capture the full output to identify the precise 404 URLs:

```bash
npm run test:e2e -- --reporter=list 2>&1 | tee /tmp/e2e-run.txt
```

Then inspect `/tmp/e2e-run.txt` for the console error strings logged by the smoke test.
The exact URL (e.g. `/images/headshot-1-1920.webp` vs `/_next/image?url=...&w=1920`)
determines whether the fix is in `Headshots.tsx`, `next.config.ts`, or elsewhere.

**Files to check based on output:**

- `components/Headshots.tsx` — change `src` paths if base files moved
- `next.config.ts` — check `images.imageSizes` / `images.deviceSizes` if the runtime
  optimizer is requesting widths that no longer have variants
- Any `<picture>` element using hardcoded variant filenames

### Slice 2 — Fix root cause 1 (image 404s)

**Most likely fix — update `next.config.ts` image size lists to match the generated variants:**

The `optimize-images.ts` script generates headshot variants at widths `640, 1024, 1280`.
If `next/image` is configured (or defaults) to request widths outside that set (e.g. 1920,
2560), the static export will 404 those requests. Add explicit `imageSizes`/`deviceSizes`
so the optimizer only requests widths that exist:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 1024, 1280, 1920, 2560],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};
```

Or, if the issue is that the dev server is requesting widths that have no pre-generated
variant (irrelevant in dev since `next/image` generates on-the-fly), re-examine after
running the suite.

**Fallback fix if the 404 is from a raw `<picture>` tag with hardcoded variant paths:**

- Search all components for `headshot-.*-1920` or `headshot-.*-2560` and update to `-1280`.

**Files:** `next.config.ts` and/or `components/Headshots.tsx`

### Slice 3 — Fix root cause 2 (hero snapshot baseline)

The test at `e2e/specs/phase-2-issues.spec.ts:68` is currently active (not skipped) and
compares against `e2e/specs/phase-2-issues.spec.ts-snapshots/hero-desktop-chromium-darwin.png`.

**Steps:**

1. Visually inspect `public/images/hero.jpg` and the current rendered hero at 1440×900
   in the browser to confirm the layout is correct (face not cropped — `md:object-top`
   is applied in `Hero.tsx:27`).
2. If layout looks correct, update the baseline:
   ```bash
   npx playwright test e2e/specs/phase-2-issues.spec.ts --update-snapshots
   ```
3. Commit the new `hero-desktop-chromium-darwin.png`.
4. If layout looks wrong (face still cropped), that is a regression — fix `Hero.tsx`
   per the instructions in `Plan/Phase-2-coverage.md` before re-baselining.

**File:** `e2e/specs/phase-2-issues.spec.ts-snapshots/hero-desktop-chromium-darwin.png`
(committed binary asset — update via `--update-snapshots`)

### Slice 4 — Confirm all 33 tests pass

```bash
npm run test:e2e
```

All 33 tests green, exit 0, zero console errors captured by the smoke test.

---

## Critical Files

| File                                                                          | Expected change                                                   |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `next.config.ts`                                                              | Likely add `images.deviceSizes` to match generated variant widths |
| `components/Headshots.tsx`                                                    | Change `src` paths only if base `.jpg` files moved (unlikely)     |
| `e2e/specs/phase-2-issues.spec.ts-snapshots/hero-desktop-chromium-darwin.png` | Re-baseline after verifying hero layout                           |

---

## Execution Order

1 (diagnose) → 2 (fix 404s) → 3 (fix snapshot) → 4 (green run)

Diagnosis first — do not touch code until the exact error strings are confirmed.

---

## Verification

- `npm run test:e2e` exits 0, output shows `33 passed`.
- Smoke test "loads with no console or page errors" is green — zero console errors.
- Hero snapshot diff shows 0 changed pixels on a clean re-run after baselining.
