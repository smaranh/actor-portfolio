const socials = [
  { label: "IMDB", href: "https://imdb.me/trappedactor" },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCCqH55zEv5Gup6OI3Z1BtpQ",
  },
  { label: "Facebook", href: "https://www.facebook.com/trappedactor/" },
  { label: "Instagram", href: "https://www.instagram.com/trappedactor/" },
  { label: "Twitter", href: "https://twitter.com/TrappedActor" },
];

export default function Footer() {
  return (
    <footer className="py-12 px-8 md:px-16 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <a
          href="mailto:trappedactor@gmail.com"
          className="text-sm text-[#222222] hover:opacity-60 transition-opacity"
        >
          trappedactor@gmail.com
        </a>
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {socials.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-[#222222] hover:opacity-60 transition-opacity"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
