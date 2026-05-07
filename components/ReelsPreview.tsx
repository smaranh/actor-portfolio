"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import FadeInOnScroll from "./FadeInOnScroll";

const videos = [
  { id: "utchWkrauZg", title: "First Responders Part 1" },
  { id: "Kg4OPd4saVE", title: "First Responders Part 2" },
  { id: "p_ZpjegmmJc", title: "Being Charlie" },
  { id: "ol3Y_YYAjcw", title: "Slate Shot LA" },
];

type Video = (typeof videos)[number];

function ReelTile({
  video,
  onPlay,
}: {
  video: Video;
  onPlay: (id: string, btn: HTMLButtonElement) => void;
}) {
  const [thumbSrc, setThumbSrc] = useState(
    `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
  );

  return (
    <button
      aria-label={`Play ${video.title}`}
      className="group relative w-full text-left focus:outline-none"
      onClick={(e) => onPlay(video.id, e.currentTarget)}
    >
      <div className="relative overflow-hidden aspect-video bg-black">
        <Image
          src={thumbSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-white group-hover:ring-2 group-hover:ring-white/40">
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
        <p className="text-[#222222] font-medium">{video.title}</p>
      </div>
    </button>
  );
}

export default function ReelsPreview() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastTileRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const open = (id: string, btn: HTMLButtonElement) => {
    lastTileRef.current = btn;
    setActiveId(id);
  };

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

  useEffect(() => {
    if (activeId) {
      closeRef.current?.focus();
    } else if (lastTileRef.current) {
      lastTileRef.current.focus();
    }
  }, [activeId]);

  const activeVideo = activeId ? videos.find((v) => v.id === activeId) : null;

  return (
    <section id="reels" className="py-24 px-8 md:px-16 bg-white">
      <FadeInOnScroll>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium text-[#4b5563] mb-3">
            Selected Work
          </p>
          <h2 className="font-playfair text-4xl font-semibold text-[#222222] mb-12">
            Reels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {videos.map((v) => (
              <ReelTile key={v.id} video={v} onPlay={open} />
            ))}
          </div>
        </div>
      </FadeInOnScroll>

      {activeId && activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeVideo.title} video player`}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActiveId(null)}
        >
          <button
            ref={closeRef}
            type="button"
            aria-label="Close video"
            onClick={(e) => {
              e.stopPropagation();
              setActiveId(null);
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#222222] flex items-center justify-center text-xl"
          >
            ×
          </button>
          <div
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeId}?autoplay=1`}
              title={`${activeVideo.title} (YouTube video)`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
