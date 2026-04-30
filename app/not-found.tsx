import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-playfair text-[8rem] leading-none font-semibold text-[#222222] select-none">
        404
      </p>
      <h1 className="mt-4 font-playfair text-2xl font-semibold text-[#222222]">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-[#666] max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm tracking-widest uppercase text-[#222222] border-b border-[#222222] pb-0.5 hover:opacity-60 transition-opacity"
      >
        Back to home
      </Link>
    </main>
  );
}
