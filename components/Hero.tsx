import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/hero.jpg`}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-12 left-8 md:left-16 text-white">
        <p
          className="text-xs md:text-sm tracking-[0.2em] uppercase font-medium text-white/80 mb-3"
          style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
        >
          WELCOME
        </p>
        <h1
          className="font-playfair text-4xl md:text-6xl font-semibold mb-3 leading-tight"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          <span className="italic font-normal">Hey there, I’m </span>
          <span className="font-bold">Smaran Harihar.</span>
        </h1>
        <p
          className="text-lg md:text-2xl font-light"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
        >
          I’m an Actor, Software Engineer and a Dad.
        </p>
      </div>
    </section>
  );
}
