import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: {
        browser: "./lib/empty-module.ts",
      },
      path: {
        browser: "./lib/empty-module.ts",
      },
      process: {
        browser: "./lib/empty-module.ts",
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: false,
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
