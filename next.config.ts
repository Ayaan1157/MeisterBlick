import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // the old buy/rent/lease page is gone; send old links to the licences
    return [{ source: "/invest", destination: "/#pricing", permanent: true }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
