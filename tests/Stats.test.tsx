import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Stats from "../components/Stats";

describe("Stats", () => {
  it("renders all four stat labels", () => {
    render(<Stats />);
    expect(screen.getByText("Height")).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("Hair Color")).toBeInTheDocument();
    expect(screen.getByText("Eye Color")).toBeInTheDocument();
  });

  it("renders all four stat values", () => {
    render(<Stats />);
    expect(screen.getByText("6' 0\"")).toBeInTheDocument();
    expect(screen.getByText("185 lbs")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("Brown")).toBeInTheDocument();
  });

  it("section has id='stats' for anchor navigation", () => {
    const { container } = render(<Stats />);
    expect(container.querySelector("#stats")).toBeInTheDocument();
  });

  it("renders eyebrow heading 'Casting' above the stats grid", () => {
    render(<Stats />);
    expect(screen.getByText("Casting")).toBeInTheDocument();
  });

  it("eyebrow has uppercase and tracking class", () => {
    render(<Stats />);
    const eyebrow = screen.getByText("Casting");
    expect(eyebrow.className).toMatch(/uppercase/);
    expect(eyebrow.className).toMatch(/tracking-/);
  });

  it("section has border-t but not border-b", () => {
    const { container } = render(<Stats />);
    const section = container.querySelector("#stats")!;
    expect(section.className).toMatch(/\bborder-t\b/);
    expect(section.className).not.toMatch(/\bborder-b\b/);
  });

  it("stat values use larger Playfair display size", () => {
    const { container } = render(<Stats />);
    const valueEls = container.querySelectorAll(".font-playfair");
    expect(valueEls.length).toBeGreaterThan(0);
    valueEls.forEach((el) => {
      expect(el.className).toMatch(/text-3xl|text-4xl/);
    });
  });

  it("stats grid has divide-x class for hairline dividers", () => {
    const { container } = render(<Stats />);
    const grid = container.querySelector(".grid");
    expect(grid?.className).toMatch(/divide-x/);
  });
});
