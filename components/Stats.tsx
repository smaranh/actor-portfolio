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
      className="py-16 px-8 md:px-16 border-t border-b border-gray-100"
    >
      <div className="max-w-6xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-8 text-center">
          Casting
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
                {label}
              </p>
              <p className="font-playfair text-2xl font-semibold text-[#222222]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
