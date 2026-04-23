export default function Hero() {
  return (
    <section
      id="hero"
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-12 left-8 md:left-16 text-white">
        <h1
          className="font-playfair text-4xl md:text-6xl font-semibold mb-3 leading-tight"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          Hey there, I&apos;m Smaran Harihar.
        </h1>
        <p
          className="text-lg md:text-2xl font-light"
          style={{ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
        >
          I&apos;m an Actor, Software Engineer and a Dad.
        </p>
      </div>
    </section>
  );
}
