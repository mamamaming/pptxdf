import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config) => {
    // pdf.js worker needs to be handled — stub out Node.js canvas module
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
