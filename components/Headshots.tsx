"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const headshots = [
  { src: "/images/headshot-1.jpg", alt: "Headshot 1" },
  { src: "/images/headshot-2.jpg", alt: "Headshot 2" },
  { src: "/images/headshot-3.jpg", alt: "Headshot 3" },
  { src: "/images/headshot-4.jpg", alt: "Headshot 4" },
];

export default function Headshots() {
  const [index, setIndex] = useState(0);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-4xl font-semibold text-[#222222] mb-12">
          Headshots
        </h2>
        <div className="relative flex items-center justify-center gap-4">
          <button
            aria-label="Previous headshot"
            onClick={prev}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
          >
            &#8592;
          </button>
          <div className="relative w-full max-w-2xl aspect-[3/4]">
            <Image
              src={`${base}${headshots[index].src}`}
              alt={headshots[index].alt}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
          <button
            aria-label="Next headshot"
            onClick={next}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#222222] hover:bg-[#222222] hover:text-white transition-colors"
          >
            &#8594;
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
    </section>
  );
}
