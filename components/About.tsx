import Image from "next/image";
import FadeInOnScroll from "./FadeInOnScroll";

export default function About() {
  return (
    <section id="about" className="py-24 px-8 md:px-16 bg-white">
      <h2 className="sr-only">About</h2>
      <FadeInOnScroll className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative w-full aspect-[3/4] shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-[#e8e0d4]">
          <Image
            src="/images/about.jpg"
            alt="Smaran Harihar — portrait, looking off camera, soft natural light"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6 text-[#222222]">
          <div className="max-w-prose flex flex-col gap-6">
            <p className="text-lg leading-relaxed">
              I am an immigrant to the USA.
            </p>
            <p className="text-lg leading-relaxed">
              Opportunities are all around and so are obstacles. Always try to
              make the most of what you got and hope for the Best. That is my
              life&apos;s motto.
            </p>
          </div>
          <div className="mt-4">
            <p className="text-lg flex items-baseline gap-2">
              <em>Much love,</em>
              <span className="font-playfair text-3xl font-semibold italic text-[#222222]">
                S
              </span>
            </p>
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
