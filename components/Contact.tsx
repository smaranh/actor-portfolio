export default function Contact() {
  return (
    <section id="contact" className="py-24 px-8 md:px-16 bg-white text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-[#222222] mb-6">
          For all bookings contact Smaran Harihar
        </h2>
        <a
          href="mailto:trappedactor@gmail.com"
          className="text-lg text-[#222222] relative bg-[length:0%_1px] bg-no-repeat bg-bottom hover:bg-[length:100%_1px] transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(currentColor, currentColor)",
          }}
        >
          trappedactor@gmail.com
        </a>
      </div>
    </section>
  );
}
