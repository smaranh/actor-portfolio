import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReelsPreview from "../components/ReelsPreview";

describe("ReelsPreview", () => {
  it("renders a section with id reels", () => {
    render(<ReelsPreview />);
    expect(document.querySelector("#reels")).toBeInTheDocument();
  });

  it("renders the Reels heading", () => {
    render(<ReelsPreview />);
    expect(screen.getByText("Reels")).toBeInTheDocument();
  });

  it("renders all 4 video titles", () => {
    render(<ReelsPreview />);
    expect(screen.getByText("First Responders Part 1")).toBeInTheDocument();
    expect(screen.getByText("First Responders Part 2")).toBeInTheDocument();
    expect(screen.getByText("Being Charlie")).toBeInTheDocument();
    expect(screen.getByText("Slate Shot LA")).toBeInTheDocument();
  });

  it("renders all 4 dates", () => {
    render(<ReelsPreview />);
    expect(screen.getAllByText("4/21/24")).toHaveLength(4);
  });

  it("renders a thumbnail for each video", () => {
    render(<ReelsPreview />);
    const thumbnails = screen.getAllByRole("img");
    expect(thumbnails.length).toBeGreaterThanOrEqual(4);
    expect(thumbnails[0].getAttribute("src")).toContain("ytimg.com");
  });

  it("opens modal when a tile is clicked", () => {
    render(<ReelsPreview />);
    fireEvent.click(
      screen.getByText("First Responders Part 1").closest("button")!
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("modal contains iframe with correct video ID", () => {
    render(<ReelsPreview />);
    fireEvent.click(
      screen.getByText("First Responders Part 1").closest("button")!
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toContain("utchWkrauZg");
  });

  it("closes modal on Escape key", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes modal when clicking the backdrop", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Slate Shot LA").closest("button")!);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
