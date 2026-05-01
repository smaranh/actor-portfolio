import { describe, it, expect } from "vitest";
import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "../components/Hero";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe("Hero", () => {
  it("renders a section with id hero", () => {
    render(<Hero />);
    expect(document.querySelector("#hero")).toBeInTheDocument();
  });

  it("renders the heading text content", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Hey there, I’m Smaran Harihar.");
  });

  it("splits the heading into italic and bold spans", () => {
    render(<Hero />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const spans = h1.querySelectorAll("span");
    expect(spans).toHaveLength(2);
    expect(spans[0].className).toMatch(/italic/);
    expect(spans[0].className).toMatch(/font-normal/);
    expect(spans[0]).toHaveTextContent("Hey there, I’m");
    expect(spans[1].className).toMatch(/font-bold/);
    expect(spans[1]).toHaveTextContent("Smaran Harihar.");
  });

  it("renders the eyebrow", () => {
    render(<Hero />);
    const eyebrow = screen.getByText("WELCOME");
    expect(eyebrow.className).toMatch(/uppercase/);
    expect(eyebrow.className).toMatch(/tracking-\[0\.2em\]/);
  });

  it("renders the subheading", () => {
    render(<Hero />);
    expect(
      screen.getByText("I’m an Actor, Software Engineer and a Dad.")
    ).toBeInTheDocument();
  });

  it("uses Next Image with hero.jpg", () => {
    render(<Hero />);
    const img = document.querySelector("#hero img") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src + (img.srcset ?? "")).toContain("hero.jpg");
    expect(img.dataset.fill).toBe("true");
    expect(img.dataset.priority).toBe("true");
    expect(img.alt).toBe("");

    const section = document.querySelector("#hero") as HTMLElement;
    expect(section.className).toMatch(/overflow-hidden/);
  });

  it("positions text at the bottom-left", () => {
    render(<Hero />);
    const textContainer = screen.getByRole("heading", {
      level: 1,
    }).parentElement;
    expect(textContainer?.className).toMatch(/bottom/);
    expect(textContainer?.className).toMatch(/left/);
  });

  it("uses min-h-[100svh] and w-full for layout", () => {
    render(<Hero />);
    const section = document.querySelector("#hero") as HTMLElement;
    expect(section.className).toMatch(/min-h-\[100svh\]/);
    expect(section.className).not.toMatch(/\bh-screen\b/);
    expect(section.className).toMatch(/w-full/);
  });
});
