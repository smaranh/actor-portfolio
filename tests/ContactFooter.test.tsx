import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

describe("Contact", () => {
  it("renders a section with id contact", () => {
    render(<Contact />);
    expect(document.querySelector("#contact")).toBeInTheDocument();
  });

  it("renders the booking heading", () => {
    render(<Contact />);
    expect(
      screen.getByText("For all bookings contact Smaran Harihar")
    ).toBeInTheDocument();
  });

  it("renders a mailto link to trappedactor@gmail.com", () => {
    render(<Contact />);
    const link = screen.getByRole("link", { name: /trappedactor@gmail\.com/ });
    expect(link).toHaveAttribute("href", "mailto:trappedactor@gmail.com");
  });
});

describe("Footer", () => {
  it("renders the email link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /trappedactor@gmail\.com/ });
    expect(link).toHaveAttribute("href", "mailto:trappedactor@gmail.com");
  });

  it("renders IMDB link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /imdb/i }).getAttribute("href")
    ).toContain("imdb.me/trappedactor");
  });

  it("renders YouTube link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /youtube/i }).getAttribute("href")
    ).toContain("youtube.com");
  });

  it("renders Facebook link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /facebook/i }).getAttribute("href")
    ).toContain("facebook.com/trappedactor");
  });

  it("renders Instagram link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /instagram/i }).getAttribute("href")
    ).toContain("instagram.com/trappedactor");
  });

  it("renders Twitter link", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /twitter/i }).getAttribute("href")
    ).toContain("twitter.com/TrappedActor");
  });

  it("does not mention Squarespace", () => {
    render(<Footer />);
    expect(screen.queryByText(/squarespace/i)).not.toBeInTheDocument();
  });

  it("all social links open in new tab", () => {
    render(<Footer />);
    const socialLinks = ["imdb", "youtube", "facebook", "instagram", "twitter"];
    socialLinks.forEach((name) => {
      const link = screen.getByRole("link", { name: new RegExp(name, "i") });
      expect(link).toHaveAttribute("target", "_blank");
    });
  });
});
