import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReelsPreview from "../components/ReelsPreview";

describe("ReelsPreview — section", () => {
  it("renders a section with id reels", () => {
    render(<ReelsPreview />);
    expect(document.querySelector("#reels")).toBeInTheDocument();
  });

  it("renders the Reels heading", () => {
    render(<ReelsPreview />);
    expect(screen.getByRole("heading", { name: "Reels" })).toBeInTheDocument();
  });
});

describe("ReelsPreview — tiles", () => {
  it("renders all 4 video titles", () => {
    render(<ReelsPreview />);
    expect(screen.getByText("First Responders Part 1")).toBeInTheDocument();
    expect(screen.getByText("First Responders Part 2")).toBeInTheDocument();
    expect(screen.getByText("Being Charlie")).toBeInTheDocument();
    expect(screen.getByText("Slate Shot LA")).toBeInTheDocument();
  });

  it("does not render fabricated dates on any tile", () => {
    render(<ReelsPreview />);
    const reels = document.querySelector("#reels")!;
    expect(reels.textContent).not.toContain("4/21/24");
  });

  it("renders a thumbnail for each video", () => {
    render(<ReelsPreview />);
    const thumbnails = screen.getAllByRole("img");
    expect(thumbnails.length).toBeGreaterThanOrEqual(4);
    expect(thumbnails[0].getAttribute("src")).toContain("ytimg.com");
  });

  it("renders 4 play buttons", () => {
    render(<ReelsPreview />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(4);
  });
});

describe("ReelsPreview — modal", () => {
  it("modal is not shown on initial render", () => {
    render(<ReelsPreview />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens modal when a tile is clicked", () => {
    render(<ReelsPreview />);
    fireEvent.click(
      screen.getByText("First Responders Part 1").closest("button")!
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("modal has aria-modal=true", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("modal contains an iframe with the correct video ID", () => {
    render(<ReelsPreview />);
    fireEvent.click(
      screen.getByText("First Responders Part 1").closest("button")!
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toContain("utchWkrauZg");
  });

  it("iframe src uses autoplay=1", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toContain("autoplay=1");
  });

  it("closes modal on Escape key", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes modal when clicking the backdrop", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Slate Shot LA").closest("button")!);
    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
