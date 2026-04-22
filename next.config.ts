import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProd && {
    output: "export",
    basePath: "/actor-portfolio",
    assetPrefix: "/actor-portfolio",
  }),
  images: { unoptimized: true },
};

export default nextConfig;
