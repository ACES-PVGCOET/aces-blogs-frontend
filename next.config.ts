import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/writer-profile.html",
        },
        {
          source: "/profile",
          destination: "/writer-profile.html",
        },
        {
          source: "/profile/:path*",
          destination: "/writer-profile.html",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
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
