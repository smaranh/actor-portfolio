import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/actor-portfolio" : "";

const nextConfig: NextConfig = {
  ...(isProd && {
    output: "export",
    basePath,
    assetPrefix: basePath,
  }),
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
