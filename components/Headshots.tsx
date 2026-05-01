"use client";

import { useState } from "react";
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
        <p className="text-center text-sm text-gray-400 mt-4">
          {index + 1} / {headshots.length}
        </p>
      </div>
    </section>
  );
}
