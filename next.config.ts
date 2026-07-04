import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "puppeteer-core", "playwright-core"],
};

export default nextConfig;
