import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FadeInOnScroll from "../components/FadeInOnScroll";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => <div className={className}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

describe("FadeInOnScroll", () => {
  it("renders children", () => {
    render(
      <FadeInOnScroll>
        <p>Hello world</p>
      </FadeInOnScroll>
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("passes className to wrapper", () => {
    const { container } = render(
      <FadeInOnScroll className="my-class">
        <span>content</span>
      </FadeInOnScroll>
    );
    expect(container.firstChild).toHaveClass("my-class");
  });
});
