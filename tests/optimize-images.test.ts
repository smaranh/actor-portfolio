import { describe, it, expect } from "vitest";
import { widthsFor } from "../scripts/optimize-images";

describe("widthsFor", () => {
  it("returns narrow widths for headshot images", () => {
    expect(widthsFor("headshot-1.jpg")).toEqual([640, 1024, 1280]);
    expect(widthsFor("headshot-4.jpg")).toEqual([640, 1024, 1280]);
  });

  it("returns medium widths for about image", () => {
    expect(widthsFor("about.jpg")).toEqual([800, 1280, 1920]);
  });

  it("returns default wide widths for hero image", () => {
    expect(widthsFor("hero.jpg")).toEqual([1280, 1920, 2560]);
  });

  it("returns default wide widths for profile-main image", () => {
    expect(widthsFor("profile-main.jpg")).toEqual([1280, 1920, 2560]);
  });

  it("returns default widths for any unknown image", () => {
    expect(widthsFor("unknown.jpg")).toEqual([1280, 1920, 2560]);
  });
});
