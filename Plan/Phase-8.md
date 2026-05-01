# Phase 8 — Contact (`components/Contact.tsx`)

## Overview

Light polish on the contact section. Per **D5**, the real form (Formspree/Web3Forms) is deferred to **F-1 (Future)** — this phase is mailto-only. Add a copy-to-clipboard button beside the email, polish the underline/CTA treatment, and optionally add a "Based in [city]" subtext if the user provides one. Hook in the entrance fade.

All work scoped to `components/Contact.tsx` and `tests/ContactFooter.test.tsx` (the existing test file covers both Contact and Footer; split if it gets unwieldy, but keep as-is by default).

**QA-PLAN IDs addressed:** C-01 (small variant — copy button + optional location), C-02, plus G-01 (entrance fade hookup).
**Out of scope (per D5, future F-1):** C-03 (real form). Per D9: C-04 (representation block) skipped — no agent to credit.

## Current state

- `Contact.tsx` (17 lines, server component) — `<section id="contact">` with heading "For all bookings contact Smaran Harihar" and a single mailto link to `trappedactor@gmail.com`.
- Mailto link uses `underline underline-offset-4 hover:opacity-60 transition-opacity` — functional but not animated; no button-like emphasis (C-02).
- No copy-to-clipboard mechanism (C-01).
- No location subtext (e.g., "Based in Atlanta, GA") (C-01).
- No entrance fade.

## Slices

### 8.1 — Animated underline OR button-style CTA

**Type:** AFK (with explicit user choice in PR description)
**Blocked by:** None
**QA IDs:** C-02

#### What to build

Pick one of two treatments — the current static underline is functional but flat:

**Option A — Animated underline (sweep on hover):**

Use a CSS gradient-background trick to draw an underline that grows from left → right on hover.

```tsx
<a
  href="mailto:trappedactor@gmail.com"
  className="text-lg text-[#222222] relative bg-[length:0%_1px] bg-no-repeat bg-bottom hover:bg-[length:100%_1px] transition-all duration-300"
  style={{ backgroundImage: "linear-gradient(currentColor, currentColor)" }}
>
  trappedactor@gmail.com
</a>
```

**Option B — Button-style CTA:**

Wrap the mailto in a bordered button block with hover invert.

```tsx
<a
  href="mailto:trappedactor@gmail.com"
  className="inline-block text-lg text-[#222222] border border-[#222222] px-8 py-3 hover:bg-[#222222] hover:text-white transition-colors"
>
  trappedactor@gmail.com
</a>
```

Default to **Option A** (animated underline) — feels editorial, matches the rest of the site's typographic restraint. Flag Option B as alternative in PR description.

#### Behaviors to test (TDD) — Option A

1. **Mailto link uses animated underline classes** — link's className contains `bg-[length:0%_1px]` and `hover:bg-[length:100%_1px]` (or the equivalent if implementation uses a different selector strategy).
2. **Mailto link still has correct href** — `screen.getByRole("link", { name: /trappedactor@gmail\.com/ }).getAttribute("href") === "mailto:trappedactor@gmail.com"`.

#### ⚠️ Existing test to update first

`tests/ContactFooter.test.tsx` likely asserts `underline` is in the link's className. After this slice, `underline` is gone (replaced by the gradient-background trick). Update or remove that assertion.

#### Implementation notes

- Confirm the gradient-background approach renders as expected at the current text color (`#222222`). Use `currentColor` so the underline matches the text.
- Don't combine with an underline utility class — they'll fight each other.

---

### 8.2 — Copy-to-clipboard button beside the email

**Type:** AFK
**Blocked by:** 8.1
**QA IDs:** C-01 (small variant)

#### What to build

Add a small "Copy" button beside the mailto link. On click, copies `trappedactor@gmail.com` to the clipboard via `navigator.clipboard.writeText`. Show a transient "Copied" confirmation for ~2 seconds.

```tsx
"use client"; // needs to be added at top of file

import { useState } from "react";

const [copied, setCopied] = useState(false);

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText("trappedactor@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    // graceful no-op if clipboard API unavailable (e.g., insecure context)
  }
};

<div className="flex flex-col items-center gap-3">
  <a href="mailto:trappedactor@gmail.com" className="…">
    trappedactor@gmail.com
  </a>
  <button
    type="button"
    onClick={copyEmail}
    className="text-xs uppercase tracking-widest text-gray-500 hover:text-[#222222] transition-colors"
    aria-live="polite"
  >
    {copied ? "Copied ✓" : "Copy email"}
  </button>
</div>;
```

