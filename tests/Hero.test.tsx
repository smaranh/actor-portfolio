import { describe, it, expect } from "vitest";
import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useReducedMotion } from "framer-motion";
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

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      animate,
      transition,
      initial,
      whileInView,
      viewport,
      ...props
    }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any) => (
      <div
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        data-initial={JSON.stringify(initial)}
        data-whileinview={JSON.stringify(whileInView)}
        data-viewport={JSON.stringify(viewport)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: vi.fn(() => false),
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
  it("renders a vertical gradient overlay", () => {
    render(<Hero />);
    // The overlay is the first div sibling after the Next Image (which is the first child if not counting style tags Next.js might inject, but let's select by absolute inset-0)
    // Actually, we can just find the div with absolute and inset-0
    const section = document.querySelector("#hero") as HTMLElement;
    // The overlay should be the div that contains the gradient class
    const overlays = section.querySelectorAll("div.absolute.inset-0");
    const overlay = Array.from(overlays).find((el) =>
      el.className.includes("bg-gradient-to-t")
    ) as HTMLElement;

    expect(overlay).toBeInTheDocument();
    expect(overlay.className).not.toMatch(/bg-black\/20\b/);
    expect(overlay.className).toMatch(/bg-gradient-to-t/);
    expect(overlay.className).toMatch(/from-black\/60/);
    expect(overlay.className).toMatch(/via-black\/20/);
    expect(overlay.className).toMatch(/to-transparent/);
  });

  it("wraps image in a motion element with Ken-Burns scale animation", () => {
    // Reset mock to ensure default motion
    vi.mocked(useReducedMotion).mockReturnValue(false);

    render(<Hero />);
    const section = document.querySelector("#hero") as HTMLElement;
    // Find the motion wrapper inside the section
    const motionWrapper = section.querySelector(
      "div[data-animate]"
    ) as HTMLElement;
    expect(motionWrapper).toBeInTheDocument();

    expect(motionWrapper.dataset.animate).toContain('"scale":1.05');
    expect(motionWrapper.dataset.transition).toContain('"duration":20');
  });

  it("skips Ken-Burns zoom if reduced motion is enabled", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);

    render(<Hero />);
    const section = document.querySelector("#hero") as HTMLElement;
    const motionWrapper = section.querySelector(
      "div[data-animate]"
    ) as HTMLElement;

    expect(motionWrapper.dataset.animate).toContain('"scale":1');
    expect(motionWrapper.dataset.transition).toContain('"duration":0');
  });
  it("wraps the text block in FadeInOnScroll", () => {
    render(<Hero />);
    const heading = screen.getByRole("heading", { level: 1 });
    // Find the motion.div from FadeInOnScroll wrapping the heading container
    // We can look for data-whileinview attribute which FadeInOnScroll sets
    const fadeWrapper = heading.closest("div[data-whileinview]");
    expect(fadeWrapper).toBeInTheDocument();
    expect(fadeWrapper?.getAttribute("data-whileinview")).toContain(
      '"opacity":1'
    );
    expect(fadeWrapper?.getAttribute("data-whileinview")).toContain('"y":0');
    // Ensure the positioning class absolute is on the wrapper
    expect(fadeWrapper?.className).toMatch(/absolute/);
    expect(fadeWrapper?.className).toMatch(/bottom-12/);
  });
});
