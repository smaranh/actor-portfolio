import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
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

vi.mock("framer-motion", () => ({
  motion: {
    span: ({
      children,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      animate?: Record<string, unknown>;
      transition?: Record<string, unknown>;
      [key: string]: unknown;
    }) => (
      <span
        data-animate={JSON.stringify(animate)}
        data-transition={JSON.stringify(transition)}
        {...props}
      >
        {children}
      </span>
    ),
  },
  useReducedMotion: vi.fn(() => false),
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
    expect(screen.getByRole("navigation").className).not.toMatch(
      /backdrop-blur/
    );
  });

  it("stays transparent at scrollY = 30 (threshold boundary)", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 30 });
    fireEvent.scroll(window);
    expect(screen.getByRole("navigation").className).not.toMatch(
      /backdrop-blur/
    );
  });

  it("shows glass state when scrollY > 30", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 31 });
    fireEvent.scroll(window);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toMatch(/backdrop-blur/);
    expect(nav.className).toMatch(/bg-white\/70/);
  });

  it("glass state includes hairline bottom border", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 50 });
    fireEvent.scroll(window);
    expect(screen.getByRole("navigation").className).toMatch(/border-black\/5/);
  });

  it("returns to transparent when scrolled back to ≤ 30", () => {
    render(<Nav />);
    Object.defineProperty(window, "scrollY", { writable: true, value: 50 });
    fireEvent.scroll(window);
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
    fireEvent.scroll(window);
    expect(screen.getByRole("navigation").className).not.toMatch(
      /backdrop-blur/
    );
  });
});

describe("Nav — active-section underline", () => {
  let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;
  let observerInstance: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    observerInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(
          cb: (entries: Partial<IntersectionObserverEntry>[]) => void
        ) {
          observerCallback = cb;
          Object.assign(this, observerInstance);
        }
      }
    );

    // Create section elements for the observer to find
    const sectionIds = ["about", "reels", "headshots", "contact"];
    sectionIds.forEach((id) => {
      const section = document.createElement("section");
      section.id = id;
      document.body.appendChild(section);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.querySelectorAll("section[id]").forEach((el) => el.remove());
  });

  it("no link has active underline on initial render", () => {
    render(<Nav />);
    const desktopLinks = screen
      .getAllByText("About Me")
      .map((el) => el.closest("a"));
    desktopLinks.forEach((link) => {
      expect(link?.className).not.toMatch(/border-b-2/);
    });
  });

  it("underlines the link whose section is in view", () => {
    render(<Nav />);
    act(() => {
      observerCallback([
        {
          target: document.getElementById("about")!,
          isIntersecting: true,
          intersectionRatio: 0.5,
        },
      ]);
    });
    const aboutLinks = screen.getAllByText("About Me");
    const desktopAbout = aboutLinks[0].closest("a");
    expect(desktopAbout?.className).toMatch(/border-b-2/);
  });

  it("deactivates previous link when a new section enters view", () => {
    render(<Nav />);
    act(() => {
      observerCallback([
        {
          target: document.getElementById("about")!,
          isIntersecting: true,
          intersectionRatio: 0.5,
        },
      ]);
    });
    act(() => {
      observerCallback([
        {
          target: document.getElementById("reels")!,
          isIntersecting: true,
          intersectionRatio: 0.5,
        },
      ]);
    });
    const aboutLinks = screen.getAllByText("About Me");
    const desktopAbout = aboutLinks[0].closest("a");
    expect(desktopAbout?.className).not.toMatch(/border-b-2/);

    const reelsLinks = screen.getAllByText("Reels");
    const desktopReels = reelsLinks[0].closest("a");
    expect(desktopReels?.className).toMatch(/border-b-2/);
  });

  it("disconnects observer on unmount", () => {
    const { unmount } = render(<Nav />);
    unmount();
    expect(observerInstance.disconnect).toHaveBeenCalled();
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

describe("Nav — hamburger aria + animation", () => {
  it("hamburger has aria-expanded=false by default", () => {
    render(<Nav />);
    expect(screen.getByLabelText("Open menu")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("hamburger has aria-expanded=true when overlay is open", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(screen.getByLabelText("Open menu")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("hamburger has aria-controls pointing to overlay id", () => {
    render(<Nav />);
    const hamburger = screen.getByLabelText("Open menu");
    expect(hamburger).toHaveAttribute("aria-controls", "mobile-nav-overlay");
  });

  it("overlay has id=mobile-nav-overlay", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    expect(document.getElementById("mobile-nav-overlay")).toBeInTheDocument();
  });

  it("hamburger renders 3 bar spans", () => {
    render(<Nav />);
    const button = screen.getByLabelText("Open menu");
    expect(button.querySelectorAll("span")).toHaveLength(3);
  });

  it("middle bar has opacity:0 in animate when menu is open", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const button = screen.getByLabelText("Open menu");
    const bars = button.querySelectorAll("span");
    const midAnimate = JSON.parse(bars[1].getAttribute("data-animate") ?? "{}");
    expect(midAnimate.opacity).toBe(0);
  });

  it("top bar rotates to 45deg when menu is open", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const button = screen.getByLabelText("Open menu");
    const bars = button.querySelectorAll("span");
    const topAnimate = JSON.parse(bars[0].getAttribute("data-animate") ?? "{}");
    expect(topAnimate.rotate).toBe(45);
  });

  it("bottom bar rotates to -45deg when menu is open", () => {
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const button = screen.getByLabelText("Open menu");
    const bars = button.querySelectorAll("span");
    const botAnimate = JSON.parse(bars[2].getAttribute("data-animate") ?? "{}");
    expect(botAnimate.rotate).toBe(-45);
  });

  it("reduced motion: transition duration is 0", async () => {
    // Must mock before render so useReducedMotion() returns true at init
    const fm = await import("framer-motion");
    vi.mocked(fm.useReducedMotion).mockReturnValue(true);
    render(<Nav />);
    fireEvent.click(screen.getByLabelText("Open menu"));
    const button = screen.getByLabelText("Open menu");
    const bars = button.querySelectorAll("span");
    const transition = JSON.parse(
      bars[0].getAttribute("data-transition") ?? "{}"
    );
    expect(transition.duration).toBe(0);
    vi.mocked(fm.useReducedMotion).mockReturnValue(false); // restore
  });
});
