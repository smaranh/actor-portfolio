import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FadeInOnScroll from "../components/FadeInOnScroll";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
    }: {
      children: React.ReactNode;
      className?: string;
      initial?: false | Record<string, unknown>;
    }) => (
      <div className={className} data-initial={JSON.stringify(initial)}>
        {children}
      </div>
    ),
  },
  useReducedMotion: vi.fn(() => false),
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

  it("passes className to wrapper div", () => {
    const { container } = render(
      <FadeInOnScroll className="my-class">
        <span>content</span>
      </FadeInOnScroll>
    );
    expect(container.firstChild).toHaveClass("my-class");
  });

  it("renders multiple children", () => {
    render(
      <FadeInOnScroll>
        <p>First</p>
        <p>Second</p>
      </FadeInOnScroll>
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("passes false as initial when reduced motion is preferred", async () => {
    const { useReducedMotion } = await import("framer-motion");
    vi.mocked(useReducedMotion).mockReturnValueOnce(true);

    const { container } = render(
      <FadeInOnScroll>
        <span>content</span>
      </FadeInOnScroll>
    );
    expect(container.firstChild).toHaveAttribute("data-initial", "false");
  });

  it("passes an opacity/y object as initial when motion is allowed", async () => {
    const { useReducedMotion } = await import("framer-motion");
    vi.mocked(useReducedMotion).mockReturnValueOnce(false);

    const { container } = render(
      <FadeInOnScroll>
        <span>content</span>
      </FadeInOnScroll>
    );
    const initial = JSON.parse(
      (container.firstChild as HTMLElement).dataset.initial ?? "null"
    );
    expect(initial).toMatchObject({ opacity: 0 });
    expect(typeof initial.y).toBe("number");
  });
});
