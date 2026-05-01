import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import About from "../components/About";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any) => (
      <div
        className={className}
        data-initial={JSON.stringify(initial)}
        data-whileinview={JSON.stringify(whileInView)}
        data-viewport={JSON.stringify(viewport)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: vi.fn(() => false),
}));

describe("About", () => {
  it("renders a section with id about", () => {
    render(<About />);
    expect(document.querySelector("#about")).toBeInTheDocument();
  });

  it("renders a visually-hidden h2 About as the first child of the section", () => {
    render(<About />);
    const section = document.querySelector("#about") as HTMLElement;
    const firstChild = section.firstElementChild as HTMLElement;
    expect(firstChild.tagName).toBe("H2");
    expect(firstChild).toHaveTextContent("About");
    expect(firstChild.className).toMatch(/sr-only/);
  });

  it("renders the about image with descriptive alt text", () => {
    render(<About />);
    const img = screen.getByAltText(/Smaran/);
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("about.jpg");
    const alt = img.getAttribute("alt") ?? "";
    expect(alt.length).toBeGreaterThan(20);
  });

  it("portrait wrapper has shadow, warm border, and preserved aspect ratio", () => {
    render(<About />);
    const img = screen.getByAltText(/Smaran/);
    const wrapper = img.parentElement as HTMLElement;
    expect(wrapper.className).toMatch(/shadow-/);
    expect(wrapper.className).toMatch(/ring-1|border\b/);
    expect(wrapper.className).toMatch(/ring-\[#e8e0d4\]|border-\[#e8e0d4\]/);
    expect(wrapper.className).toMatch(/aspect-\[3\/4\]/);
  });

  it("renders the first bio paragraph", () => {
    render(<About />);
    expect(
      screen.getByText("I am an immigrant to the USA.")
    ).toBeInTheDocument();
  });

  it("renders the second bio paragraph", () => {
    render(<About />);
    expect(
      screen.getByText(/Opportunities are all around/)
    ).toBeInTheDocument();
  });

  it("constrains body paragraphs by max-w-prose, but not the signature block", () => {
    render(<About />);
    const firstPara = screen.getByText("I am an immigrant to the USA.");
    let node: HTMLElement | null = firstPara.parentElement;
    let foundProseAncestor = false;
    while (node) {
      if (/max-w-prose/.test(node.className)) {
        foundProseAncestor = true;
        break;
      }
      node = node.parentElement;
    }
    expect(foundProseAncestor).toBe(true);

    const muchLove = screen.getByText("Much love,");
    let signatureNode: HTMLElement | null = muchLove.parentElement;
    let signatureInsideProse = false;
    while (signatureNode) {
      if (/max-w-prose/.test(signatureNode.className)) {
        signatureInsideProse = true;
        break;
      }
      signatureNode = signatureNode.parentElement;
    }
    expect(signatureInsideProse).toBe(false);
  });

  it("renders Much love in italic", () => {
    render(<About />);
    const muchLove = screen.getByText("Much love,");
    expect(muchLove.tagName).toBe("EM");
  });

  it("renders Much love and S inline within a shared parent", () => {
    render(<About />);
    const muchLove = screen.getByText("Much love,");
    const s = screen.getByText("S");
    const sharedParent = muchLove.closest("p");
    expect(sharedParent).not.toBeNull();
    expect(sharedParent?.contains(s)).toBe(true);
  });

  it("renders the decorative S as Playfair italic and not as a text-7xl block", () => {
    render(<About />);
    const s = screen.getByText("S");
    expect(s.className).toMatch(/font-playfair/);
    expect(s.className).toMatch(/italic/);
    expect(s.className).not.toMatch(/text-7xl/);
    expect(s.className).not.toMatch(/\bmt-1\b/);
  });

  it("has a two-column layout class", () => {
    render(<About />);
    const section = document.querySelector("#about");
    const grid = section?.querySelector(".md\\:grid-cols-2");
    expect(grid).toBeInTheDocument();
  });

  it("wraps the inner grid in FadeInOnScroll, but not the section itself", () => {
    render(<About />);
    const section = document.querySelector("#about") as HTMLElement;
    const heading = screen.getByRole("heading", { level: 2 });
    const img = screen.getByAltText(/Smaran/);

    const headingFadeAncestor = heading.closest("div[data-whileinview]");
    const imgFadeAncestor = img.closest("div[data-whileinview]");

    expect(headingFadeAncestor || imgFadeAncestor).not.toBeNull();
    const fade = (imgFadeAncestor ?? headingFadeAncestor) as HTMLElement;
    expect(fade.getAttribute("data-whileinview")).toContain('"opacity":1');

    expect(section.getAttribute("data-whileinview")).toBeNull();
  });

  it("Inter font config in app/layout.tsx includes italic style for Much love", () => {
    const layoutSource = readFileSync(
      join(process.cwd(), "app", "layout.tsx"),
      "utf8"
    );
    const interBlockMatch = layoutSource.match(/Inter\(\{[\s\S]*?\}\)/);
    expect(interBlockMatch).not.toBeNull();
    const interBlock = interBlockMatch?.[0] ?? "";
    expect(interBlock).toMatch(/style:\s*\[[^\]]*["']italic["'][^\]]*\]/);
  });
});
