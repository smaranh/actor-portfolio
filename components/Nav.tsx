"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { label: "About Me", href: "/#about" },
  { label: "Reels", href: "/#reels" },
  { label: "Headshots", href: "/#headshots" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
          scrolled ? "bg-white shadow-sm" : "bg-transparent"
        }`}
      >
        <Link
          href="/#"
          className={`font-playfair text-lg font-semibold tracking-wide ${
            scrolled ? "text-[#222222]" : "text-white"
          }`}
        >
          Smaran Harihar
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8">
          {links.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-sm tracking-widest uppercase ${
                  scrolled ? "text-[#222222]" : "text-white"
                } hover:opacity-60 transition-opacity`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          aria-label="Open menu"
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(true)}
        >
          <span
            className={`block w-6 h-0.5 ${scrolled ? "bg-[#222222]" : "bg-white"}`}
          />
          <span
            className={`block w-6 h-0.5 ${scrolled ? "bg-[#222222]" : "bg-white"}`}
          />
          <span
            className={`block w-6 h-0.5 ${scrolled ? "bg-[#222222]" : "bg-white"}`}
          />
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-10"
        >
          <button
            aria-label="Close menu"
            className="absolute top-5 right-6 text-3xl text-[#222222]"
            onClick={() => setMenuOpen(false)}
          >
            &times;
          </button>
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="font-playfair text-4xl text-[#222222] hover:opacity-60 transition-opacity"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
