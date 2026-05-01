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
});
