import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..");

describe("public assets — images", () => {
  const requiredImages = [
    "hero.jpg",
    "about.jpg",
    "headshot-1.jpg",
    "headshot-2.jpg",
    "headshot-3.jpg",
    "headshot-4.jpg",
    "profile-main.jpg",
  ];

  requiredImages.forEach((image) => {
    it(`has ${image} in /public/images/`, () => {
      expect(existsSync(join(root, "public", "images", image))).toBe(true);
    });
  });
});

describe("public assets — favicon stubs (Phase 1.5)", () => {
  const requiredAssets = [
    "favicon.ico",
    "favicon-32.png",
    "apple-touch-icon.png",
    "og-image.png",
    "icon-192.png",
    "icon-512.png",
  ];

  requiredAssets.forEach((asset) => {
    it(`has ${asset} in /public/`, () => {
      expect(existsSync(join(root, "public", asset))).toBe(true);
    });
  });
});

describe("CNAME", () => {
  it("exists in /public/", () => {
    expect(existsSync(join(root, "public", "CNAME"))).toBe(true);
  });

  it("contains trappedactor.com", () => {
    const content = readFileSync(join(root, "public", "CNAME"), "utf-8");
    expect(content.trim()).toBe("trappedactor.com");
  });
});

describe("next.config", () => {
  const config = readFileSync(join(root, "next.config.ts"), "utf-8");

  it("enables static export for production", () => {
    expect(config).toContain('output: "export"');
  });

  it("sets basePath /actor-portfolio for production", () => {
    expect(config).toContain('"/actor-portfolio"');
    expect(config).toContain("basePath");
  });

  it("sets assetPrefix /actor-portfolio for production", () => {
    expect(config).toContain("assetPrefix");
  });

  it("gates export config on production env", () => {
    expect(config).toContain("isProd");
  });

  it("has unoptimized images", () => {
    expect(config).toContain("unoptimized: true");
  });
});

describe("layout.tsx — fonts (Phase 1.3)", () => {
  const layout = readFileSync(join(root, "app", "layout.tsx"), "utf-8");

  it("imports Playfair Display", () => {
    expect(layout).toContain("Playfair_Display");
  });

  it("imports Inter", () => {
    expect(layout).toContain("Inter");
  });

  it("subsets Playfair to weights 600 and 700", () => {
    expect(layout).toContain('"600"');
    expect(layout).toContain('"700"');
  });

  it("subsets Inter to weights 300, 400, and 500", () => {
    expect(layout).toContain('"300"');
    expect(layout).toContain('"400"');
    expect(layout).toContain('"500"');
  });
});

describe("layout.tsx — metadata (Phase 1.4)", () => {
  const layout = readFileSync(join(root, "app", "layout.tsx"), "utf-8");

  it("sets metadataBase to trappedactor.com", () => {
    expect(layout).toContain("trappedactor.com");
    expect(layout).toContain("metadataBase");
  });

  it("includes openGraph block", () => {
    expect(layout).toContain("openGraph");
  });

  it("includes twitter card block", () => {
    expect(layout).toContain("twitter");
    expect(layout).toContain("summary_large_image");
  });

  it("includes themeColor", () => {
    expect(layout).toContain("themeColor");
  });

  it("injects JSON-LD Person schema", () => {
    expect(layout).toContain("application/ld+json");
    expect(layout).toContain('"@type": "Person"');
  });

  it("JSON-LD includes sameAs IMDB link", () => {
    expect(layout).toContain("imdb.com");
  });

  it("JSON-LD includes sameAs Instagram link", () => {
    expect(layout).toContain("instagram.com");
  });
});

describe("layout.tsx — perf hints (Phase 1.1)", () => {
  const layout = readFileSync(join(root, "app", "layout.tsx"), "utf-8");

  it("preconnects to i.ytimg.com", () => {
    expect(layout).toContain("i.ytimg.com");
    expect(layout).toContain("preconnect");
  });

  it("renders SkipLink", () => {
    expect(layout).toContain("SkipLink");
  });
});

describe("globals.css — Phase 1.1 rules", () => {
  const css = readFileSync(join(root, "app", "globals.css"), "utf-8");

  it("sets scroll-behavior: smooth on html", () => {
    expect(css).toContain("scroll-behavior: smooth");
  });

  it("sets scroll-margin-top on [id] elements", () => {
    expect(css).toContain("scroll-margin-top");
    expect(css).toContain("[id]");
  });

  it("includes prefers-reduced-motion guard", () => {
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("animation-duration: 0.01ms");
    expect(css).toContain("transition-duration: 0.01ms");
  });
});

describe("globals.css — Phase 1.2 focus-visible", () => {
  const css = readFileSync(join(root, "app", "globals.css"), "utf-8");

  it("defines :focus-visible outline", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("outline:");
  });

  it("includes .focus-ring-invert variant", () => {
    expect(css).toContain("focus-ring-invert");
  });
});

describe("globals.css — Phase 1.3 typography", () => {
  const css = readFileSync(join(root, "app", "globals.css"), "utf-8");

  it("applies text-wrap: balance to h1 and h2", () => {
    expect(css).toContain("text-wrap: balance");
  });

  it("applies negative letter-spacing to .font-playfair", () => {
    expect(css).toContain("letter-spacing");
    expect(css).toContain(".font-playfair");
  });
});

describe("not-found.tsx exists (Phase 1.6)", () => {
  it("app/not-found.tsx is present", () => {
    expect(existsSync(join(root, "app", "not-found.tsx"))).toBe(true);
  });
});

describe("FadeInOnScroll component exists (Phase 1.7)", () => {
  it("components/FadeInOnScroll.tsx is present", () => {
    expect(existsSync(join(root, "components", "FadeInOnScroll.tsx"))).toBe(
      true
    );
  });

  it("uses framer-motion", () => {
    const src = readFileSync(
      join(root, "components", "FadeInOnScroll.tsx"),
      "utf-8"
    );
    expect(src).toContain("framer-motion");
    expect(src).toContain("useReducedMotion");
  });
});