Adding `"use client"` to `Contact.tsx` is necessary because of the state + clipboard API.

#### Behaviors to test (TDD)

1. **Copy button is rendered with label "Copy email"** — `screen.getByRole("button", { name: /copy email/i })` resolves.
2. **Clicking the button calls `navigator.clipboard.writeText` with the email** — mock `navigator.clipboard.writeText` and assert it was called with `"trappedactor@gmail.com"`.
3. **Button label flips to "Copied" after click** — click the button, assert `screen.getByRole("button", { name: /copied/i })`.
4. **Button label resets after timeout** — use `vi.useFakeTimers()`, click, advance timers by 2000ms, assert label is back to "Copy email".

#### ⚠️ Test mock required

The clipboard API needs to be stubbed in the test:

```ts
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});
```

Or use `vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn() } })`. Choose the form consistent with `tests/setup.ts`.

#### Implementation notes

- Add `"use client"` at the very top of `Contact.tsx`.
- Don't gate the copy button on `navigator.clipboard` availability at render time — render it always, fail silently in the catch. Most modern browsers support it; the catch handles legacy/insecure contexts.

---

### 8.3 — Optional "Based in [city]" subtext

**Type:** HITL (requires user input — actual city)
**Blocked by:** None
**QA IDs:** C-01

#### What to build

Add a small subtext line below the heading: `Based in {city}`. The QA-PLAN explicitly notes "if user provides" — so this is conditional on the user supplying a city. Don't fabricate.

If the user provides a city (let's call it `Atlanta, GA`), add:

```tsx
<p className="text-sm text-gray-500 mb-6">Based in Atlanta, GA</p>
```

Place between the heading and the email link.

If the user opts not to share a city, skip this slice entirely. Document in the slice's GitHub issue: **HITL — needs user input on city OR explicit "skip"**.

#### Behaviors to test (TDD) — only if user provides a city

1. **Subtext is rendered with "Based in" prefix** — `screen.getByText(/based in/i)`.
2. **Subtext renders between heading and link** — assert the DOM order.

#### Implementation notes

- If skipped, mark the issue as closed-as-skipped with a comment referencing this plan.

---

### 8.4 — Entrance fade via `<FadeInOnScroll>`

**Type:** AFK
**Blocked by:** 8.1, 8.2
**QA IDs:** G-01

#### What to build

Wrap the inner `<div className="max-w-2xl mx-auto">` in `<FadeInOnScroll>`. Same pattern as previous phases.

#### Behaviors to test (TDD)

1. **Section content is wrapped in `<FadeInOnScroll>`** — assert the marker attribute is present on an ancestor of the heading.

---

## Suggested slice order for /to-issues

1. **8.1** — Animated underline (no blockers)
2. **8.3** — Location subtext (HITL — open issue, ping user; can ship anytime once city is provided)
3. **8.2** — Copy-to-clipboard (blocked by 8.1)
4. **8.4** — Entrance fade (blocked by 8.1, 8.2)

## Files touched

| File                           | Changes                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `components/Contact.tsx`       | All slices modify this file (and add `"use client"` in 8.2) |
| `tests/ContactFooter.test.tsx` | New tests for copy button + animated underline              |
| `tests/setup.ts`               | Possibly extended with `navigator.clipboard` mock           |

## Verification gate

1. `npm run lint && npm run typecheck && npm run test` all pass.
2. `npm run dev` walkthrough:
   - Hover the email link → animated underline sweeps in left-to-right (or button hover invert if Option B chosen).
   - Click "Copy email" → email is in the clipboard (paste into another field to verify); button label flips to "Copied ✓" then back after 2s.
   - VoiceOver/NVDA announces "Copied" via `aria-live`.
   - "Based in [city]" subtext visible above the email link (if user supplied).
   - Section fades in on scroll.
3. `git diff` reviewed; conventional-commit subjects per slice (`feat(contact): animated underline on mailto`, `feat(contact): copy-to-clipboard button`).
4. Each slice opens its own PR.
