# PRD: trappedactor.com — Next.js Rebuild

## Overview
Clone of existing Squarespace actor portfolio at trappedactor.com.  
Stack: Next.js (App Router), Tailwind CSS, self-hosted assets.  
Domain: trappedactor.com (user owns it; point DNS to new host after deploy).

---

## Phase 1 Scope (Current Build)
Single-page site (`/`) with anchor-linked sections.  
All content on one page. No sub-routes yet.

## Phase 2 Scope (Future — Do Not Build Now)
- `/reels` — dedicated reels/video gallery page
- `/headshots` — dedicated headshots gallery page

---

## Project Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout: font imports, metadata
│   ├── page.tsx            # Single page, all sections
│   └── globals.css
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── ReelsPreview.tsx
│   ├── Headshots.tsx
│   ├── Stats.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── public/
│   └── images/             # Self-hosted copies of all photos
└── next.config.js
```

---

## Assets to Self-Host
Download and place in `/public/images/` before building.

| File name              | Source URL |
|------------------------|------------|
| hero.jpg               | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1670435596942-JNV1M290D246M9SZSAYV/Image+11+Print.jpg |
| about.jpg              | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1559341201908-4FUMQKA1QG8NW5TMLUMN/Image%252B2%252BPrint.jpg |
| headshot-1.jpg         | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1691966669484-Y7QCS8GQVQ3ZZ01KAJ5R/image-asset.jpeg |
| headshot-2.jpg         | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1691966610937-1SA0CW26HVQSCVE0QTXW/image-asset.jpeg |
| headshot-3.jpg         | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1686492234088-6W7QTK21VC0IICFJOK5H/image-asset.jpeg |
| headshot-4.jpg         | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1691966761562-AT13RJ35SNMT98OJ4PA0/image-asset.jpeg |
| profile-main.jpg       | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1670432975154-YR5UQV2X2XNRSQ94GB00/001-AMP-Smaran-Harihar-20220715.jpg |
| reels-banner.jpg       | https://images.squarespace-cdn.com/content/v1/5cf19d3e31c9460001982b06/1713732340042-BP6S3PMJD91M8IZ8RKF0/image-asset.jpeg |

---

## Metadata (layout.tsx)
```ts
title: "Smaran Harihar"
description: "Actor, Software Engineer, and Dad."
```

---

## Navigation (`Nav.tsx`)
- Fixed top bar, full width
- Left: site name "Smaran Harihar" (links to `/#`)
- Right: anchor links → About Me (`/#about`), Reels (`/#reels`), Headshots (`/#headshots`), Contact (`/#contact`)
- Scroll behavior: transparent when at top of page → white background with subtle shadow on scroll
- Mobile: full-screen overlay with large centered links (hamburger toggle)

---

## Sections

### 1. Hero (`/#hero`)
- Full-viewport-height section
- Background: `hero.jpg` (full bleed, object-cover)
- Text position: bottom-left aligned
- Text color: white with subtle text-shadow
  ```
  Hey there, I'm Smaran Harihar.
  I'm an Actor, Software Engineer and a Dad.
  ```
- No CTA button

---

### 2. About Me (`/#about`)
Two-column layout (image left, text right). Stacks to single column on mobile.

**Image**: `about.jpg`

**Text**:
```
I am an immigrant to the USA.

Opportunities are all around and so are obstacles. Always try to make
the most of what you got and hope for the Best. That is my life's motto.

Much love,
S
```
Note: "Much love," in italic, "S" styled large/decorative.

---

### 3. Reels Preview (`/#reels`)
- Section heading: "Reels"
- 2×2 grid of YouTube video thumbnails (click to play inline or open YouTube)
- Each tile: thumbnail image + title + date

| Title                | YouTube ID        | Date    |
|----------------------|-------------------|---------|
| First Responders Part 1 | utchWkrauZg   | 4/21/24 |
| First Responders Part 2 | Kg4OPd4saVE   | 4/21/24 |
| Being Charlie        | p_ZpjegmmJc       | 4/21/24 |
| Slate Shot LA        | ol3Y_YYAjcw       | 4/21/24 |

Thumbnail URLs follow pattern: `https://i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg`

On click: open a modal/lightbox with embedded YouTube iframe (`https://www.youtube.com/embed/{VIDEO_ID}?autoplay=1`). Click outside modal or press Escape to close. Stop video on close.
(Phase 2: move this to `/reels` page with full embed player.)

---

### 4. Headshots (`/#headshots`)
- Section heading: "Headshots"
- Slideshow/carousel of 4 images: headshot-1.jpg through headshot-4.jpg
- Manual prev/next arrows only — no auto-advance
- Full-width or large centered display

---

### 5. Stats Block
Simple horizontal stat strip (or 2-col grid on mobile):

| Label       | Value   |
|-------------|---------|
| Height      | 6' 0"   |
| Weight      | 185 lbs |
| Hair Color  | Black   |
| Eye Color   | Brown   |

---

### 6. Contact (`/#contact`)
- Heading: "For all bookings contact Smaran Harihar"
- Email: trappedactor@gmail.com (mailto link only — form is Phase 2)

---

## Footer
- Email: trappedactor@gmail.com
- Social links (icon or text):

| Label     | URL |
|-----------|-----|
| imdb      | https://imdb.me/trappedactor |
| youtube   | https://www.youtube.com/channel/UCCqH55zEv5Gup6OI3Z1BtpQ |
| facebook  | https://www.facebook.com/trappedactor/ |
| instagram | https://www.instagram.com/trappedactor/ |
| twitter   | https://twitter.com/TrappedActor |

- No "Powered by Squarespace" line

---

## Styling Notes
- Design fidelity: faithful-but-better — same structure and content, improved polish
- Color palette (extracted from live site):
  - Background: `#FFFFFF`
  - Primary text: `#222222`
  - Icon/link on dark backgrounds: `#FFFFFF`
  - No accent color — pure monochrome
- Typography: Playfair Display (headings) + Inter (body) via Google Fonts
- No dark mode required
- Responsive: mobile-first

---

## Deployment
- Host: GitHub Pages
- GitHub repo: `smaranh/actor-portfolio`
- Requires static export: set `output: 'export'` in `next.config.js`
- `basePath: '/actor-portfolio'` and `assetPrefix: '/actor-portfolio'` required until custom domain is live (repo is not at root)
- Remove `basePath` and `assetPrefix` once `trappedactor.com` DNS is confirmed live
- Deploy via GitHub Actions (`.github/workflows/deploy.yml`) using `actions/deploy-pages`
- Custom domain: add `CNAME` file to `/public/` containing `trappedactor.com`
- In GitHub repo Settings → Pages → set custom domain to `trappedactor.com`
- Cancel Squarespace only after GitHub Pages custom domain is confirmed live (~24–48hrs DNS propagation)

### next.config.js
```js
const nextConfig = {
  output: 'export',
  basePath: '/actor-portfolio',      // remove after custom domain is live
  assetPrefix: '/actor-portfolio',   // remove after custom domain is live
  images: { unoptimized: true },     // required for static export
}
```

### GitHub Actions deploy workflow
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out/
      - uses: actions/deploy-pages@v4
```

---

## Out of Scope (Phase 1)
- `/reels` dedicated page
- `/headshots` dedicated page
- CMS / content management
- Analytics
- Any e-commerce (Squarespace cart not used)
