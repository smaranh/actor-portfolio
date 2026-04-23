import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Nav from "../components/Nav";

// next/link renders a standard <a> in jsdom
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

describe("Nav", () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, "scrollY", {
      writable: true,
      value: 0,
    });
  });

  it("renders site name linking to /#", () => {
    render(<Nav />);
    const siteLink = screen.getByText("Smaran Harihar");
    expect(siteLink.closest("a")).toHaveAttribute("href", "/#");
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

  it("is transparent at top of page", () => {
    render(<Nav />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).not.toMatch(/bg-white/);
  });

  it("gets white background after scrolling", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 50 });
    fireEvent.scroll(window);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toMatch(/bg-white/);
  });

  it("opens mobile overlay when hamburger is clicked", () => {
    render(<Nav />);
    const hamburger = screen.getByLabelText("Open menu");
    fireEvent.click(hamburger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes mobile overlay when a link is clicked", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const overlayLinks = screen.getAllByText("About Me");
    fireEvent.click(overlayLinks[overlayLinks.length - 1]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
