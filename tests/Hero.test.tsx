import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "../components/Hero";

describe("Hero", () => {
  it("renders a section with id hero", () => {
    render(<Hero />);
    expect(document.querySelector("#hero")).toBeInTheDocument();
  });

  it("renders the heading", () => {
    render(<Hero />);
    expect(
      screen.getByText("Hey there, I’m Smaran Harihar.")
    ).toBeInTheDocument();
  });

  it("renders the subheading", () => {
    render(<Hero />);
    expect(
      screen.getByText("I’m an Actor, Software Engineer and a Dad.")
    ).toBeInTheDocument();
  });

  it("uses hero.jpg as background image", () => {
    render(<Hero />);
    const section = document.querySelector("#hero") as HTMLElement;
    expect(section?.style.backgroundImage).toContain("hero.jpg");
  });

  it("positions text at the bottom-left", () => {
    render(<Hero />);
    const textContainer = screen.getByText(
      "Hey there, I’m Smaran Harihar."
    ).parentElement;
    expect(textContainer?.className).toMatch(/bottom/);
    expect(textContainer?.className).toMatch(/left/);
  });

  it("uses min-h-[100svh] and w-full for layout", () => {
    render(<Hero />);
    const section = document.querySelector("#hero") as HTMLElement;
    expect(section.className).toMatch(/min-h-\[100svh\]/);
    expect(section.className).not.toMatch(/\bh-screen\b/);
    expect(section.className).toMatch(/w-full/);
  });
});
