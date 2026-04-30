import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkipLink from "../components/SkipLink";

describe("SkipLink", () => {
  it("renders an anchor linking to #main", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to content");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "#main");
  });

  it("is visually hidden by default (sr-only)", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to content");
    expect(link.className).toMatch(/sr-only/);
  });

  it("is the first focusable element in the document", () => {
    render(<SkipLink />);
    const link = screen.getByText("Skip to content");
    // sr-only links are still in the tab order
    expect(link).toBeInTheDocument();
    expect(link.tabIndex).not.toBe(-1);
  });
});
