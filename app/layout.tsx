import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SkipLink from "@/components/SkipLink";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const siteUrl = "https://trappedactor.com";
const ogImage = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Smaran Harihar — Actor",
  description:
    "Smaran Harihar is a Los Angeles-based actor. View his reel, headshots, and credits.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: "Smaran Harihar",
    title: "Smaran Harihar — Actor",
    description:
      "Smaran Harihar is a Los Angeles-based actor. View his reel, headshots, and credits.",
    url: siteUrl,
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Smaran Harihar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smaran Harihar — Actor",
    description:
      "Smaran Harihar is a Los Angeles-based actor. View his reel, headshots, and credits.",
    images: [ogImage],
  },
  themeColor: "#222222",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "icon",
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Smaran Harihar",
  url: siteUrl,
  jobTitle: "Actor",
  sameAs: [
    "https://www.imdb.com/name/nm13154667",
    "https://www.instagram.com/trapped.actor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://i.ytimg.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#222222]">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
