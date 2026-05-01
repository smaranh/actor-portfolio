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
