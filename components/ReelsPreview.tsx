"use client";

import { useEffect, useState } from "react";

const videos = [
  { id: "utchWkrauZg", title: "First Responders Part 1" },
  { id: "Kg4OPd4saVE", title: "First Responders Part 2" },
  { id: "p_ZpjegmmJc", title: "Being Charlie" },
  { id: "ol3Y_YYAjcw", title: "Slate Shot LA" },
];

export default function ReelsPreview() {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeId]);

  return (
    <section id="reels" className="py-24 px-8 md:px-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium text-gray-500 mb-3">
          Selected Work
        </p>
        <h2 className="font-playfair text-4xl font-semibold text-[#222222] mb-12">
          Reels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((v) => (
            <button
              key={v.id}
              aria-label={`Play ${v.title}`}
              className="group relative w-full text-left focus:outline-none"
              onClick={() => setActiveId(v.id)}
            >
              <div className="relative overflow-hidden aspect-video bg-black">
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
                    <svg
                      aria-hidden="true"
                      className="w-6 h-6 text-[#222222] ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[#222222] font-medium">{v.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeId &&
        (() => {
          const activeVideo = videos.find((v) => v.id === activeId);
          return (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setActiveId(null)}
            >
              <div
                className="w-full max-w-4xl aspect-video"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${activeId}?autoplay=1`}
                  title={`${activeVideo?.title} (YouTube video)`}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          );
        })()}
    </section>
  );
}
