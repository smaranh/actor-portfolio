import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "../app/not-found";

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

describe("NotFound", () => {
  it("renders the 404 display numeral", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the h1 heading", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Page not found");
  });

  it("renders a link back to /", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /back to home/i });
    expect(link).toHaveAttribute("href", "/");
  });

  it("renders inside a <main> element", () => {
    render(<NotFound />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("uses Playfair Display for the 404 numeral", () => {
    render(<NotFound />);
    const numeral = screen.getByText("404");
    expect(numeral.className).toMatch(/font-playfair/);
  });
});
