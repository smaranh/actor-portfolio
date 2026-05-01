import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("renders the about image", () => {
    render(<About />);
    const img = screen.getByAltText("Smaran Harihar");
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toContain("about.jpg");
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

  it("renders Much love in italic", () => {
    render(<About />);
    const muchLove = screen.getByText("Much love,");
    expect(muchLove.tagName).toBe("EM");
  });

  it("renders the decorative S signature", () => {
    render(<About />);
    expect(screen.getByText("S")).toBeInTheDocument();
    const s = screen.getByText("S");
    expect(s.className).toMatch(/text-/);
  });

  it("has a two-column layout class", () => {
    render(<About />);
    const section = document.querySelector("#about");
    const grid = section?.querySelector(".md\\:grid-cols-2");
    expect(grid).toBeInTheDocument();
  });
});
