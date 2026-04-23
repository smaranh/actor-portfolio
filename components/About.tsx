import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="py-24 px-8 md:px-16 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative w-full aspect-[3/4]">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/about.jpg`}
            alt="Smaran Harihar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-6 text-[#222222]">
          <p className="text-lg leading-relaxed">
            I am an immigrant to the USA.
          </p>
          <p className="text-lg leading-relaxed">
            Opportunities are all around and so are obstacles. Always try to
            make the most of what you got and hope for the Best. That is my
            life&apos;s motto.
          </p>
          <div className="mt-4">
            <p className="text-lg">
              <em>Much love,</em>
            </p>
            <p className="font-playfair text-7xl font-semibold mt-1 text-[#222222]">
              S
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
