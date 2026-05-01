"use client";

import { useState } from "react";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("trappedactor@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // graceful no-op if clipboard API unavailable (e.g., insecure context)
    }
  };

  return (
    <section id="contact" className="py-24 px-8 md:px-16 bg-white text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#222222] mb-4">
          For all bookings contact Smaran Harihar
        </h2>
        <p className="text-sm text-gray-500 mb-6">Based in Los Angeles</p>
        <div className="flex flex-col items-center gap-3">
          <a
            href="mailto:trappedactor@gmail.com"
            className="text-lg text-[#222222] relative bg-[length:0%_1px] bg-no-repeat bg-bottom hover:bg-[length:100%_1px] transition-all duration-300"
            style={{
              backgroundImage: "linear-gradient(currentColor, currentColor)",
            }}
          >
            trappedactor@gmail.com
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="text-xs uppercase tracking-widest text-gray-500 hover:text-[#222222] transition-colors"
            aria-live="polite"
          >
            {copied ? "Copied ✓" : "Copy email"}
          </button>
        </div>
      </div>
    </section>
  );
}
