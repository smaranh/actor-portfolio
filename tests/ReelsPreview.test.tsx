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

  it("renders the Selected Work eyebrow above the heading", () => {
    render(<ReelsPreview />);
    expect(screen.getByText(/selected work/i)).toBeInTheDocument();
  });

  it("eyebrow has uppercase and tracking classes", () => {
    render(<ReelsPreview />);
    const eyebrow = screen.getByText(/selected work/i);
    expect(eyebrow.className).toMatch(/uppercase/);
    expect(eyebrow.className).toMatch(/tracking-/);
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

  it("play SVG has aria-hidden=true", () => {
    render(<ReelsPreview />);
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("tile buttons have descriptive aria-label", () => {
    render(<ReelsPreview />);
    expect(
      screen.getByRole("button", { name: /play first responders part 1/i })
    ).toBeInTheDocument();
  });

  it("each tile button aria-label includes the video title", () => {
    render(<ReelsPreview />);
    const videoTitles = [
      "First Responders Part 1",
      "First Responders Part 2",
      "Being Charlie",
      "Slate Shot LA",
    ];
    videoTitles.forEach((title) => {
      expect(
        screen.getByRole("button", { name: new RegExp(`play ${title}`, "i") })
      ).toBeInTheDocument();
    });
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

  it("iframe has a non-empty title attribute when modal is open", () => {
    render(<ReelsPreview />);
    fireEvent.click(
      screen.getByText("First Responders Part 1").closest("button")!
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.title.length).toBeGreaterThan(0);
  });

  it("iframe title includes the video title", () => {
    render(<ReelsPreview />);
    fireEvent.click(
      screen.getByText("First Responders Part 1").closest("button")!
    );
    const iframe = document.querySelector("iframe");
    expect(iframe?.title).toContain("First Responders Part 1");
  });
});

describe("ReelsPreview — scroll lock", () => {
  it("sets body overflow hidden when modal opens", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body overflow when modal closes", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });

  it("restores body overflow on unmount", () => {
    const { unmount } = render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
