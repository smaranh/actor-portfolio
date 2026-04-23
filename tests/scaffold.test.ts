import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const root = join(__dirname, "..");

describe("public assets", () => {
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

describe("layout.tsx fonts", () => {
  it("imports Playfair Display", () => {
    const layout = readFileSync(join(root, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("Playfair_Display");
  });

  it("imports Inter", () => {
    const layout = readFileSync(join(root, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("Inter");
  });
});
