import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Nav from "../components/Nav";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Nav — links", () => {
  it("renders site name linking to /#", () => {
    render(<Nav />);
    expect(screen.getByText("Smaran Harihar").closest("a")).toHaveAttribute(
      "href",
      "/#"
    );
  });

  it("renders About Me link", () => {
    render(<Nav />);
    expect(screen.getByText("About Me").closest("a")).toHaveAttribute(
      "href",
      "/#about"
    );
  });

  it("renders Reels link", () => {
    render(<Nav />);
    expect(screen.getByText("Reels").closest("a")).toHaveAttribute(
      "href",
      "/#reels"
    );
  });

  it("renders Headshots link", () => {
    render(<Nav />);
    expect(screen.getByText("Headshots").closest("a")).toHaveAttribute(
      "href",
      "/#headshots"
    );
  });

  it("renders Contact link", () => {
    render(<Nav />);
    expect(screen.getByText("Contact").closest("a")).toHaveAttribute(
      "href",
      "/#contact"
    );
  });
});

describe("Nav — scroll state", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
  });

  it("is transparent at top of page", () => {
    render(<Nav />);
    expect(screen.getByRole("navigation").className).not.toMatch(/bg-white/);
  });

  it("gets white background after scrolling", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 50 });
    fireEvent.scroll(window);
    expect(screen.getByRole("navigation").className).toMatch(/bg-white/);
  });

  it("returns to transparent when scrolled back to top", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 50 });
    fireEvent.scroll(window);
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
    fireEvent.scroll(window);
    expect(screen.getByRole("navigation").className).not.toMatch(/bg-white/);
  });
});

describe("Nav — mobile overlay", () => {
  it("overlay is not shown on initial render", () => {
    render(<Nav />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens overlay when hamburger is clicked", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("overlay has aria-modal=true", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("closes overlay when close button is clicked", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes overlay when a nav link inside it is clicked", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const overlayLinks = screen.getAllByText("About Me");
    fireEvent.click(overlayLinks[overlayLinks.length - 1]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks body scroll when overlay is open", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when overlay is closed", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    fireEvent.click(screen.getByLabelText("Close menu"));
    expect(document.body.style.overflow).toBe("");
  });

  it("renders all nav links inside the overlay", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("About Me");
    expect(dialog).toHaveTextContent("Reels");
    expect(dialog).toHaveTextContent("Headshots");
    expect(dialog).toHaveTextContent("Contact");
  });
});
