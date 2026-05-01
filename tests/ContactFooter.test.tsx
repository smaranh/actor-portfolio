import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

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

  it("mailto link uses animated underline gradient background classes", () => {
    render(<Contact />);
    const link = screen.getByRole("link", { name: /trappedactor@gmail\.com/ });
    expect(link.className).toContain("bg-[length:0%_1px]");
    expect(link.className).toContain("hover:bg-[length:100%_1px]");
  });

  it("mailto link does not use static underline utility class", () => {
    render(<Contact />);
    const link = screen.getByRole("link", { name: /trappedactor@gmail\.com/ });
    const classes = link.className.split(" ");
    expect(classes).not.toContain("underline");
  });

  it("renders 'Based in Los Angeles' subtext", () => {
    render(<Contact />);
    expect(screen.getByText(/based in los angeles/i)).toBeInTheDocument();
  });

  it("subtext appears before the email link in the DOM", () => {
    render(<Contact />);
    const subtext = screen.getByText(/based in los angeles/i);
    const link = screen.getByRole("link", { name: /trappedactor@gmail\.com/ });
    expect(
      subtext.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("section content is wrapped in FadeInOnScroll", () => {
    render(<Contact />);
    const heading = screen.getByText("For all bookings contact Smaran Harihar");
    const fadeAncestor = heading.closest("div[data-whileinview]");
    expect(fadeAncestor).not.toBeNull();
    expect(fadeAncestor!.getAttribute("data-whileinview")).toContain(
      '"opacity":1'
    );
  });
});

describe("Contact — copy-to-clipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders a Copy email button", () => {
    render(<Contact />);
    expect(
      screen.getByRole("button", { name: /copy email/i })
    ).toBeInTheDocument();
  });

  it("clicking Copy email calls navigator.clipboard.writeText with the email", async () => {
    render(<Contact />);
    const button = screen.getByRole("button", { name: /copy email/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "trappedactor@gmail.com"
    );
  });

  it("button label flips to Copied after click", async () => {
    render(<Contact />);
    const button = screen.getByRole("button", { name: /copy email/i });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
  });

  it("button label resets to Copy email after 2000ms", async () => {
    render(<Contact />);
    const button = screen.getByRole("button", { name: /copy email/i });
    await act(async () => {
      fireEvent.click(button);
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.getByRole("button", { name: /copy email/i })
    ).toBeInTheDocument();
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

  it("renders Twitter link pointing to x.com", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /twitter/i }).getAttribute("href")
    ).toContain("x.com/TrappedActor");
  });

  it("does not mention Squarespace", () => {
    render(<Footer />);
    expect(screen.queryByText(/squarespace/i)).not.toBeInTheDocument();
  });

  it("IMDB link contains an SVG icon, not visible text", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /imdb/i });
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.textContent?.trim()).toBe("");
  });

  it("YouTube link contains an SVG icon, not visible text", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /youtube/i });
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.textContent?.trim()).toBe("");
  });

  it("Facebook link contains an SVG icon, not visible text", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /facebook/i });
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.textContent?.trim()).toBe("");
  });

  it("Instagram link contains an SVG icon, not visible text", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /instagram/i });
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.textContent?.trim()).toBe("");
  });

  it("Twitter link contains an SVG icon, not visible text", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /twitter/i });
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.textContent?.trim()).toBe("");
  });

  it("social link SVG icons are aria-hidden", () => {
    render(<Footer />);
    const platforms = ["imdb", "youtube", "facebook", "instagram", "twitter"];
    platforms.forEach((name) => {
      const link = screen.getByRole("link", { name: new RegExp(name, "i") });
      const svg = link.querySelector("svg");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    });
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
