"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import FadeInOnScroll from "./FadeInOnScroll";

const headshots = [
  { src: "/images/headshot-1.jpg", alt: "Headshot 1" },
  { src: "/images/headshot-2.jpg", alt: "Headshot 2" },
  { src: "/images/headshot-3.jpg", alt: "Headshot 3" },
  { src: "/images/headshot-4.jpg", alt: "Headshot 4" },
];

export default function Headshots() {
  const [index, setIndex] = useState(0);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const reduce = useReducedMotion();

  const prev = () =>
    setIndex((i) => (i - 1 + headshots.length) % headshots.length);
  const next = () => setIndex((i) => (i + 1) % headshots.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + headshots.length) % headshots.length);
      else if (e.key === "ArrowRight")
        setIndex((i) => (i + 1) % headshots.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="headshots" className="py-24 px-8 md:px-16 bg-white">
      <FadeInOnScroll>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-playfair text-4xl font-semibold text-[#222222] mb-12">
            Headshots
          </h2>
          <div className="relative flex items-center justify-center gap-4">
            <button
              aria-label="Previous headshot"
              onClick={prev}
              className="flex-shrink-0 w-12 h-12 rounded-full border border-[#222222] flex items-center justify-center hover:bg-[#222222] hover:text-white hover:-translate-y-0.5 transition-all"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: reduce ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reduce ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.3 }}
                className="relative w-full max-w-2xl aspect-[3/4]"
              >
                <Image
                  src={`${base}${headshots[index].src}`}
                  alt={headshots[index].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 672px"
                  className="object-cover"
                  priority={index === 0}
                />
              </motion.div>
            </AnimatePresence>
            <button
              aria-label="Next headshot"
              onClick={next}
              className="flex-shrink-0 w-12 h-12 rounded-full border border-[#222222] flex items-center justify-center hover:bg-[#222222] hover:text-white hover:-translate-y-0.5 transition-all"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <p
            aria-live="polite"
            aria-atomic="true"
            className="text-center font-playfair text-2xl text-[#222222] mt-4"
          >
            <span className="sr-only">
              Image {index + 1} of {headshots.length}
            </span>
            <span aria-hidden="true">
              {String(index + 1).padStart(2, "0")} &mdash;{" "}
              {String(headshots.length).padStart(2, "0")}
            </span>
          </p>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
