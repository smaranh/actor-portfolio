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
