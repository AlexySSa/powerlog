import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Keep the development launcher from covering the mobile navigation.
  devIndicators: false,
  turbopack: {
    root: configRoot,
  },
};

export default nextConfig;
