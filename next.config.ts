import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
