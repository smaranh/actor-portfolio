import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Headshots from "../components/Headshots";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    priority,
    ...props
  }: {
    src: string;
    alt: string;
    priority?: boolean;
    [key: string]: unknown;
  }) => (
    <img
      src={src}
      alt={alt}
      data-priority={priority ? "true" : undefined}
      {...props}
    />
  ),
}));

describe("Headshots", () => {
  it("renders a section with id headshots", () => {
    render(<Headshots />);
    expect(document.querySelector("#headshots")).toBeInTheDocument();
  });

  it("renders the Headshots heading", () => {
    render(<Headshots />);
    expect(screen.getByText("Headshots")).toBeInTheDocument();
  });

  it("shows headshot-1 by default", () => {
    render(<Headshots />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("headshot-1");
  });

  it("advances to headshot-2 on next click", () => {
    render(<Headshots />);
    fireEvent.click(screen.getByLabelText("Next headshot"));
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("headshot-2");
  });

  it("wraps from last to first on next click", () => {
    render(<Headshots />);
    const next = screen.getByLabelText("Next headshot");
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    fireEvent.click(next);
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("headshot-1");
  });

  it("wraps from first to last on prev click", () => {
    render(<Headshots />);
    fireEvent.click(screen.getByLabelText("Previous headshot"));
    const img = screen.getByRole("img");
    expect(img.getAttribute("src")).toContain("headshot-4");
  });

  it("renders prev and next buttons", () => {
    render(<Headshots />);
    expect(screen.getByLabelText("Previous headshot")).toBeInTheDocument();
    expect(screen.getByLabelText("Next headshot")).toBeInTheDocument();
  });

  describe("keyboard navigation (6.4)", () => {
    it("ArrowRight advances the index", () => {
      render(<Headshots />);
      fireEvent.keyDown(window, { key: "ArrowRight" });
      expect(screen.getByRole("img").getAttribute("src")).toContain(
        "headshot-2"
      );
    });

    it("ArrowLeft wraps backward from index 0 to last", () => {
      render(<Headshots />);
      fireEvent.keyDown(window, { key: "ArrowLeft" });
      expect(screen.getByRole("img").getAttribute("src")).toContain(
        "headshot-4"
      );
    });

    it("ArrowRight wraps forward from last to index 0", () => {
      render(<Headshots />);
      const next = screen.getByLabelText("Next headshot");
      fireEvent.click(next);
      fireEvent.click(next);
      fireEvent.click(next);
      fireEvent.keyDown(window, { key: "ArrowRight" });
      expect(screen.getByRole("img").getAttribute("src")).toContain(
        "headshot-1"
      );
    });

    it("other keys do not change the index", () => {
      render(<Headshots />);
      fireEvent.keyDown(window, { key: "Enter" });
      expect(screen.getByRole("img").getAttribute("src")).toContain(
        "headshot-1"
      );
    });
  });

  describe("live counter + typography (6.5 + 6.6)", () => {
    it("counter has aria-live polite", () => {
      render(<Headshots />);
      const counter = document.querySelector("[aria-live]");
      expect(counter).toHaveAttribute("aria-live", "polite");
    });

    it("counter has aria-atomic true", () => {
      render(<Headshots />);
      const counter = document.querySelector("[aria-live]");
      expect(counter).toHaveAttribute("aria-atomic", "true");
    });

    it("counter has sr-only span reading Image N of M", () => {
      render(<Headshots />);
      expect(screen.getByText("Image 1 of 4")).toBeInTheDocument();
    });

    it("counter has aria-hidden visible span with 01 — 04 style", () => {
      render(<Headshots />);
      const visibleSpan = document
        .querySelector("[aria-live]")
        ?.querySelector("[aria-hidden='true']");
      expect(visibleSpan?.textContent).toMatch(/01\s*—\s*04/);
    });

    it("counter has font-playfair class", () => {
      render(<Headshots />);
      const counter = document.querySelector("[aria-live]");
      expect(counter?.className).toContain("font-playfair");
    });

    it("counter has text-2xl or text-xl class", () => {
      render(<Headshots />);
      const counter = document.querySelector("[aria-live]");
      expect(counter?.className).toMatch(/text-(xl|2xl)/);
    });
  });

  describe("priority loading (6.2)", () => {
    it("first image (index 0) has priority", () => {
      render(<Headshots />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("data-priority", "true");
    });

    it("subsequent images do not have priority", () => {
      render(<Headshots />);
      fireEvent.click(screen.getByLabelText("Next headshot"));
      const img = screen.getByRole("img");
      expect(img).not.toHaveAttribute("data-priority");
    });
  });
});
