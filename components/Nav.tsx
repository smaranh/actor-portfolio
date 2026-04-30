"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const links = [
  { label: "About Me", href: "/#about" },
  { label: "Reels", href: "/#reels" },
  { label: "Headshots", href: "/#headshots" },
  { label: "Contact", href: "/#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { threshold: 0.4, rootMargin: "-64px 0px 0px 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
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
          scrolled
            ? "backdrop-blur-md bg-white/70 border-b border-black/5 shadow-sm"
            : "bg-transparent"
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
          {links.map(({ label, href }) => {
            const sectionId = href.replace("/#", "");
            const isActive = activeSection === sectionId;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm tracking-widest uppercase ${
                    scrolled ? "text-[#222222]" : "text-white"
                  } hover:opacity-60 transition-opacity ${
                    isActive ? "border-b-2 border-current pb-0.5" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Hamburger — stays in DOM so aria-expanded is always readable */}
        <button
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-overlay"
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <motion.span
            className={`block w-6 h-0.5 origin-center ${
              scrolled ? "bg-[#222222]" : "bg-white"
            }`}
            animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          />
          <motion.span
            className={`block w-6 h-0.5 ${
              scrolled ? "bg-[#222222]" : "bg-white"
            }`}
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          />
          <motion.span
            className={`block w-6 h-0.5 origin-center ${
              scrolled ? "bg-[#222222]" : "bg-white"
            }`}
            animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.3 }}
          />
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          id="mobile-nav-overlay"
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
