type IconProps = {
  size?: number;
  "aria-hidden"?: boolean | "true" | "false";
  [k: string]: unknown;
};

const ImdbIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    {/* Simple IMDB wordmark — monochrome */}
    <path d="M14.31 9.588v.005c-.077-.048-.227-.07-.42-.07v4.815c.27 0 .44-.06.5-.165.062-.104.095-.42.095-.94V10.61c0-.43-.017-.7-.052-.822-.033-.12-.07-.18-.123-.2zM0 5.015v13.964h24V5.015H0zm5.37 9.076H3.655V9.108H5.37v4.983zm3.475 0H7.301l-.012-3.386-.44 3.386h-.61l-.464-3.326-.012 3.326H4.22V9.108h1.267l.463 3.47.44-3.47h1.455v4.983zm3.792-1.84c0 .67-.02 1.124-.062 1.357-.04.234-.127.42-.264.556-.136.135-.306.228-.51.278a3.08 3.08 0 0 1-.698.07H9.63V9.108h1.473c.35 0 .633.05.85.148.216.098.37.226.46.384.09.157.14.338.148.54.01.2.013.523.013.966v1.085zm3.995.7c0 .408-.02.692-.06.85-.04.16-.12.306-.24.44a.96.96 0 0 1-.44.252c-.18.05-.415.076-.704.076-.27 0-.49-.024-.665-.072a.98.98 0 0 1-.44-.247c-.116-.126-.193-.27-.234-.433-.04-.163-.06-.46-.06-.888V11.04c0-.39.016-.67.048-.838.032-.17.105-.316.22-.44a.95.95 0 0 1 .445-.26c.183-.057.407-.085.67-.085.263 0 .482.028.655.086a.945.945 0 0 1 .437.264c.114.127.19.274.228.44.04.166.06.443.06.833v1.957zm3.476-3.34h-1.32v.76h1.234v.96h-1.234v1.063h1.397v1.007H17.09V9.108h2.617v1.002z" />
  </svg>
);

const YoutubeIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const FacebookIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const socials = [
  { label: "IMDB", href: "https://imdb.me/trappedactor", Icon: ImdbIcon },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCCqH55zEv5Gup6OI3Z1BtpQ",
    Icon: YoutubeIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/trappedactor/",
    Icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/trappedactor/",
    Icon: InstagramIcon,
  },
  { label: "Twitter", href: "https://x.com/TrappedActor", Icon: TwitterIcon },
];

export default function Footer() {
  return (
    <footer className="py-12 px-8 md:px-16 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a
            href="mailto:trappedactor@gmail.com"
            className="text-sm text-[#222222] hover:opacity-60 transition-opacity"
          >
            trappedactor@gmail.com
          </a>
          <ul className="flex flex-wrap items-center justify-center gap-5">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#222222] hover:opacity-60 transition-opacity inline-flex"
                >
                  <Icon size={20} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between text-xs text-[#4b5563]">
          <p>© {new Date().getFullYear()} Smaran Harihar</p>
          <a href="#hero" className="hover:text-[#222222] transition-colors">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
