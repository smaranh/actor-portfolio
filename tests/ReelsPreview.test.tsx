import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReelsPreview from "../components/ReelsPreview";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
      whileInView,
      viewport,
      transition,
      ...props
    }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any) => (
      <div
        className={className}
        data-initial={JSON.stringify(initial)}
        data-whileinview={JSON.stringify(whileInView)}
        data-viewport={JSON.stringify(viewport)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </div>
    ),
  },
  useReducedMotion: () => false,
}));

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

  it("inner content is wrapped in FadeInOnScroll", () => {
    render(<ReelsPreview />);
    const heading = screen.getByRole("heading", { name: "Reels" });
    const fadeAncestor = heading.closest("div[data-whileinview]");
    expect(fadeAncestor).not.toBeNull();
    expect(fadeAncestor!.getAttribute("data-whileinview")).toContain(
      '"opacity":1'
    );
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

  it("thumbnails use maxresdefault as default src", () => {
    render(<ReelsPreview />);
    const thumbnails = screen.getAllByRole("img");
    expect(thumbnails[0].getAttribute("src")).toContain("maxresdefault.jpg");
  });

  it("thumbnail alt matches the video title", () => {
    render(<ReelsPreview />);
    expect(screen.getByAltText("First Responders Part 1")).toBeInTheDocument();
    expect(screen.getByAltText("Being Charlie")).toBeInTheDocument();
  });

  it("thumbnails use Next.js Image component (sizes prop present)", () => {
    render(<ReelsPreview />);
    const thumbnails = screen.getAllByRole("img");
    expect(thumbnails[0]).toHaveAttribute("sizes");
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

  it("play button circle has hover scale class", () => {
    render(<ReelsPreview />);
    const playCircle = document
      .querySelector("button[aria-label^='Play']")!
      .querySelector("div.rounded-full")!;
    expect(playCircle.className).toMatch(/group-hover:scale-/);
  });

  it("play button circle has hover ring class", () => {
    render(<ReelsPreview />);
    const playCircle = document
      .querySelector("button[aria-label^='Play']")!
      .querySelector("div.rounded-full")!;
    expect(playCircle.className).toMatch(/group-hover:ring-/);
  });

  it("thumbnail Image has hover scale class", () => {
    render(<ReelsPreview />);
    const thumbnail = screen.getAllByRole("img")[0];
    expect(thumbnail.className).toMatch(/group-hover:scale-/);
  });

  it("thumbnail Image has transition class", () => {
    render(<ReelsPreview />);
    const thumbnail = screen.getAllByRole("img")[0];
    expect(thumbnail.className).toMatch(/transition-/);
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

  it("iframe src uses youtube-nocookie.com", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    const iframe = document.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toMatch(
      /^https:\/\/www\.youtube-nocookie\.com\/embed\//
    );
  });

  it("iframe src still includes the video id", () => {
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

describe("ReelsPreview — modal focus and aria", () => {
  it("dialog has aria-label containing the video title", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-label")).toContain("Being Charlie");
  });

  it("focus moves to the close button when modal opens", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    const closeBtn = screen.getByRole("button", { name: /close video/i });
    expect(document.activeElement).toBe(closeBtn);
  });

  it("focus returns to the tile that opened the modal after Escape", () => {
    render(<ReelsPreview />);
    const tileBtn = screen.getByRole("button", {
      name: /play being charlie/i,
    });
    fireEvent.click(tileBtn);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(tileBtn);
  });
});

describe("ReelsPreview — close button", () => {
  it("close button renders when modal is open", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    expect(
      screen.getByRole("button", { name: /close video/i })
    ).toBeInTheDocument();
  });

  it("close button is not in the DOM when modal is closed", () => {
    render(<ReelsPreview />);
    expect(
      screen.queryByRole("button", { name: /close video/i })
    ).not.toBeInTheDocument();
  });

  it("clicking close button dismisses the modal", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: /close video/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("close button has aria-label Close video", () => {
    render(<ReelsPreview />);
    fireEvent.click(screen.getByText("Being Charlie").closest("button")!);
    expect(
      screen.getByRole("button", { name: /close video/i })
    ).toHaveAttribute("aria-label", "Close video");
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
