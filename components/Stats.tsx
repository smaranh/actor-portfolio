import FadeInOnScroll from "./FadeInOnScroll";

const stats = [
  { label: "Height", value: `6' 0"` },
  { label: "Weight", value: "185 lbs" },
  { label: "Hair Color", value: "Black" },
  { label: "Eye Color", value: "Brown" },
];

export default function Stats() {
  return (
    <section
      id="stats"
      className="py-16 px-8 md:px-16 border-t border-gray-100"
    >
      <FadeInOnScroll>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-8 text-center">
            Casting
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-gray-100 gap-y-8 md:gap-x-0 text-center">
            {stats.map(({ label, value }) => (
              <div key={label} className="md:px-4">
                <p className="text-xs uppercase tracking-widest text-gray-600 mb-2">
                  {label}
                </p>
                <p className="font-playfair text-3xl md:text-4xl font-semibold text-[#222222]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeInOnScroll>
    </section>
  );
}
